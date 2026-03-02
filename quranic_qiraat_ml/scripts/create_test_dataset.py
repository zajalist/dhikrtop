#!/usr/bin/env python3
"""
Create a minimal test dataset with sample Quranic verses for development/testing.
This allows testing the pipeline without downloading 100+ GB datasets.
"""

import json
from pathlib import Path
import pandas as pd

def create_test_samples():
    """Create minimal test dataset structure."""
    
    base_dir = Path(__file__).parent.parent
    processed_dir = base_dir / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # Sample data: 10 verses with metadata
    samples = [
        {
            "surah_number": 1,
            "ayah_number": 1,
            "qiraat": "Hafs",
            "reciter": "Abdul Basit",
            "reciter_id": "abdul_basit",
            "arabic_text": "بسم الله الرحمن الرحيم",
            "english_translation": "In the name of Allah, the Most Gracious, the Most Merciful",
            "transliteration": "Bismillahi ar-Rahmani ar-Rahim",
            "audio_path": "data/raw/buraaq/audio/ayahs/abdul_basit/001001.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 5.2,
        },
        {
            "surah_number": 1,
            "ayah_number": 2,
            "qiraat": "Hafs",
            "reciter": "Abdurrahmaan As-Sudais",
            "reciter_id": "abdurrahmaan_as_sudais",
            "arabic_text": "الحمد لله رب العالمين",
            "english_translation": "All praise is due to Allah, Lord of the worlds",
            "transliteration": "al-hamdu lillahi rabbi al-'alamin",
            "audio_path": "data/raw/buraaq/audio/ayahs/abdurrahmaan_as_sudais/001002.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 5.8,
        },
        {
            "surah_number": 1,
            "ayah_number": 3,
            "qiraat": "Hafs",
            "reciter": "Husary",
            "reciter_id": "husary",
            "arabic_text": "الرحمن الرحيم",
            "english_translation": "The Most Gracious, the Most Merciful",
            "transliteration": "ar-Rahmani ar-Rahim",
            "audio_path": "data/raw/buraaq/audio/ayahs/husary/001003.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 3.5,
        },
        {
            "surah_number": 112,
            "ayah_number": 1,
            "qiraat": "Hafs",
            "reciter": "Saood Ash-Shuraym",
            "reciter_id": "saood_ash_shuraym",
            "arabic_text": "قل هو الله أحد",
            "english_translation": "Say, 'He is Allah, [who is] One,'",
            "transliteration": "Qul huwa l-lahu ahad",
            "audio_path": "data/raw/buraaq/audio/ayahs/saood_ash_shuraym/112001.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 6.2,
        },
        {
            "surah_number": 112,
            "ayah_number": 2,
            "qiraat": "Warsh",
            "reciter": "Husary (Warsh)",
            "reciter_id": "husary_warsh",
            "arabic_text": "الله الصمد",
            "english_translation": "Allah, the Eternal Refuge.",
            "transliteration": "al-lahu l-samad",
            "audio_path": "data/raw/buraaq/audio/ayahs/husary_warsh/112002.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 4.9,
        },
        {
            "surah_number": 112,
            "ayah_number": 3,
            "qiraat": "Warsh",
            "reciter": "Yassin (Warsh)",
            "reciter_id": "yassin_warsh",
            "arabic_text": "لم يلد ولم يولد",
            "english_translation": "He neither begets nor is born,",
            "transliteration": "Lam yalid wa-lam yulad",
            "audio_path": "data/raw/buraaq/audio/ayahs/yassin_warsh/112003.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 5.3,
        },
        {
            "surah_number": 1,
            "ayah_number": 4,
            "qiraat": "Hafs",
            "reciter": "Yasser Ad-Dussary",
            "reciter_id": "yasser_ad_dussary",
            "arabic_text": "مالك يوم الدين",
            "english_translation": "Master of the Day of Judgment",
            "transliteration": "malik yawm ad-din",
            "audio_path": "data/raw/buraaq/audio/ayahs/yasser_ad_dussary/001004.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 5.6,
        },
        {
            "surah_number": 2,
            "ayah_number": 1,
            "qiraat": "Hafs",
            "reciter": "Alafasy",
            "reciter_id": "alafasy",
            "arabic_text": "الم",
            "english_translation": "Alif, Lam, Meem",
            "transliteration": "Alif, Lam, Meem",
            "audio_path": "data/raw/buraaq/audio/ayahs/alafasy/002001.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 2.1,
        },
        {
            "surah_number": 2,
            "ayah_number": 2,
            "qiraat": "Hafs",
            "reciter": "Minshawy",
            "reciter_id": "minshawy",
            "arabic_text": "ذلك الكتاب لا ريب فيه",
            "english_translation": "That is the Book about which there is no doubt",
            "transliteration": "Dhalika al-kitab la rayb fih",
            "audio_path": "data/raw/buraaq/audio/ayahs/minshawy/002002.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 8.2,
        },
        {
            "surah_number": 2,
            "ayah_number": 3,
            "qiraat": "Hafs",
            "reciter": "Abdul Samad",
            "reciter_id": "abdul_samad",
            "arabic_text": "هدى للمتقين",
            "english_translation": "Guidance for those who have taqwa",
            "transliteration": "Huda lil-muttaqeen",
            "audio_path": "data/raw/buraaq/audio/ayahs/abdul_samad/002003.mp3",
            "source_dataset": "buraaq",
            "is_canonical_reciter": True,
            "duration": 4.7,
        },
    ]
    
    # Create DataFrame
    df = pd.DataFrame(samples)
    
    # Save splits
    train_df = df.iloc[:7].reset_index(drop=True)
    val_df = df.iloc[7:9].reset_index(drop=True)
    test_df = df.iloc[9:].reset_index(drop=True)
    
    train_df.to_parquet(processed_dir / "train_split.parquet", index=False)
    val_df.to_parquet(processed_dir / "validation_split.parquet", index=False)
    test_df.to_parquet(processed_dir / "test_split.parquet", index=False)
    df.to_parquet(processed_dir / "merged_dataset.parquet", index=False)
    
    # Save metadata
    metadata = {
        "created_at": "2026-03-01",
        "type": "test_dataset",
        "note": "Minimal test dataset with 10 samples for development. Actual production datasets are 100-200 GB.",
        "total_samples": len(df),
        "train_samples": len(train_df),
        "validation_samples": len(val_df),
        "test_samples": len(test_df),
        "qiraat_distribution": {
            "hafs": len(df[df['qiraat'] == 'Hafs']),
            "warsh": len(df[df['qiraat'] == 'Warsh']),
        },
        "reciters": df['reciter'].unique().tolist(),
        "source_datasets": df['source_dataset'].unique().tolist(),
    }
    
    with open(processed_dir / "dataset_metadata.json", 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"""
✓ Test dataset created successfully!

Location: {processed_dir}

Files:
  - merged_dataset.parquet ({len(df)} samples)
  - train_split.parquet ({len(train_df)} samples)
  - validation_split.parquet ({len(val_df)} samples)
  - test_split.parquet ({len(test_df)} samples)
  - dataset_metadata.json

This is a minimal test dataset with 10 Quranic verses from different reciters.
Use this to test your model pipeline before downloading the full 100-200 GB datasets.

To download the full datasets, see: data/DOWNLOAD_DATASETS.md
    """)


if __name__ == "__main__":
    create_test_samples()
