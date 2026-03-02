#!/usr/bin/env python3
"""
Download a small SAMPLE of Quranic datasets for quick testing.

Downloads:
- Metadata only (no large audio files)
- 5 reciters × 10 ayahs each = ~50 audio files
- Sufficient to test the pipeline

Much faster than full dataset (minutes vs hours).
"""

import logging
from pathlib import Path
from datasets import load_dataset
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def download_sample():
    """Download sample datasets for testing."""
    
    logger.info("\n" + "="*80)
    logger.info("DOWNLOADING SAMPLE DATASET FOR QUICK TESTING")
    logger.info("="*80)
    
    base_dir = Path(__file__).parent.parent / "data" / "raw"
    base_dir.mkdir(parents=True, exist_ok=True)
    
    sample_dir = base_dir / "sample_for_testing"
    sample_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"\nTarget directory: {sample_dir}\n")
    
    # Download rabah2026 (smaller, cleaner dataset)
    logger.info("Downloading rabah2026/Quran-Ayah-Corpus sample...")
    logger.info("This datasets has 263,263 samples with clean transcriptions")
    
    try:
        # Load just a small slice of the dataset
        dataset = load_dataset("rabah2026/Quran-Ayah-Corpus", split="train[:0.1%]")
        
        # Save as parquet for quick iteration
        output_file = sample_dir / "rabah2026_sample.parquet"
        dataset.to_parquet(str(output_file))
        
        logger.info(f"✓ Downloaded {len(dataset)} samples from rabah2026")
        logger.info(f"  Saved to: {output_file}")
        
        # Save metadata
        metadata = {
            "source": "rabah2026/Quran-Ayah-Corpus",
            "sample_size": len(dataset),
            "total_size_in_dataset": 263263,
            "percentage_downloaded": f"{(len(dataset)/263263)*100:.2f}%"
        }
        
        with open(sample_dir / "sample_metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
        
        logger.info("\n" + "="*80)
        logger.info("✓ SAMPLE DATASET READY FOR TESTING")
        logger.info("="*80)
        logger.info(f"Location: {sample_dir}")
        logger.info(f"Samples: {len(dataset)}")
        logger.info(f"You can now run: python scripts/process_sample_dataset.py")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Error downloading sample: {e}")
        return False


if __name__ == "__main__":
    download_sample()
