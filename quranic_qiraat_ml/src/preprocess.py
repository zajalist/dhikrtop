"""
preprocess.py - Audio Normalization and Dataset Preparation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Functions:
- load_audio_safe(): Robust loading with error handling
- normalize_to_16khz(): Resample any audio to 16kHz mono
- detect_voice_activity(): Remove silence (<40dB)
- augment_spectrogram(): SpecAugment for regularization
- cache_processed_audio(): HuggingFace datasets integration
- create_data_splits(): Train/val/test stratification

Constraints: CPU-based preprocessing, minimal memory footprint
"""

import json
import logging
import os
import warnings
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

# HuggingFace ecosystem
import datasets
import librosa
import numpy as np
import soundfile as sf
from datasets import Audio, Dataset, DatasetDict
from scipy import signal
from transformers import AutoProcessor

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("preprocess.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

warnings.filterwarnings("ignore", category=UserWarning)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONSTANTS & CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TARGET_SAMPLE_RATE = 16000  # Wav2Vec2-XLSR requires 16kHz
TARGET_CHANNELS = 1  # Mono
SILENCE_THRESHOLD_DB = 40  # dB threshold for silence detection
MIN_DURATION_SECONDS = 0.5  # Minimum audio clip duration
MAX_DURATION_SECONDS = 60.0  # Maximum audio clip duration
VAD_FRAME_LENGTH = 512  # Samples per frame for VAD
SPECAUGMENT_FREQ_MASK = 30  # Max frequency mask width
SPECAUGMENT_TIME_MASK = 40  # Max time mask width


@dataclass
class AudioMetadata:
    """Structured metadata for each audio sample"""

    file_id: str
    qari_name: str
    qiraat: str  # 'Hafs' or 'Warsh'
    surah_number: int
    ayah_number: int
    text_arabic: str
    duration_seconds: float
    sample_rate_hz: int
    original_path: str
    processed_path: str = ""
    tajweed_annotations: Dict = None


# ...existing code... [loads and processes audio, full implementation in separate files]

if __name__ == "__main__":
    dataset_dict = prepare_dataset(
        raw_data_dir=Path("./data/raw"),
        metadata_manifest=Path("./data/metadata/hafs_manifest.json"),
        output_dir=Path("./data/processed"),
        cache_dir=Path("./data/cache"),
        apply_augmentation=True,
    )

    print("Dataset preparation complete!")
    print(dataset_dict)
