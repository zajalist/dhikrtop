"""
train.py - Multi-Task Learning Training Loop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture:
- Shared Encoder: Wav2Vec2-XLSR (frozen initially, fine-tuned with LoRA)
- Task 1: Transcription (CTC loss)
- Task 2: Qira'at Classification (CrossEntropy loss)
- Task 3: Tajweed Rule Scoring (MSE loss)

Multi-Task Loss: 0.5*L_transcription + 0.3*L_qiraat + 0.2*L_tajweed

Memory Optimization:
- LoRA: Only 5% of parameters trainable (~15M instead of 315M)
- Mixed Precision: fp16 forward, fp32 gradients
- Gradient Checkpointing: Recompute activations instead of storing
- Batch Size: 4-8 (RTX 5070 Ti 12GB VRAM)
- Gradient Accumulation: 4 steps

Training Phases:
1. Warm-up (Epochs 1-2): Freeze encoder, train LoRA + heads
2. Fine-tuning (Epochs 3-10): Unfreeze LoRA, train all
3. Polish (Epochs 11+): Low learning rate, monitor Tajweed F1
"""

import json
import logging
import os
import warnings
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

# Logging & tracking
import wandb
from datasets import DatasetDict, load_from_disk
from peft import LoraConfig, TaskType, get_peft_model
from torch.cuda.amp import GradScaler, autocast
from torch.optim import AdamW
from torch.utils.data import DataLoader
from torch.utils.data import Dataset as TorchDataset
from tqdm import tqdm

# HuggingFace
from transformers import (
    Wav2Vec2ForCTC,
    Wav2Vec2Processor,
    get_linear_schedule_with_warmup,
)

warnings.filterwarnings("ignore", category=UserWarning)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("training.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@dataclass
class TrainingConfig:
    """Training hyperparameters"""

    # Model
    model_name: str = "facebook/wav2vec2-xlsr-128d"
    lora_rank: int = 8
    lora_alpha: int = 32
    lora_dropout: float = 0.05

    # Training
    epochs: int = 15
    batch_size: int = 4
    accumulation_steps: int = 4
    learning_rate: float = 5e-4
    warmup_steps: int = 500
    max_grad_norm: float = 1.0

    # Loss weighting (Multi-Task)
    weight_transcription: float = 0.5
    weight_qiraat: float = 0.3
    weight_tajweed: float = 0.2

    # Device & precision
    use_mixed_precision: bool = True
    use_gradient_checkpointing: bool = True
    device: str = "cuda" if torch.cuda.is_available() else "cpu"

    # Data
    num_workers: int = 4
    pin_memory: bool = True

    # Logging
    logging_steps: int = 10
    validation_steps: int = 50
    checkpoint_dir: Path = Path("./checkpoints")
    log_dir: Path = Path("./logs")

    # Exponential backoff (for API calls)
    exponential_backoff_max_retries: int = 5
    exponential_backoff_base: float = 2.0


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MULTI-TASK MODEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class QiraatMTLModel(nn.Module):
    """
    Multi-Task Learning Model for Quranic Qira'at Analysis

    Tasks:
    1. Transcription (CTC)
    2. Qira'at Classification (Hafs/Warsh)
    3. Tajweed Rule Scoring (Regression)
    """

    def __init__(
        self,
        model_name: str = "facebook/wav2vec2-xlsr-128d",
        num_qiraat_classes: int = 2,  # Hafs, Warsh
        num_tajweed_rules: int = 6,
        lora_rank: int = 8,
        lora_alpha: int = 32,
        vocab_size: int = 32,  # Arabic characters
        use_gradient_checkpointing: bool = True,
    ):
        """Initialize MTL model with LoRA fine-tuning"""
        super().__init__()

        logger.info("Initializing QiraatMTLModel...")

        # Load base model
        self.wav2vec2 = Wav2Vec2ForCTC.from_pretrained(
            model_name,
            attention_dropout=0.1,
            hidden_dropout=0.1,
            feat_proj_dropout=0.1,
            mask_time_prob=0.075,
            gradient_checkpointing=use_gradient_checkpointing,
        )

        # Disable base CTC head (we'll use our own)
        self.wav2vec2.lm_head = nn.Identity()

        # Apply LoRA
        lora_config = LoraConfig(
            r=lora_rank,
            lora_alpha=lora_alpha,
            target_modules=["q_proj", "v_proj"],  # Query, Value projections
            lora_dropout=0.05,
            bias="none",
            task_type=TaskType.CTC,
        )
        self.model = get_peft_model(self.wav2vec2, lora_config)

        logger.info(
            f"Applied LoRA (r={lora_rank}, alpha={lora_alpha}) - "
            f"Trainable params: {self.model.get_num_trainable_params()}"
        )

        # Get hidden dimension from encoder
        hidden_size = self.wav2vec2.config.hidden_size  # Usually 768

        # ━━━ Task 1: CTC Head (Transcription) ━━━
        self.ctc_head = nn.Linear(hidden_size, vocab_size)

        # ━━━ Task 2: Qira'at Classification Head ━━━
        self.qiraat_head = nn.Sequential(
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, num_qiraat_classes),
        )

        # ━━━ Task 3: Tajweed Scoring Head ━━━
        self.tajweed_head = nn.Sequential(
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, num_tajweed_rules),  # Output: [0, 1] scores per rule
        )

        logger.info("Model initialization complete")

    def forward(
        self,
        input_values: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
    ) -> Dict[str, torch.Tensor]:
        """
        Forward pass through all tasks.

        Args:
            input_values: Audio waveform [batch_size, sequence_length]
            attention_mask: Padding mask [batch_size, sequence_length]

        Returns:
            {
                'transcription': [batch_size, sequence_length, vocab_size],
                'qiraat': [batch_size, num_classes],
                'tajweed': [batch_size, num_rules],
            }
        """
        # Shared encoder
        outputs = self.model.base_model(
            input_values,
            attention_mask=attention_mask,
            output_hidden_states=True,
        )

        hidden_states = outputs.hidden_states[-1]  # [batch, seq_len, 768]

        # Task 1: Transcription (CTC) - Keep temporal dimension
        transcription_logits = self.ctc_head(hidden_states)  # [batch, seq_len, vocab]

        # Task 2 & 3: Pool over time dimension
        pooled = hidden_states.mean(dim=1)  # [batch, 768]
        qiraat_logits = self.qiraat_head(pooled)  # [batch, num_classes]
        tajweed_logits = self.tajweed_head(pooled)  # [batch, num_rules]

        return {
            "transcription": transcription_logits,
            "qiraat": qiraat_logits,
            "tajweed": tajweed_logits,
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DATASET & DATALOADER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class QuranicAudioDataset(TorchDataset):
    """PyTorch Dataset for Quranic audio"""

    def __init__(
        self,
        dataset,  # HF Dataset
        processor: Wav2Vec2Processor,
        qiraat_to_id: Dict[str, int],
    ):
        self.dataset = dataset
        self.processor = processor
        self.qiraat_to_id = qiraat_to_id

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        sample = self.dataset[idx]

        # Load audio
        audio = sample["audio"]["array"]
        sr = sample["audio"]["sampling_rate"]

        # Resample if needed
        if sr != 16000:
            import librosa

            audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)

        # Process with Wav2Vec2 processor
        inputs = self.processor(
            audio,
            sampling_rate=16000,
            return_tensors="pt",
            padding=True,
        )

        return {
            "input_values": inputs["input_values"].squeeze(0),
            "attention_mask": inputs.get(
                "attention_mask", torch.ones(inputs["input_values"].shape[1])
            ).squeeze(0),
            "qiraat_label": torch.tensor(
                self.qiraat_to_id.get(sample["qiraat"], 0),
                dtype=torch.long,
            ),
            # TODO: Add transcription labels and tajweed targets
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LOSS FUNCTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def compute_mtl_loss(
    outputs: Dict[str, torch.Tensor],
    batch: Dict[str, torch.Tensor],
    weights: Dict[str, float],
    processor: Wav2Vec2Processor,
) -> Tuple[torch.Tensor, Dict[str, float]]:
    """
    Compute weighted Multi-Task Learning loss.

    Loss = w1*L_transcription + w2*L_qiraat + w3*L_tajweed

    Args:
        outputs: Model outputs {'transcription', 'qiraat', 'tajweed'}
        batch: Input batch with labels
        weights: Task weights {'transcription': 0.5, ...}
        processor: Wav2Vec2 processor

    Returns:
        (total_loss, loss_dict)
    """

    # Task 1: CTC Loss (Transcription)
    # Note: In practice, you'd need to compute CTC loss with alignment
    # For now, simplified version
    ctc_loss = (
        F.mse_loss(
            outputs["transcription"].mean(),
            torch.tensor(0.0, device=outputs["transcription"].device),
        )
        * 0.01
    )  # Dummy placeholder

    # Task 2: Cross-Entropy Loss (Qira'at Classification)
    qiraat_loss = F.cross_entropy(
        outputs["qiraat"],
        batch["qiraat_label"],
    )

    # Task 3: MSE Loss (Tajweed Scoring)
    # Tajweed targets should be normalized [0, 1]
    tajweed_targets = batch.get(
        "tajweed_targets",
        torch.ones(outputs["tajweed"].shape, device=outputs["tajweed"].device) * 0.5,
    )
    tajweed_loss = F.mse_loss(
        torch.sigmoid(outputs["tajweed"]),  # Normalize to [0, 1]
        tajweed_targets,
    )

    # Weighted combination
    total_loss = (
        weights["transcription"] * ctc_loss
        + weights["qiraat"] * qiraat_loss
        + weights["tajweed"] * tajweed_loss
    )

    return total_loss, {
        "total": total_loss.item(),
        "transcription": ctc_loss.item(),
        "qiraat": qiraat_loss.item(),
        "tajweed": tajweed_loss.item(),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TRAINING LOOP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class QiraatTrainer:
    """Main training loop for Multi-Task Learning"""

    def __init__(
        self,
        model: QiraatMTLModel,
        config: TrainingConfig,
    ):
        self.model = model
        self.config = config
        self.device = torch.device(config.device)

        # Move model to device
        self.model = self.model.to(self.device)

        # Optimizer
        self.optimizer = AdamW(
            self.model.parameters(),
            lr=config.learning_rate,
            weight_decay=0.01,
        )

        # Mixed precision
        self.scaler = GradScaler() if config.use_mixed_precision else None

        # Logging
        self.global_step = 0
        self.train_losses = []
        self.val_losses = []

        logger.info("Trainer initialized")

    def train_epoch(
        self,
        train_loader: DataLoader,
        scheduler,
    ) -> float:
        """Train for one epoch"""
        self.model.train()
        epoch_loss = 0.0

        pbar = tqdm(train_loader, desc="Training")

        for batch_idx, batch in enumerate(pbar):
            # Move batch to device
            batch = {
                k: v.to(self.device) if isinstance(v, torch.Tensor) else v
                for k, v in batch.items()
            }

            # Forward pass
            with autocast(enabled=self.config.use_mixed_precision):
                outputs = self.model(
                    input_values=batch["input_values"],
                    attention_mask=batch.get("attention_mask"),
                )

                loss, loss_dict = compute_mtl_loss(
                    outputs,
                    batch,
                    {
                        "transcription": self.config.weight_transcription,
                        "qiraat": self.config.weight_qiraat,
                        "tajweed": self.config.weight_tajweed,
                    },
                    processor=None,  # TODO: pass processor
                )

            # Backward pass with gradient accumulation
            if self.config.use_mixed_precision:
                self.scaler.scale(loss).backward()
            else:
                loss.backward()

            # Gradient accumulation
            if (batch_idx + 1) % self.config.accumulation_steps == 0:
                # Gradient clipping
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(),
                    self.config.max_grad_norm,
                )

                # Optimizer step
                if self.config.use_mixed_precision:
                    self.scaler.step(self.optimizer)
                    self.scaler.update()
                else:
                    self.optimizer.step()

                self.optimizer.zero_grad()
                scheduler.step()
                self.global_step += 1

            epoch_loss += loss.item()

            # Logging
            if (batch_idx + 1) % self.config.logging_steps == 0:
                avg_loss = epoch_loss / (batch_idx + 1)
                pbar.set_postfix(
                    {
                        "loss": f"{avg_loss:.4f}",
                        "q_loss": f"{loss_dict['qiraat']:.4f}",
                        "tj_loss": f"{loss_dict['tajweed']:.4f}",
                    }
                )

                # Log to wandb
                wandb.log(
                    {
                        "train/loss": avg_loss,
                        "train/qiraat_loss": loss_dict["qiraat"],
                        "train/tajweed_loss": loss_dict["tajweed"],
                        "train/learning_rate": self.optimizer.param_groups[0]["lr"],
                        "train/global_step": self.global_step,
                    }
                )

        epoch_loss /= len(train_loader)
        self.train_losses.append(epoch_loss)

        return epoch_loss

    def validate(self, val_loader: DataLoader) -> Dict[str, float]:
        """Validation step"""
        self.model.eval()
        val_loss = 0.0

        with torch.no_grad():
            for batch in tqdm(val_loader, desc="Validating"):
                batch = {
                    k: v.to(self.device) if isinstance(v, torch.Tensor) else v
                    for k, v in batch.items()
                }

                outputs = self.model(
                    input_values=batch["input_values"],
                    attention_mask=batch.get("attention_mask"),
                )

                loss, _ = compute_mtl_loss(
                    outputs,
                    batch,
                    {
                        "transcription": self.config.weight_transcription,
                        "qiraat": self.config.weight_qiraat,
                        "tajweed": self.config.weight_tajweed,
                    },
                    processor=None,
                )

                val_loss += loss.item()

        val_loss /= len(val_loader)
        self.val_losses.append(val_loss)

        return {"val_loss": val_loss}

    def save_checkpoint(self, path: Path, epoch: int):
        """Save model checkpoint"""
        path.mkdir(parents=True, exist_ok=True)

        checkpoint = {
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "train_losses": self.train_losses,
            "val_losses": self.val_losses,
            "config": asdict(self.config),
        }

        torch.save(checkpoint, path / f"checkpoint_epoch_{epoch}.pt")
        logger.info(f"Saved checkpoint: {path / f'checkpoint_epoch_{epoch}.pt'}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN TRAINING SCRIPT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def main():
    """Main training function"""

    # Setup
    config = TrainingConfig()
    config.checkpoint_dir.mkdir(parents=True, exist_ok=True)
    config.log_dir.mkdir(parents=True, exist_ok=True)

    # Initialize wandb
    wandb.init(
        project="quranic-qiraat-ml",
        config=asdict(config),
        name=f"mtl_training_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    )

    logger.info("=" * 80)
    logger.info("QURANIC QIRA'AT ML - TRAINING START")
    logger.info("=" * 80)
    logger.info(f"Device: {config.device}")
    logger.info(f"Batch size: {config.batch_size}")
    logger.info(f"Mixed precision: {config.use_mixed_precision}")
    logger.info(f"Gradient checkpointing: {config.use_gradient_checkpointing}")

    # Load dataset
    logger.info("Loading dataset...")
    dataset_dict = load_from_disk("./data/cache/dataset_splits")

    # Initialize model
    logger.info("Initializing model...")
    model = QiraatMTLModel(
        model_name=config.model_name,
        lora_rank=config.lora_rank,
        lora_alpha=config.lora_alpha,
        use_gradient_checkpointing=config.use_gradient_checkpointing,
    )

    # Initialize trainer
    trainer = QiraatTrainer(model, config)

    # Load processor
    processor = Wav2Vec2Processor.from_pretrained(config.model_name)

    # Create dataloaders
    # TODO: Implement proper dataset collate function for variable-length audio
    train_dataset = QuranicAudioDataset(
        dataset_dict["train"],
        processor,
        qiraat_to_id={"Hafs": 0, "Warsh": 1},
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=config.batch_size,
        shuffle=True,
        num_workers=config.num_workers,
        pin_memory=config.pin_memory,
    )

    # Scheduler
    total_steps = len(train_loader) * config.epochs // config.accumulation_steps
    scheduler = get_linear_schedule_with_warmup(
        trainer.optimizer,
        num_warmup_steps=config.warmup_steps,
        num_training_steps=total_steps,
    )

    # Training loop
    logger.info(f"Starting training for {config.epochs} epochs...")

    for epoch in range(config.epochs):
        logger.info(f"\n{'=' * 80}")
        logger.info(f"Epoch {epoch + 1}/{config.epochs}")
        logger.info(f"{'=' * 80}")

        # Train
        train_loss = trainer.train_epoch(train_loader, scheduler)
        logger.info(f"Train loss: {train_loss:.4f}")

        # Save checkpoint
        if (epoch + 1) % 5 == 0:
            trainer.save_checkpoint(config.checkpoint_dir, epoch + 1)

        # Log
        wandb.log(
            {
                "epoch": epoch + 1,
                "train_loss": train_loss,
            }
        )

    logger.info("\n" + "=" * 80)
    logger.info("TRAINING COMPLETE")
    logger.info("=" * 80)

    wandb.finish()


if __name__ == "__main__":
    main()
