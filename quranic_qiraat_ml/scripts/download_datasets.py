#!/usr/bin/env python3
"""
Download and organize Quranic audio datasets into the raw folder.

This script downloads from:
1. Buraaq/quran-audio-text-dataset (HuggingFace)
2. rabah2026/Quran-Ayah-Corpus (HuggingFace)
3. obadx/mualem-recitations-original (HuggingFace)
4. quranic-audio-dataset.github.io (Crowdsourced)

All datasets are organized into:
  data/raw/
    ├── buraaq/
    ├── rabah2026/
    ├── obadx/
    └── crowdsourced/
"""

import os
import json
import logging
from pathlib import Path
from typing import Optional
import subprocess
import sys

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class QuranicDatasetDownloader:
    """Download and organize Quranic datasets."""
    
    def __init__(self, base_dir: Path = None):
        """Initialize downloader."""
        if base_dir is None:
            base_dir = Path(__file__).parent.parent / "data" / "raw"
        
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Dataset base directory: {self.base_dir}")
    
    def download_buraaq(self) -> bool:
        """
        Download Buraaq/quran-audio-text-dataset.
        
        This is the primary source for:
        - Complete Quran with 30 reciters
        - Both Hafs (28) and Warsh (2) variants
        - 187,080 ayah-level samples
        """
        logger.info("\n" + "="*80)
        logger.info("DOWNLOADING: Buraaq/quran-audio-text-dataset")
        logger.info("="*80)
        
        dest_dir = self.base_dir / "buraaq"
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            from huggingface_hub import snapshot_download
            
            logger.info("Downloading Buraaq dataset...")
            logger.info("Dataset size: ~150-200 GB (multi-part download)")
            logger.info("This may take several hours depending on your internet speed")
            
            # Using snapshot_download from huggingface_hub
            path = snapshot_download(
                repo_id="Buraaq/quran-audio-text-dataset",
                repo_type="dataset",
                local_dir=str(dest_dir)
            )
            
            logger.info(f"✓ Buraaq dataset downloaded to {path}")
            
            # Save metadata
            metadata = {
                "source": "Buraaq/quran-audio-text-dataset",
                "url": "https://huggingface.co/datasets/Buraaq/quran-audio-text-dataset",
                "total_reciters": 30,
                "hafs_reciters": 28,
                "warsh_reciters": 2,
                "total_ayah_samples": 187080,
            }
            
            with open(dest_dir / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to download Buraaq dataset: {e}")
            return False
    
    def download_rabah2026(self) -> bool:
        """
        Download rabah2026/Quran-Ayah-Corpus.
        
        This is the primary source for:
        - Test set reciters (3): Karim Mansoori, Aziz Alili, Khalefa Al Tunaiji, Mahmoud Ali Al Banna
        - 263,263 total samples
        - 44 total reciters (38 train, 3 val, 3 test)
        - 16kHz stereo WAV format
        - Clean transcriptions
        """
        logger.info("\n" + "="*80)
        logger.info("DOWNLOADING: rabah2026/Quran-Ayah-Corpus")
        logger.info("="*80)
        
        dest_dir = self.base_dir / "rabah2026"
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            from huggingface_hub import snapshot_download
            
            logger.info("Downloading rabah2026 dataset...")
            logger.info("Dataset size: ~144 GB")
            logger.info("This may take several hours depending on your internet speed")
            
            path = snapshot_download(
                repo_id="rabah2026/Quran-Ayah-Corpus",
                repo_type="dataset",
                local_dir=str(dest_dir)
            )
            
            logger.info(f"✓ rabah2026 dataset downloaded to {path}")
            
            # Save metadata
            metadata = {
                "source": "rabah2026/Quran-Ayah-Corpus",
                "url": "https://huggingface.co/datasets/rabah2026/Quran-Ayah-Corpus",
                "total_samples": 263263,
                "total_reciters": 44,
                "train_reciters": 38,
                "validation_reciters": 3,
                "test_reciters": 3,
                "audio_format": "WAV",
                "sampling_rate": 16000,
                "total_duration_hours": 1102,  # Approximation
            }
            
            with open(dest_dir / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to download rabah2026 dataset: {e}")
            return False
    
    def download_obadx(self) -> bool:
        """
        Download obadx/mualem-recitations-original.
        
        This is the primary source for:
        - DETAILED TAJWEED ANNOTATIONS at rule level
        - Ghonna, Idgham, Imalah, Lam Tafkhim, Madd types, Sakt rules
        - 49 Moshaf (Quran variants) with metadata
        - Professional recitations with annotations
        """
        logger.info("\n" + "="*80)
        logger.info("DOWNLOADING: obadx/mualem-recitations-original")
        logger.info("="*80)
        
        dest_dir = self.base_dir / "obadx"
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            from huggingface_hub import snapshot_download
            
            logger.info("Downloading obadx dataset...")
            logger.info("Dataset size: ~35 KB for metadata (audio handling varies)")
            logger.info("This includes the most detailed tajweed annotations")
            
            path = snapshot_download(
                repo_id="obadx/mualem-recitations-original",
                repo_type="dataset",
                local_dir=str(dest_dir)
            )
            
            logger.info(f"✓ obadx dataset downloaded to {path}")
            
            # Save metadata
            metadata = {
                "source": "obadx/mualem-recitations-original",
                "url": "https://huggingface.co/datasets/obadx/mualem-recitations-original",
                "total_moshaf": 49,
                "key_features": [
                    "detailed_tajweed_annotations",
                    "ghonna_lam_and_raa",
                    "madd_monfasel_len",
                    "madd_mottasel_len",
                    "idgham_rules",
                    "imalah_markers",
                    "recitation_speed",
                    "takbeer_style",
                    "sakt_rules",
                    "lam_tafkhim"
                ],
                "note": "This dataset has the MOST DETAILED tajweed rule annotations"
            }
            
            with open(dest_dir / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to download obadx dataset: {e}")
            return False
    
    def download_crowdsourced(self) -> bool:
        """
        Download Crowdsourced Quranic Audio Dataset.
        
        This is from:
        - quranic-audio-dataset.github.io
        - Non-native Arabic speakers (learners)
        - Good for diversity and robustness testing
        """
        logger.info("\n" + "="*80)
        logger.info("DOWNLOADING: Crowdsourced Quranic Audio Dataset")
        logger.info("="*80)
        
        dest_dir = self.base_dir / "crowdsourced"
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            from huggingface_hub import snapshot_download
            
            logger.info("Downloading crowdsourced dataset...")
            logger.info("Source: quranic-audio-dataset.github.io")
            logger.info("Note: This dataset features non-native Arabic speakers")
            
            # The crowdsourced dataset is on HuggingFace as RetaSy/quranic_audio_dataset
            path = snapshot_download(
                repo_id="RetaSy/quranic_audio_dataset",
                repo_type="dataset",
                local_dir=str(dest_dir)
            )
            
            logger.info(f"✓ Crowdsourced dataset downloaded to {path}")
            
            # Save metadata
            metadata = {
                "source": "quranic_audio_dataset (Crowdsourced)",
                "url": "https://quranic-audio-dataset.github.io/",
                "paper_url": "https://arxiv.org/abs/2405.02675",
                "type": "crowdsourced",
                "speakers": "Non-native Arabic speakers",
                "institutions": ["Innopolis University", "Skoltech University"],
                "key_advantage": "Diversity of pronunciation from learners"
            }
            
            with open(dest_dir / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Failed to download crowdsourced dataset: {e}")
            return False
    
    def download_all(self) -> dict:
        """Download all datasets."""
        logger.info("\n" + "#"*80)
        logger.info("# QURANIC AUDIO DATASET DOWNLOADER")
        logger.info("#"*80)
        
        results = {
            "buraaq": self.download_buraaq(),
            "rabah2026": self.download_rabah2026(),
            "obadx": self.download_obadx(),
            "crowdsourced": self.download_crowdsourced(),
        }
        
        # Summary
        logger.info("\n" + "="*80)
        logger.info("DOWNLOAD SUMMARY")
        logger.info("="*80)
        
        successful = sum(1 for v in results.values() if v)
        total = len(results)
        
        for name, success in results.items():
            status = "✓ SUCCESS" if success else "✗ FAILED"
            logger.info(f"{name:20s} : {status}")
        
        logger.info(f"\nTotal: {successful}/{total} datasets downloaded successfully")
        
        # Save download report
        report_path = self.base_dir / "download_report.json"
        with open(report_path, "w") as f:
            json.dump({
                "timestamp": str(Path()),
                "base_directory": str(self.base_dir),
                "results": results,
                "summary": f"{successful}/{total} successful"
            }, f, indent=2)
        
        logger.info(f"\nDownload report saved to: {report_path}")
        
        return results


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Download all Quranic audio datasets"
    )
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=None,
        help="Base directory for dataset storage (default: quranic_qiraat_ml/data/raw)"
    )
    parser.add_argument(
        "--dataset",
        choices=["buraaq", "rabah2026", "obadx", "crowdsourced", "all"],
        default="all",
        help="Which dataset to download (default: all)"
    )
    
    args = parser.parse_args()
    
    downloader = QuranicDatasetDownloader(base_dir=args.base_dir)
    
    if args.dataset == "all":
        results = downloader.download_all()
    elif args.dataset == "buraaq":
        results = {"buraaq": downloader.download_buraaq()}
    elif args.dataset == "rabah2026":
        results = {"rabah2026": downloader.download_rabah2026()}
    elif args.dataset == "obadx":
        results = {"obadx": downloader.download_obadx()}
    elif args.dataset == "crowdsourced":
        results = {"crowdsourced": downloader.download_crowdsourced()}
    
    # Exit with error if any failed
    if not all(results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
