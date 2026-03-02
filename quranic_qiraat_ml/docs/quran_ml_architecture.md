# Quranic Qira'at ML Architecture
## Multi-Task Learning for Hafs/Warsh Differentiation & Tajweed Rule Verification

**Date**: March 1, 2026  
**Target Hardware**: RTX 5070 Ti (12GB VRAM)  
**Primary Model**: Wav2Vec2-XLSR (with LoRA fine-tuning)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    QURANIC QIRA'AT ML SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INPUT LAYER (Audio)                                             │
│  ├─ Raw Quranic Audio (MP3/WAV)                                 │
│  ├─ Metadata: Qari, Qira'at variant, Surah/Ayah                 │
│  └─ Sample Rate: Variable → Normalized to 16kHz mono            │
│                                                                   │
│  PREPROCESSING PIPELINE (preprocess.py)                          │
│  ├─ Audio Normalization (16kHz mono, [-1, 1] range)            │
│  ├─ Voice Activity Detection (VAD)                              │
│  ├─ Silence Removal (<40dB segments)                            │
│  ├─ Spectral Augmentation (SpecAugment)                         │
│  └─ Dataset Caching (HF datasets + local cache)                 │
│                                                                   │
│  MULTI-TASK LEARNING ARCHITECTURE (train.py)                    │
│  ├─ Shared Encoder: Wav2Vec2-XLSR                              │
│  │  └─ LoRA Adapters (r=8, alpha=32, target=q_proj,v_proj)   │
│  │                                                               │
│  ├─ Task 1: Quranic Transcription (CTC Loss)                   │
│  │  └─ Arabic character output (Harakah-aware)                 │
│  │                                                               │
│  ├─ Task 2: Qira'at Classification (Cross-Entropy)             │
│  │  ├─ Hafs (Most common reading)                              │
│  │  ├─ Warsh (North African variant)                           │
│  │  └─ [Expandable to: Qalun, Ad-Duri, etc.]                   │
│  │                                                               │
│  └─ Task 3: Tajweed Rule Scoring (Regression/Classification)   │
│     ├─ Ghunnah Duration (20-60ms variance)                      │
│     ├─ Idgham Detection (3 types)                               │
│     ├─ Imalah Presence (binary)                                 │
│     └─ [Rules module: tajweed_rules.py]                         │
│                                                                   │
│  LOSS FUNCTION (Weighted Multi-Task)                             │
│  ├─ L_transcription = CTC(predictions, labels)  [weight: 0.5]   │
│  ├─ L_qiraat = CrossEntropy(qiraat_logits)      [weight: 0.3]   │
│  ├─ L_tajweed = MSE(tajweed_scores)             [weight: 0.2]   │
│  └─ L_total = 0.5*L_t + 0.3*L_q + 0.2*L_tj                      │
│                                                                   │
│  MEMORY OPTIMIZATION                                             │
│  ├─ Mixed Precision (torch.float16)                             │
│  ├─ Gradient Checkpointing (recompute activations)              │
│  ├─ LoRA instead of full fine-tuning (~5% params trainable)    │
│  ├─ Batch Size: 4-8 (depends on sequence length)               │
│  └─ Gradient Accumulation: 4 steps                              │
│                                                                   │
│  OUTPUT LAYER                                                    │
│  ├─ Transcription: Arabic text + confidence scores              │
│  ├─ Qira'at: [Hafs/Warsh] + probability distribution            │
│  ├─ Tajweed Rules: {rule_name: score, violations: [...]}       │
│  └─ JSON Export for downstream tasks                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
quranic_qiraat_ml/
│
├── data/
│   ├── raw/                          # Original audio files
│   │   ├── hafs/                     # Hafs recitation samples
│   │   │   ├── 001_001_hafs.wav
│   │   │   └── ...
│   │   └── warsh/                    # Warsh recitation samples
│   │       ├── 001_001_warsh.wav
│   │       └── ...
│   ├── processed/                    # Normalized audio cache
│   ├── metadata/
│   │   ├── hafs_manifest.json        # Qari info, duration, etc.
│   │   ├── warsh_manifest.json
│   │   └── tajweed_annotations.json  # Ground truth Tajweed rules
│   └── splits/
│       ├── train.txt                 # Training file paths
│       ├── val.txt
│       └── test.txt
│
├── src/
│   ├── __init__.py
│   ├── preprocess.py                 # Audio normalization, VAD, caching
│   ├── tajweed_rules.py              # Rule detection, scoring, validation
│   ├── models.py                     # MTL architecture definition
│   ├── train.py                      # Training loop, mixed precision, logging
│   ├── inference.py                  # Batch inference, post-processing
│   └── utils.py                      # Helpers, metrics, dataset loading
│
├── configs/
│   ├── base_config.yaml              # Default hyperparameters
│   └── rtx5070_optimized.yaml        # GPU-specific settings
│
├── checkpoints/                      # Model weights & LoRA adapters
│   ├── wav2vec2_xlsr_base/
│   ├── lora_adapters/
│   └── best_model.pt
│
├── logs/
│   ├── training_log.csv
│   └── wandb/                        # Weights & Biases experiments
│
├── scripts/
│   ├── download_dataset.py           # Fetch from Quranic repositories
│   ├── prepare_splits.py             # Train/val/test division
│   └── evaluate.py                   # Metrics & error analysis
│
├── tests/
│   ├── test_preprocess.py
│   ├── test_tajweed.py
│   └── test_inference.py
│
├── requirements.txt
├── README.md
└── quran_ml_architecture.md           # This file
```

---

## 3. Core Modules Description

### 3.1 `preprocess.py`
**Purpose**: Audio normalization and dataset preparation

**Key Functions**:
- `load_audio_safe()` - Robust audio loading with error handling
- `normalize_to_16khz()` - Resample any audio to 16kHz mono
- `detect_voice_activity()` - Remove silence (< 40dB)
- `augment_spectrogram()` - SpecAugment for regularization
- `cache_processed_audio()` - HuggingFace datasets integration
- `create_data_splits()` - Train/val/test stratification by Qira'at

**VRAM Impact**: Minimal (preprocessing happens on CPU before training)

---

### 3.2 `tajweed_rules.py`
**Purpose**: Rule detection and scoring (post-process or within MTL task)

**Key Functions**:
- `detect_ghunnah()` - Duration analysis of nasal sounds (20-60ms variance)
- `detect_idgham()` - 3 types: Perfect, Nasalization, Partial
- `detect_imalah()` - Alef/Ya vowel shifting (Warsh-specific)
- `detect_lam_tafkhim()` - Lam emphasis rules
- `validate_tajweed()` - Cross-reference against canonical rules
- `score_tajweed_accuracy()` - Output: {rule: score_0_to_100}

**Islamic Standards**:
- Reference: Traditional Tajweed books (Ibn Al-Jazari, etc.)
- Ghunnah duration: Hafs ~30-40ms, Warsh ~40-60ms
- Idgham: 7 consonant pairs with specific rules
- Imalah: Primary differentiator between Hafs/Warsh

---

### 3.3 `train.py`
**Purpose**: Training loop with MTL, mixed precision, VRAM optimization

**Key Features**:
- **LoRA Fine-tuning**: Only 5% of parameters trainable
- **Mixed Precision**: fp16 for forward pass, fp32 for gradients
- **Gradient Checkpointing**: Recompute activations instead of storing
- **Batch Size Adaptation**: Auto-detect max batch size for GPU
- **Multi-Task Loss Weighting**: Configurable task weights
- **Early Stopping**: Monitor validation loss + Tajweed F1
- **Exponential Backoff**: For dataset API calls

**VRAM Breakdown (RTX 5070 Ti - 12GB)**:
- Model weights: ~2.5GB (Wav2Vec2-XLSR base + LoRA)
- Activations (batch=4): ~3.5GB
- Optimizer states: ~2GB
- Cache & misc: ~1.5GB
- **Total**: ~9.5GB (safe margin to 12GB limit)

---

## 4. Multi-Task Learning Architecture (Detailed)

```python
class QiraatMTLModel(nn.Module):
    def __init__(self):
        # Shared encoder: Wav2Vec2-XLSR
        self.wav2vec2 = Wav2Vec2ForCTC.from_pretrained(
            'facebook/wav2vec2-xlsr-128d',
            attention_dropout=0.1,
            hidden_dropout=0.1,
            feat_proj_dropout=0.1,
            mask_time_prob=0.075,
            gradient_checkpointing=True,
        )
        
        # Apply LoRA to specific layers
        target_modules = ["q_proj", "v_proj"]  # Query and Value projections
        self.lora_config = LoraConfig(
            r=8,  # LoRA rank
            lora_alpha=32,
            target_modules=target_modules,
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM",
        )
        self.model = get_peft_model(self.wav2vec2, self.lora_config)
        
        # Task 1: CTC Head (Transcription)
        self.ctc_head = nn.Linear(768, num_ctc_vocab)
        
        # Task 2: Qira'at Classification Head
        self.qiraat_head = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, num_qiraat_classes),  # 2 for Hafs/Warsh
        )
        
        # Task 3: Tajweed Rule Scoring Head
        self.tajweed_head = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, num_tajweed_rules),  # e.g., 8 rules
        )
    
    def forward(self, input_values, attention_mask=None):
        outputs = self.model(
            input_values,
            attention_mask=attention_mask,
            output_hidden_states=True,
        )
        
        hidden_states = outputs.hidden_states[-1]  # Last layer
        
        # Task outputs
        transcription_logits = self.ctc_head(hidden_states)
        qiraat_logits = self.qiraat_head(hidden_states.mean(dim=1))  # Pool
        tajweed_logits = self.tajweed_head(hidden_states.mean(dim=1))
        
        return {
            'transcription': transcription_logits,
            'qiraat': qiraat_logits,
            'tajweed': tajweed_logits,
        }
```

---

## 5. Loss Function & Weighting

```python
def compute_mtl_loss(outputs, batch, weights={'transcription': 0.5, 'qiraat': 0.3, 'tajweed': 0.2}):
    """
    Multi-Task Learning Loss
    
    Total Loss = 0.5 * L_transcription + 0.3 * L_qiraat + 0.2 * L_tajweed
    """
    
    # Task 1: CTC Loss (Transcription)
    ctc_loss = compute_ctc_loss(
        outputs['transcription'],
        batch['transcript_ids'],
        batch['input_length'],
        batch['transcript_length'],
    )
    
    # Task 2: Cross-Entropy Loss (Qira'at Classification)
    ce_loss = F.cross_entropy(
        outputs['qiraat'],
        batch['qiraat_labels'],  # 0=Hafs, 1=Warsh
    )
    
    # Task 3: MSE Loss (Tajweed Rule Scoring)
    tajweed_loss = F.mse_loss(
        outputs['tajweed'],
        batch['tajweed_targets'],  # Normalized [0, 1]
    )
    
    # Weighted combination
    total_loss = (
        weights['transcription'] * ctc_loss +
        weights['qiraat'] * ce_loss +
        weights['tajweed'] * tajweed_loss
    )
    
    return {
        'total': total_loss,
        'transcription': ctc_loss,
        'qiraat': ce_loss,
        'tajweed': tajweed_loss,
    }
```

---

## 6. Computational Requirements

| Component | VRAM | Description |
|-----------|------|-------------|
| **Wav2Vec2-XLSR (frozen)** | 2.5GB | Base model + LoRA adapters |
| **Activations (batch=4)** | 3.5GB | Forward pass caching |
| **Optimizer States** | 2.0GB | AdamW state tensors |
| **Gradient Buffer** | 1.0GB | Gradient accumulation |
| **Cache & Misc** | 0.5GB | PyTorch overhead |
| **TOTAL** | ~9.5GB | Safe for RTX 5070 Ti (12GB) |

**Optimization Techniques**:
1. LoRA: Reduces trainable params from 315M → 15M (~5%)
2. Gradient Checkpointing: Trade compute for memory
3. Mixed Precision (fp16): Halves activation memory
4. Batch Size: 4-8 (not 32 like cloud setups)
5. Gradient Accumulation: 4 steps = effective batch 16-32

---

## 7. Training Strategy

### Phase 1: Warm-up (Epoch 1-2)
- Freeze Wav2Vec2 encoder
- Train only LoRA adapters + heads
- Learning rate: 1e-4

### Phase 2: Fine-tuning (Epoch 3-10)
- Unfreeze LoRA adapters
- Train all heads
- Learning rate: 5e-5 (with cosine annealing)

### Phase 3: Polish (Epoch 11+)
- LoRA + heads
- Learning rate: 1e-5
- Monitor Tajweed F1 metric

---

## 8. Evaluation Metrics

### Task 1: Transcription
- **WER (Word Error Rate)**: % of words incorrect
- **CER (Character Error Rate)**: % of characters incorrect

### Task 2: Qira'at Classification
- **Accuracy**: % correctly classified as Hafs/Warsh
- **F1-Score**: Balanced metric for imbalanced data
- **Confusion Matrix**: Hafs → Warsh errors

### Task 3: Tajweed Rules
- **Per-Rule F1**: For each Tajweed rule
- **Ghunnah Duration MAE**: < 10ms error
- **Overall Tajweed Accuracy**: % rules correctly identified

---

## 9. Data Standards & Authenticity

### Quranic Data Sources (Priority Order)
1. **Quran.com API** - Official, 30+ Qaris
2. **Quranic Audio Project** - Free, 50+ variants
3. **Tarteel AI** - Commercial but high-quality
4. **QCRI Arabic Speech Corpus** - Research dataset

### Metadata Requirements
Each audio sample MUST include:
```json
{
  "file_id": "001_001_hafs",
  "qari_name": "Abdul Basit",
  "qira'at": "Hafs",
  "surah_number": 1,
  "ayah_number": 1,
  "text_arabic": "بسم الله الرحمن الرحيم",
  "duration_seconds": 4.2,
  "sample_rate_hz": 44100,
  "tajweed_annotations": {
    "hafs_specific_rules": ["Idgham (nasal)", "Ghunnah"],
    "warsh_specific_rules": ["Imalah", "Idgham (nasal)"]
  }
}
```

### Tajweed Rule Definitions (Canonical)
- **Ghunnah**: Nasal resonance in Meem/Noon (20-60ms)
- **Idgham**: 3 types (Perfect, Nasal, Partial) — 7 consonant pairs
- **Imalah**: Alef/Ya vowel shifting (Warsh: strong, Hafs: weak)
- **Lam Tafkhim**: Emphasis on Lam after Damma (Hafs-specific)
- **Qasr vs. Madd**: Short vs. long vowels (duration-based)

---

## 10. Inference Pipeline

```
Audio Input (any format)
    ↓
[preprocess.py] Normalize to 16kHz mono
    ↓
[train.py] MTL Model Forward Pass
    ↓
├─ Transcription logits → CTC decode → Arabic text
├─ Qira'at logits → softmax → Hafs/Warsh probability
└─ Tajweed logits → threshold → Rule violations
    ↓
[tajweed_rules.py] Post-process & validate
    ↓
Output JSON
{
  "transcript": "بسم الله الرحمن الرحيم",
  "qiraat": {
    "hafs_probability": 0.95,
    "warsh_probability": 0.05,
    "predicted_variant": "Hafs"
  },
  "tajweed": {
    "ghunnah_score": 92,
    "idgham_score": 88,
    "imalah_score": 78,
    "violations": [
      {"rule": "Idgham", "severity": "minor", "ayah": "1:1"}
    ]
  },
  "confidence": 0.89
}
```

---

## 11. Hardware Checklist (RTX 5070 Ti)

- ✅ 12GB VRAM (sufficient for batch=4)
- ✅ CUDA Compute Capability 9.0+ (RTX 50-series)
- ✅ Mixed precision (fp16) support
- ✅ NCCL for multi-GPU (if needed)
- ✅ cuDNN 8.9+ recommended

**Installation**:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers datasets peft bitsandbytes wandb librosa soundfile
```

---

## 12. Development Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **1. Setup** | Week 1 | preprocess.py, data pipeline |
| **2. Architecture** | Week 2 | train.py, MTL model, tajweed_rules.py |
| **3. Training** | Week 3-4 | First checkpoint, benchmark metrics |
| **4. Optimization** | Week 5 | Quantization, API integration |
| **5. Deployment** | Week 6+ | Inference API, gradio demo |

---

**Created**: March 1, 2026  
**Status**: Architecture Blueprint Complete  
**Next**: Implement preprocess.py, tajweed_rules.py, train.py
