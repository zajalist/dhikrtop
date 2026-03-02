#!/usr/bin/env python3
"""
Quick installation of Quranic datasets with smaller file sizes.

This script downloads specific reciter's audio in smaller chunks
to avoid huge TAR file downloads.

For production: Use HuggingFace datasets library to stream data on-the-fly.
"""

import os
import json
import logging
from pathlib import Path
from typing import List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def setup_test_dataset():
    """Create a minimal test dataset structure."""
    logger.info("\n" + "="*80)
    logger.info("SETTING UP MINIMAL TEST DATASET")
    logger.info("="*80)
    
    raw_dir = Path(__file__).parent.parent / "data" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    
    # Create minimal structure for each dataset
    datasets_info = {
        "buraaq": {
            "url": "https://huggingface.co/datasets/Buraaq/quran-audio-text-dataset",
            "size": "~150-200 GB",
            "type": "Full Quran (30 reciters, with Warsh)",
            "download_instruction": "Use: huggingface_hub snapshot_download --repo-type dataset Buraaq/quran-audio-text-dataset"
        },
        "rabah2026": {
            "url": "https://huggingface.co/datasets/rabah2026/Quran-Ayah-Corpus",
            "size": "~144 GB",
            "type": "Multi-reciter ASR dataset (44 reciters, Hafs only)",
            "download_instruction": "Use: huggingface_hub snapshot_download --repo-type dataset rabah2026/Quran-Ayah-Corpus"
        },
        "obadx": {
            "url": "https://huggingface.co/datasets/obadx/mualem-recitations-original",
            "size": "Variable (depends on audio files)",
            "type": "Detailed tajweed annotations (49 Moshaf variants)",
            "download_instruction": "Use: huggingface_hub snapshot_download --repo-type dataset obadx/mualem-recitations-original"
        },
        "crowdsourced": {
            "url": "https://quranic-audio-dataset.github.io/",
            "size": "Variable",
            "type": "Non-native speaker recitations (learners)",
            "download_instruction": "Use: huggingface_hub snapshot_download --repo-type dataset RetaSy/quranic_audio_dataset"
        }
    }
    
    # Create metadata for each dataset
    for dataset_name, info in datasets_info.items():
        dataset_dir = raw_dir / dataset_name
        dataset_dir.mkdir(parents=True, exist_ok=True)
        
        metadata = {
            "name": dataset_name,
            "url": info["url"],
            "size": info["size"],
            "type": info["type"],
            "download_status": "NOT DOWNLOADED - VERY LARGE FILES",
            "download_instruction": info["download_instruction"],
            "note": "These are huge datasets (100-200GB each). Download as needed."
        }
        
        metadata_path = dataset_dir / "metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"✓ Created {dataset_name} metadata")
    
    return raw_dir


def create_download_instructions():
    """Create a guide for downloading via CLI."""
    base_dir = Path(__file__).parent.parent / "data"
    guide_path = base_dir / "DOWNLOAD_DATASETS.md"
    
    content = """# Download Quranic Audio Datasets

These datasets are **VERY LARGE** (100-200 GB each). Download only what you need.

## Option 1: Using HuggingFace Command Line (Recommended)

Install the HuggingFace Hub CLI:
```bash
pip install huggingface-hub
```

### Download Individual Datasets

#### Buraaq (30 reciters, both Hafs & Warsh)
```bash
huggingface-cli download \\
  --repo-type dataset \\
  --local-dir ./data/raw/buraaq \\
  Buraaq/quran-audio-text-dataset
```

#### rabah2026 (44 reciters, Hafs only, ASR-ready)
```bash
huggingface-cli download \\
  --repo-type dataset \\
  --local-dir ./data/raw/rabah2026 \\
  rabah2026/Quran-Ayah-Corpus
```

#### obadx (Detailed tajweed annotations)
```bash
huggingface-cli download \\
  --repo-type dataset \\
  --local-dir ./data/raw/obadx \\
  obadx/mualem-recitations-original
```

#### Crowdsourced (Non-native learners)
```bash
huggingface-cli download \\
  --repo-type dataset \\
  --local-dir ./data/raw/crowdsourced \\
  RetaSy/quranic_audio_dataset
```

## Option 2: Using Python

```python
from huggingface_hub import snapshot_download

# Buraaq
snapshot_download(
    repo_id="Buraaq/quran-audio-text-dataset",
    repo_type="dataset",
    local_dir="./data/raw/buraaq"
)

# rabah2026
snapshot_download(
    repo_id="rabah2026/Quran-Ayah-Corpus",
    repo_type="dataset",
    local_dir="./data/raw/rabah2026"
)
```

## Option 3: Streaming without Full Download

For testing, you can load datasets on-the-fly without downloading:

```python
from datasets import load_dataset

# Stream Buraaq data
# This loads ayahs directly without downloading all 150GB
ds = load_dataset("Buraaq/quran-md-ayahs", streaming=True)

# Stream rabah2026
ds = load_dataset("rabah2026/Quran-Ayah-Corpus", streaming=True)
```

## Dataset Sizes

| Dataset | Size | Reciters | Qira'at | Best For |
|---------|------|----------|---------|----------|
| Buraaq | 150-200 GB | 30 | Hafs + Warsh | Complete Quran coverage |
| rabah2026 | 144 GB | 44 | Hafs | ASR training (clean data) |
| obadx | Variable | Variable | Both | Tajweed rules (detailed annotations) |
| Crowdsourced | Variable | Multiple | Various | Robustness testing |

## Storage Requirements

- One dataset: 100-200 GB
- Two datasets: 250-350 GB  
- All four: 400+ GB (not recommended)

**Recommendation**: Start with one dataset (suggest `rabah2026` for clean ASR data or `Buraaq` for complete coverage).

## Note on Network

These are **large network downloads**. Use:
- Wired connection (not WiFi) if possible
- Leave the download running overnight
- Use a VPN if downloads are slow in your region
"""
    
    with open(guide_path, 'w') as f:
        f.write(content)
    
    logger.info(f"\n✓ Download guide created: {guide_path}")


def main():
    """Main setup function."""
    logger.info("\n" + "█"*80)
    logger.info("█ QURANIC DATASET INSTALLATION SETUP")
    logger.info("█"*80)
    
    # Setup metadata structure
    raw_dir = setup_test_dataset()
    
    # Create download instructions
    create_download_instructions()
    
    logger.info("\n" + "█"*80)
    logger.info("█ SETUP COMPLETE")
    logger.info("█"*80)
    
    logger.info(f"""
✓ Dataset directories created at:
  {raw_dir}

📖 Download instructions available at:
  {raw_dir.parent / 'DOWNLOAD_DATASETS.md'}

⚠️  IMPORTANT: Datasets are NOT downloaded automatically (they are 100-200 GB each)

To download datasets, choose one of:

1️⃣  Using command line (RECOMMENDED):
   huggingface-cli download --repo-type dataset \\
     --local-dir ./data/raw/buraaq \\
     Buraaq/quran-audio-text-dataset

2️⃣  Using Python:
   from huggingface_hub import snapshot_download
   snapshot_download(repo_id="Buraaq/quran-audio-text-dataset", ...)

3️⃣  Streaming (no download, slower but practical):
   from datasets import load_dataset
   ds = load_dataset("Buraaq/quran-md-ayahs", streaming=True)

See DOWNLOAD_DATASETS.md for complete instructions.
""")


if __name__ == "__main__":
    main()
