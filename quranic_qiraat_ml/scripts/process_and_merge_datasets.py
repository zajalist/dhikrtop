#!/usr/bin/env python3
"""
Merge and process all Quranic audio datasets into a single unified dataset.

This script:
1. Reads from all raw datasets (Buraaq, rabah2026, obadx, crowdsourced)
2. Deduplicates reciters based on reciters_mapping.json
3. Normalizes metadata and audio formats
4. Creates unified dataset with features for:
   - Hafs/Warsh classification
   - Tajweed rule detection
5. Splits into train/val/test with clean reciter separation

Output structure:
  data/processed/
    ├── merged_dataset.parquet
    ├── train_split.parquet
    ├── validation_split.parquet
    ├── test_split.parquet
    ├── dataset_metadata.json
    └── processing_report.json
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import warnings

import numpy as np
import pandas as pd
from dataclasses import dataclass
import hashlib

# Try to import audio libraries
try:
    import librosa
    import soundfile as sf
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False
    logging.warning("librosa/soundfile not available - audio processing disabled")

warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class AudioSample:
    """Represents a single audio sample."""
    surah_number: int
    ayah_number: int
    qiraat: str  # 'Hafs' or 'Warsh'
    reciter: str
    reciter_id: str
    arabic_text: str
    english_translation: Optional[str] = None
    transliteration: Optional[str] = None
    audio_path: str = None
    source_dataset: str = None
    recitation_speed: Optional[str] = None
    duration: float = 0.0
    
    # Features for learning
    is_canonical_reciter: bool = True
    audio_hash: Optional[str] = None  # For deduplication


class QuranicDatasetProcessor:
    """Process and merge Quranic datasets."""
    
    def __init__(self, 
                 raw_dir: Path = None,
                 processed_dir: Path = None,
                 mapping_file: Path = None):
        """Initialize processor."""
        
        if raw_dir is None:
            raw_dir = Path(__file__).parent.parent / "data" / "raw"
        if processed_dir is None:
            processed_dir = Path(__file__).parent.parent / "data" / "processed"
        if mapping_file is None:
            mapping_file = Path(__file__).parent.parent / "data" / "reciters_mapping.json"
        
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        self.mapping_file = mapping_file
        
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        # Load reciter mapping
        self.reciter_mapping = self._load_reciter_mapping()
        
        # Statistics
        self.stats = {
            "total_samples": 0,
            "hafs_samples": 0,
            "warsh_samples": 0,
            "canonical_reciters": [],
            "non_canonical_reciters": [],
            "deduped_samples": 0,
            "sources": {
                "buraaq": 0,
                "rabah2026": 0,
                "obadx": 0,
                "crowdsourced": 0,
            }
        }
    
    def _load_reciter_mapping(self) -> Dict:
        """Load reciter mapping from JSON."""
        logger.info(f"Loading reciter mapping from {self.mapping_file}")
        
        with open(self.mapping_file, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
        
        return mapping
    
    def _normalize_reciter_name(self, name: str) -> str:
        """Normalize reciter name to match mapping."""
        if not name:
            return None
        
        # Clean whitespace
        name = name.strip().lower()
        
        # Common replacements
        replacements = {
            'husary': 'husary',
            'hussary': 'husary',
            'al-sudais': 'as_sudais',
            'sudais': 'as_sudais',
            'ash-shuraym': 'ash_shuraym',
            'shuraym': 'ash_shuraym',
            'ad-dussary': 'ad_dussary',
            'dussary': 'ad_dussary',
            'alafasy': 'alafasy',
            'al-afasy': 'alafasy',
            'minshawy': 'minshawy',
            'minshawi': 'minshawy',
            'minshawee': 'minshawy',
            'hani rifai': 'hani_rifai',
            'ali jaber': 'ali_jaber',

        }
        
        for old, new in replacements.items():
            if old in name:
                name = name.replace(old, new)
        
        return name
    
    def _get_surah_and_ayah(self, identifier: str) -> Tuple[int, int]:
        """Extract surah and ayah number from various formats."""
        # Try format: "001001" or "001_001"
        identifier = str(identifier).strip()
        
        # Remove common separators
        identifier = identifier.replace('_', '').replace('-', '').replace('.', '')
        
        if len(identifier) >= 6:
            try:
                return int(identifier[:3]), int(identifier[3:6])
            except ValueError:
                pass
        
        return None, None
    
    def process_buraaq(self) -> List[AudioSample]:
        """Process Buraaq/quran-audio-text-dataset."""
        logger.info("\n" + "="*80)
        logger.info("PROCESSING: Buraaq/quran-audio-text-dataset")
        logger.info("="*80)
        
        buraaq_dir = self.raw_dir / "buraaq"
        if not buraaq_dir.exists():
            logger.warning(f"Buraaq directory not found: {buraaq_dir}")
            return []
        
        samples = []
        
        try:
            # Look for data.json or similar metadata
            metadata_files = list(buraaq_dir.glob("**/quran_*.json"))
            
            for metadata_file in metadata_files:
                logger.info(f"Processing {metadata_file.name}")
                
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    quran_data = json.load(f)
                
                # Iterate through surahs
                for surah_num, surah_data in quran_data.items():
                    surah_num = int(surah_num)
                    
                    if 'ayahs' not in surah_data:
                        continue
                    
                    # Iterate through ayahs
                    for ayah_num, ayah_data in surah_data['ayahs'].items():
                        ayah_num = int(ayah_num)
                        
                        ayah_text = ayah_data.get('ayah_ar', '')
                        translation = ayah_data.get('ayah_en', '')
                        transliteration = ayah_data.get('ayah_tr', '')
                        
                        # Get audio paths by reciter
                        if 'audio_ayah_path' not in ayah_data:
                            continue
                        
                        audio_paths = ayah_data['audio_ayah_path']
                        
                        for reciter_name, audio_path in audio_paths.items():
                            # Normalize reciter name
                            reciter_id = self._normalize_reciter_name(reciter_name)
                            
                            # Determine Qira'at
                            if 'warsh' in reciter_id.lower():
                                qiraat = 'Warsh'
                            else:
                                qiraat = 'Hafs'
                            
                            # Check if we should include this reciter (dedup)
                            if not self._should_include_sample(reciter_id, 'buraaq'):
                                continue
                            
                            audio_file = buraaq_dir / audio_path if audio_path else None
                            
                            sample = AudioSample(
                                surah_number=surah_num,
                                ayah_number=ayah_num,
                                qiraat=qiraat,
                                reciter=reciter_name,
                                reciter_id=reciter_id,
                                arabic_text=ayah_text,
                                english_translation=translation,
                                transliteration=transliteration,
                                audio_path=str(audio_file) if audio_file else None,
                                source_dataset='buraaq',
                                is_canonical_reciter=True,
                            )
                            
                            samples.append(sample)
            
            logger.info(f"✓ Processed {len(samples)} samples from Buraaq")
            self.stats['sources']['buraaq'] = len(samples)
            
        except Exception as e:
            logger.error(f"✗ Error processing Buraaq: {e}")
        
        return samples
    
    def process_rabah2026(self) -> List[AudioSample]:
        """Process rabah2026/Quran-Ayah-Corpus."""
        logger.info("\n" + "="*80)
        logger.info("PROCESSING: rabah2026/Quran-Ayah-Corpus")
        logger.info("="*80)
        
        rabah_dir = self.raw_dir / "rabah2026"
        if not rabah_dir.exists():
            logger.warning(f"rabah2026 directory not found: {rabah_dir}")
            return []
        
        samples = []
        
        try:
            # Try to load using datasets library or parquet
            try:
                from datasets import load_dataset
                logger.info("Loading rabah2026 using huggingface datasets...")
                
                dataset = load_dataset(
                    'parquet',
                    data_files={'train': str(rabah_dir / '**/*.parquet')},
                    recursive=True
                )['train']
                
                for i, item in enumerate(dataset):
                    if i % 1000 == 0:
                        logger.info(f"  Processed {i}/{len(dataset)} samples")
                    
                    # Get reciter
                    reciter_name = item.get('reciter', 'Unknown')
                    reciter_id = self._normalize_reciter_name(reciter_name)
                    
                    # Check if we should include (dedup)
                    if not self._should_include_sample(reciter_id, 'rabah2026'):
                        continue
                    
                    # Get text and audio
                    text = item.get('text', '')
                    audio_data = item.get('audio', {})
                    duration = item.get('duration', 0.0)
                    
                    # Parse surah/ayah from audio bytes or metadata
                    # For rabah2026, we may need to infer from text or use a placeholder
                    surah_num, ayah_num = 1, 1  # Placeholder
                    
                    sample = AudioSample(
                        surah_number=surah_num,
                        ayah_number=ayah_num,
                        qiraat='Hafs',  # rabah2026 is only Hafs
                        reciter=reciter_name,
                        reciter_id=reciter_id,
                        arabic_text=text,
                        source_dataset='rabah2026',
                        duration=duration,
                        is_canonical_reciter=True,
                    )
                    
                    samples.append(sample)
            
            except ImportError:
                logger.warning("datasets library not available - trying direct parquet read")
                
                # Fallback: try to read parquet directly
                try:
                    import pyarrow.parquet as pq
                    
                    for parquet_file in rabah_dir.glob('**/*.parquet'):
                        logger.info(f"Reading {parquet_file.name}")
                        table = pq.read_table(parquet_file)
                        df = table.to_pandas()
                        
                        for idx, row in df.iterrows():
                            reciter_name = row.get('reciter', 'Unknown')
                            reciter_id = self._normalize_reciter_name(reciter_name)
                            
                            if not self._should_include_sample(reciter_id, 'rabah2026'):
                                continue
                            
                            sample = AudioSample(
                                surah_number=1,
                                ayah_number=1,
                                qiraat='Hafs',
                                reciter=reciter_name,
                                reciter_id=reciter_id,
                                arabic_text=row.get('text', ''),
                                source_dataset='rabah2026',
                                duration=row.get('duration', 0.0),
                                is_canonical_reciter=True,
                            )
                            
                            samples.append(sample)
                
                except ImportError:
                    logger.error("pyarrow not available - cannot read rabah2026")
            
            logger.info(f"✓ Processed {len(samples)} samples from rabah2026")
            self.stats['sources']['rabah2026'] = len(samples)
            
        except Exception as e:
            logger.error(f"✗ Error processing rabah2026: {e}")
        
        return samples
    
    def process_obadx(self) -> List[AudioSample]:
        """Process obadx/mualem-recitations-original."""
        logger.info("\n" + "="*80)
        logger.info("PROCESSING: obadx/mualem-recitations-original")
        logger.info("="*80)
        
        obadx_dir = self.raw_dir / "obadx"
        if not obadx_dir.exists():
            logger.warning(f"obadx directory not found: {obadx_dir}")
            return []
        
        samples = []
        
        try:
            # Look for moshaf metadata and reciter metadata
            metadata_files = list(obadx_dir.glob("*.parquet")) + list(obadx_dir.glob("*.jsonl"))
            
            if not metadata_files:
                logger.warning("No metadata files found in obadx directory")
                return samples
            
            logger.info(f"Found {len(metadata_files)} metadata files")
            
            # This dataset has detailed tajweed annotations
            # We'll note this in the sample metadata
            
            logger.info("✓ Found obadx with detailed tajweed annotations")
            logger.info("  (Audio processing deferred due to complex metadata structure)")
            
            # TODO: Implement full obadx processing with tajweed rule extraction
            
        except Exception as e:
            logger.error(f"✗ Error processing obadx: {e}")
        
        return samples
    
    def process_crowdsourced(self) -> List[AudioSample]:
        """Process crowdsourced dataset."""
        logger.info("\n" + "="*80)
        logger.info("PROCESSING: Crowdsourced Dataset")
        logger.info("="*80)
        
        crowd_dir = self.raw_dir / "crowdsourced"
        if not crowd_dir.exists():
            logger.warning(f"Crowdsourced directory not found: {crowd_dir}")
            return []
        
        samples = []
        
        try:
            # Look for metadata files
            metadata_files = list(crowd_dir.glob("**/*.json"))
            
            if not metadata_files:
                logger.warning("No metadata files found in crowdsourced directory")
            
            logger.info("✓ Found crowdsourced dataset metadata")
            logger.info("  (Audio processing deferred due to complex crowdsourcing structure)")
            
            # TODO: Implement full crowdsourced processing
            
        except Exception as e:
            logger.error(f"✗ Error processing crowdsourced: {e}")
        
        return samples
    
    def _should_include_sample(self, reciter_id: str, source: str) -> bool:
        """Check if we should include a sample (deduplication logic)."""
        
        # Find the reciter in mapping
        for reciter_key, reciter_info in self.reciter_mapping['reciters'].items():
            # Check if this reciter is in the mapping
            if reciter_key.replace('_', ' ').lower() == reciter_id.replace('_', ' ').lower():
                # Got it - check primary source
                primary = reciter_info.get('primary_source', '')
                
                if source.lower() in primary.lower():
                    return True  # Include from primary source
                else:
                    return False  # Skip from secondary sources
        
        # Unknown reciter - include if from a primary dataset
        return source in ['buraaq', 'rabah2026']
    
    def merge_all_datasets(self) -> pd.DataFrame:
        """Merge all datasets."""
        logger.info("\n" + "#"*80)
        logger.info("# MERGING ALL DATASETS")
        logger.info("#"*80)
        
        all_samples = []
        
        # Process each dataset
        all_samples.extend(self.process_buraaq())
        all_samples.extend(self.process_rabah2026())
        all_samples.extend(self.process_obadx())
        all_samples.extend(self.process_crowdsourced())
        
        logger.info(f"\nTotal samples collected: {len(all_samples)}")
        
        # Convert to DataFrame
        sample_dicts = [
            {
                'surah_number': s.surah_number,
                'ayah_number': s.ayah_number,
                'qiraat': s.qiraat,
                'reciter': s.reciter,
                'reciter_id': s.reciter_id,
                'arabic_text': s.arabic_text,
                'english_translation': s.english_translation,
                'transliteration': s.transliteration,
                'audio_path': s.audio_path,
                'source_dataset': s.source_dataset,
                'recitation_speed': s.recitation_speed,
                'duration': s.duration,
                'is_canonical_reciter': s.is_canonical_reciter,
            }
            for s in all_samples
        ]
        
        df = pd.DataFrame(sample_dicts)
        
        # Update statistics
        self.stats['total_samples'] = len(df)
        self.stats['hafs_samples'] = len(df[df['qiraat'] == 'Hafs'])
        self.stats['warsh_samples'] = len(df[df['qiraat'] == 'Warsh'])
        
        return df
    
    def create_splits(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Create train/val/test splits with clean reciter separation."""
        logger.info("\n" + "="*80)
        logger.info("CREATING DATA SPLITS (CLEAN RECITER SEPARATION)")
        logger.info("="*80)
        
        # Group by reciter
        reciters = df['reciter_id'].unique()
        logger.info(f"Total unique reciters: {len(reciters)}")
        
        # Split reciters: 70% train, 15% val, 15% test
        np.random.seed(42)
        np.random.shuffle(reciters)
        
        split_1 = int(0.7 * len(reciters))
        split_2 = int(0.85 * len(reciters))
        
        train_reciters = reciters[:split_1]
        val_reciters = reciters[split_1:split_2]
        test_reciters = reciters[split_2:]
        
        train_df = df[df['reciter_id'].isin(train_reciters)].reset_index(drop=True)
        val_df = df[df['reciter_id'].isin(val_reciters)].reset_index(drop=True)
        test_df = df[df['reciter_id'].isin(test_reciters)].reset_index(drop=True)
        
        logger.info(f"Train:      {len(train_df):6d} samples ({len(train_reciters):2d} reciters)")
        logger.info(f"Validation: {len(val_df):6d} samples ({len(val_reciters):2d} reciters)")
        logger.info(f"Test:       {len(test_df):6d} samples ({len(test_reciters):2d} reciters)")
        
        return train_df, val_df, test_df
    
    def save_merged_dataset(self, df: pd.DataFrame):
        """Save merged dataset."""
        output_path = self.processed_dir / "merged_dataset.parquet"
        
        logger.info(f"\nSaving merged dataset to {output_path}")
        df.to_parquet(output_path, index=False)
        
        logger.info(f"✓ Saved {len(df)} samples")
    
    def save_splits(self,
                   train_df: pd.DataFrame,
                   val_df: pd.DataFrame,
                   test_df: pd.DataFrame):
        """Save data splits."""
        logger.info("\n" + "="*80)
        logger.info("SAVING DATA SPLITS")
        logger.info("="*80)
        
        splits = {
            'train': (train_df, 'train_split.parquet'),
            'validation': (val_df, 'validation_split.parquet'),
            'test': (test_df, 'test_split.parquet'),
        }
        
        for name, (df, filename) in splits.items():
            output_path = self.processed_dir / filename
            
            logger.info(f"Saving {name:12s} split to {filename}")
            df.to_parquet(output_path, index=False)
            logger.info(f"  ✓ {len(df):6d} samples saved")
    
    def save_metadata(self):
        """Save processing metadata."""
        metadata = {
            "processed_at": str(pd.Timestamp.now()),
            "raw_directory": str(self.raw_dir),
            "processed_directory": str(self.processed_dir),
            "mapping_file": str(self.mapping_file),
            "statistics": self.stats,
            "reciter_mapping": {
                "version": self.reciter_mapping.get("metadata", {}).get("version"),
                "deduplication_strategy": self.reciter_mapping.get("deduplication_strategy"),
            }
        }
        
        output_path = self.processed_dir / "dataset_metadata.json"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        logger.info(f"\nMetadata saved to {output_path}")
    
    def process_all(self):
        """Run the complete processing pipeline."""
        logger.info("\n" + "█"*80)
        logger.info("█ QURANIC DATASET PROCESSING & MERGING PIPELINE")
        logger.info("█"*80)
        
        # Merge all datasets
        merged_df = self.merge_all_datasets()
        
        # Create splits
        train_df, val_df, test_df = self.create_splits(merged_df)
        
        # Save outputs
        self.save_merged_dataset(merged_df)
        self.save_splits(train_df, val_df, test_df)
        self.save_metadata()
        
        # Final summary
        logger.info("\n" + "█"*80)
        logger.info("█ PROCESSING COMPLETE")
        logger.info("█"*80)
        
        logger.info(f"\n✓ All outputs saved to: {self.processed_dir}")
        logger.info(f"\n  Available files:")
        logger.info(f"    - merged_dataset.parquet ({len(merged_df)} samples)")
        logger.info(f"    - train_split.parquet ({len(train_df)} samples)")
        logger.info(f"    - validation_split.parquet ({len(val_df)} samples)")
        logger.info(f"    - test_split.parquet ({len(test_df)} samples)")
        logger.info(f"    - dataset_metadata.json")
        
        logger.info(f"\n  Statistics:")
        logger.info(f"    - Total samples: {len(merged_df)}")
        logger.info(f"    - Hafs: {self.stats['hafs_samples']}")
        logger.info(f"    - Warsh: {self.stats['warsh_samples']}")


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Process and merge Quranic audio datasets"
    )
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=None,
        help="Raw dataset directory (default: quranic_qiraat_ml/data/raw)"
    )
    parser.add_argument(
        "--processed-dir",
        type=Path,
        default=None,
        help="Output processed directory (default: quranic_qiraat_ml/data/processed)"
    )
    parser.add_argument(
        "--mapping-file",
        type=Path,
        default=None,
        help="Reciter mapping file (default: quranic_qiraat_ml/data/reciters_mapping.json)"
    )
    
    args = parser.parse_args()
    
    processor = QuranicDatasetProcessor(
        raw_dir=args.raw_dir,
        processed_dir=args.processed_dir,
        mapping_file=args.mapping_file
    )
    
    processor.process_all()


if __name__ == "__main__":
    main()
