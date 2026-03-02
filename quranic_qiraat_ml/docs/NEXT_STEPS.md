# 🚀 Quranic ML Dataset - Next Steps

**Current Status**: March 1, 2026 | Dataset download in progress  
**Location**: `/quranic_qiraat_ml/`

---

## 📋 Your Action Plan

### Phase 1: Dataset Download & Assembly (In Progress) ⏳
**Status**: Buraaq downloading (13GB / 150-200GB completed)  
**What's Running**: Background process downloading all 4 datasets  
**Your Action**: **WAIT** - Let it run in the background  

**Files Involved**:
- [`scripts/download_datasets.py`](../scripts/download_datasets.py) - Currently executing
- `data/raw/buraaq/` - 13GB downloaded, continues growing
- `data/raw/rabah2026/` - Queued (queues after Buraaq)
- `data/raw/obadx/` - Queued  
- `data/raw/crowdsourced/` - Queued

**Expected Timeline**: 12-24 hours total  
**Do Nothing** - The download will continue automatically

---

### Phase 2: Data Processing & Merging (Ready to Execute)
**Status**: ✅ Code ready, waiting for Phase 1 to complete  
**What It Does**: Merges all 4 datasets, removes duplicates, creates train/val/test splits  

**When to Run**: Once download finishes (you'll see ~500GB total in `data/raw/`)

**Command**:
```bash
cd /home/zajalist/projects/dhikrtop
source venv_ml/bin/activate
python quranic_qiraat_ml/scripts/process_and_merge_datasets.py
```

**Files Created**:
- `data/processed/merged_dataset.parquet` - Full deduplicated dataset
- `data/processed/train_split.parquet` - 70% training data
- `data/processed/validation_split.parquet` - 15% validation
- `data/processed/test_split.parquet` - 15% test
- `data/processed/dataset_metadata.json` - Statistics & info

**Duration**: ~1-2 hours depending on disk speed

---

### Phase 3: Feature Extraction (Ready to Code)
**Status**: 🔧 You'll write this code  
**What It Does**: Extract audio features needed for ML training  

**Files to Create/Use**:
- `scripts/extract_features.py` (create new)
- Input: `data/processed/train_split.parquet`
- Output: `data/processed/features_*.npy` or Parquet with features

**Features to Extract** (for tajweed rule detection):
1. **Spectral Features** - MFCC, mel-spectrogram (for ghunnah duration, madd length)
2. **F0 (Fundamental Frequency)** - Pitch patterns (for tarif, ghunnah)
3. **Formants** (F1, F2) - Vowel recognition (for imalah rules)
4. **Duration** - Length of phonemes/words (for madd types, qalqalah)
5. **Energy/Amplitude** - Volume patterns (for emphatic letters - tafkhim)
6. **Zero Crossing Rate** - Fricative detection (for certain letters)

See [`DATASET_CATEGORIZATION_SUMMARY.md`](DATASET_CATEGORIZATION_SUMMARY.md) section "Audio Feature Engineering Guide" for detailed mappings.

---

### Phase 4: Model Training (After Feature Extraction)
**Status**: 🎯 Ready to implement  
**What It Does**: Train two ML models

#### Model 1: Hafs vs Warsh Classifier
- **Type**: Binary classification
- **Input**: Audio features from Phase 3
- **Output**: "Hafs" or "Warsh" prediction for each reciter
- **Target Accuracy**: 92-95%
- **Why**: Distinguish reading variants automatically

#### Model 2: Tajweed Rule Validator
- **Type**: Multi-label classification (11 classes)
- **Input**: Audio features + text transcription
- **Output**: Which tajweed rules apply (Nūn Sākinah? Ghunnah? etc.)
- **Target Accuracy**: 82-88%  
- **Why**: Verify tajweed correctness, detect pronunciation errors

**Architecture Suggestions**:
- Model 1: Simple CNN (speech cepstral features) or Random Forest
- Model 2: LSTM or Transformer (sequence-aware tajweed rules)

---

## 📁 File Organization

```
quranic_qiraat_ml/
├── docs/
│   ├── NEXT_STEPS.md ← YOU ARE HERE
│   ├── DATASET_SETUP_COMPLETE.md ← What was created
│   ├── DATASET_CATEGORIZATION_SUMMARY.md ← Detailed specs
│   ├── INDEX.md
│   └── quran_ml_architecture.md
│
├── data/
│   ├── raw/
│   │   ├── buraaq/ (13GB currently) 
│   │   ├── rabah2026/ (queued)
│   │   ├── obadx/ (queued)
│   │   └── crowdsourced/ (queued)
│   ├── processed/ (will be created in Phase 2)
│   │   ├── merged_dataset.parquet
│   │   ├── train_split.parquet
│   │   ├── validation_split.parquet
│   │   ├── test_split.parquet
│   │   └── dataset_metadata.json
│   ├── reciters_mapping.json (44+ reciters with tajweed rules)
│   └── DOWNLOAD_DATASETS.md (alternate download methods)
│
├── scripts/
│   ├── download_datasets.py ← Currently running
│   ├── process_and_merge_datasets.py ← Phase 2
│   ├── extract_features.py (create in Phase 3)
│   ├── train_models.py (create in Phase 4)
│   ├── download_sample_dataset.py (quick testing)
│   └── process_sample_dataset.py (quick testing)
│
└── src/
    ├── preprocess.py
    ├── tajweed_rules.py
    └── train.py
```

---

## 🎯 Quick Reference Timeline

| Phase | Status | Timeline | Action |
|-------|--------|----------|--------|
| **1️⃣ Download** | ⏳ In Progress | 12-24 hrs | Wait (do nothing) |
| **2️⃣ Process** | ✅ Ready | 1-2 hrs after Phase 1 | `python process_and_merge_datasets.py` |
| **3️⃣ Features** | 📝 To-Do | 2-4 hrs | Write `extract_features.py` |
| **4️⃣ Training** | 🎯 To-Do | 4-8 hrs | Write `train_models.py` |

---

## 📚 Reference Documents

**Before Phase 1 Completes** (optional reading):
- [`DATASET_SETUP_COMPLETE.md`](DATASET_SETUP_COMPLETE.md) - Detailed summary of what was built
- [`DATASET_CATEGORIZATION_SUMMARY.md`](DATASET_CATEGORIZATION_SUMMARY.md) - Complete dataset specs + tajweed rules (1000+ lines)

**Before Phase 3**:
- [`DATASET_CATEGORIZATION_SUMMARY.md`](DATASET_CATEGORIZATION_SUMMARY.md#audio-feature-engineering-guide) - Audio feature mapping to tajweed rules

---

## ⚠️ Important Notes

1. **Download is NOT stuck** - Buraaq is 150-200GB; 13GB at ~1-2GB/hour is normal
2. **No manual download needed** - `download_datasets.py` handles everything
3. **Reciter deduplication is automatic** - No reciter appears twice across datasets
4. **Training splits are clean** - Same reciter won't appear in train AND test
5. **All 11 tajweed rules are mapped** - See [reciters_mapping.json](../data/reciters_mapping.json)

---

## 🆘 Troubleshooting

### Download seems stuck?
```bash
# Check if process is running
ps aux | grep download_datasets.py

# Check file sizes
du -sh /home/zajalist/projects/dhikrtop/quranic_qiraat_ml/data/raw/*/

# Expected: buraaq should be growing toward 150-200GB
```

### Need to test before download finishes?
```bash
# Download just 0.1% of one dataset for testing
python quranic_qiraat_ml/scripts/download_sample_dataset.py
python quranic_qiraat_ml/scripts/process_sample_dataset.py
```

### Want to monitor download progress?
```bash
# Watch download in real-time
watch -n 60 'du -sh /home/zajalist/projects/dhikrtop/quranic_qiraat_ml/data/raw/*/'
```

---

## 📞 What to Do Right Now

✅ **DONE** - All setup complete  
✅ **DONE** - Download scripts running  
⏳ **WAITING** - Download will complete automatically

**Next action**: Check back in 12-24 hours and run Phase 2 (processing).

---

Generated: March 1, 2026  
Total Project Size: 562,000 Quranic samples across 44+ reciters
