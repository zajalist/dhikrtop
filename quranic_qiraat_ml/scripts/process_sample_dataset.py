#!/usr/bin/env python3
"""
Process the sample dataset for quick testing and exploration.
"""

import json
import logging
from pathlib import Path
import pandas as pd

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def process_sample():
    """Process sample dataset."""
    
    logger.info("\n" + "="*80)
    logger.info("PROCESSING SAMPLE DATASET")
    logger.info("="*80)
    
    sample_dir = Path(__file__).parent.parent / "data" / "raw" / "sample_for_testing"
    
    if not sample_dir.exists():
        logger.error(f"Sample directory not found: {sample_dir}")
        logger.info("Run: python scripts/download_sample_dataset.py")
        return False
    
    # Load sample parquet
    parquet_file = sample_dir / "rabah2026_sample.parquet"
    
    if not parquet_file.exists():
        logger.error(f"Sample parquet not found: {parquet_file}")
        return False
    
    logger.info(f"Loading sample from {parquet_file}...")
    
    try:
        df = pd.read_parquet(parquet_file)
        
        logger.info(f"\n✓ Loaded {len(df)} samples")
        logger.info(f"\nDataset shape: {df.shape}")
        logger.info(f"\nColumns: {list(df.columns)}")
        
        # Show sample
        logger.info("\nFirst 5 samples:")
        logger.info(df.head().to_string())
        
        # Statistics
        logger.info("\n" + "="*80)
        logger.info("DATASET STATISTICS")
        logger.info("="*80)
        
        if 'reciter' in df.columns:
            reciters = df['reciter'].nunique()
            logger.info(f"Unique reciters: {reciters}")
            logger.info(f"\nReciter distribution:")
            logger.info(df['reciter'].value_counts().to_string())
        
        if 'duration' in df.columns:
            logger.info(f"\nDuration statistics (seconds):")
            logger.info(df['duration'].describe().to_string())
        
        if 'text' in df.columns:
            logger.info(f"\nText samples:")
            for i, text in enumerate(df['text'].head(3)):
                logger.info(f"  {i+1}. {text}")
        
        # Save summary
        summary = {
            "total_samples": len(df),
            "shape": str(df.shape),
            "columns": list(df.columns),
            "memory_usage_mb": df.memory_usage(deep=True).sum() / 1024**2,
            "reciters": int(df['reciter'].nunique()) if 'reciter' in df.columns else None,
            "mean_duration_seconds": float(df['duration'].mean()) if 'duration' in df.columns else None,
        }
        
        with open(sample_dir / "processing_summary.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        logger.info("\n✓ Processing summary saved to: processing_summary.json")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Error processing sample: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    process_sample()
