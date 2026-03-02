# Download Quranic Audio Datasets

**⚠️ IMPORTANT**: These datasets are **EXTREMELY LARGE** (100-200 GB each). They must be downloaded separately.

## Dataset Sizes & Information

| Dataset | Size | Reciters | Qira'at | Best For |
|---------|------|----------|---------|----------|
| **Buraaq** | 150-200 GB | 30 | Hafs (28) + Warsh (2) | Complete Quran coverage |
| **rabah2026** | 144 GB | 44 | Hafs (all) | ASR training (clean transcriptions) |
| **obadx** | Variable | Variable | Both | Tajweed rules (detailed annotations) |
| **Crowdsourced** | Variable | Multiple | Varies | Robustness (non-native speakers) |

## Quick Start: Download ONE Dataset

### Option 1: Using HuggingFace CLI (RECOMMENDED)

```bash
# Install HuggingFace CLI (if not already installed)
pip install huggingface-hub

# Download ONE dataset (choose one):

# Buraaq (recommended for professional quality)
huggingface-cli download \
  --repo-type dataset \
  --local-dir ./data/raw/buraaq \
  Buraaq/quran-audio-text-dataset

# OR rabah2026 (recommended for ASR training)
huggingface-cli download \
  --repo-type dataset \
  --local-dir ./data/raw/rabah2026 \
  rabah2026/Quran-Ayah-Corpus

# OR obadx (best for tajweed rule extraction)
huggingface-cli download \
  --repo-type dataset \
  --local-dir ./data/raw/obadx \
  obadx/mualem-recitations-original

# OR Crowdsourced (for diversity testing)
huggingface-cli download \
  --repo-type dataset \
  --local-dir ./data/raw/crowdsourced \
  RetaSy/quranic_audio_dataset
```

### Option 2: Using Python

```python
from huggingface_hub import snapshot_download

# Buraaq
path = snapshot_download(
    repo_id="Buraaq/quran-audio-text-dataset",
    repo_type="dataset",
    local_dir="./data/raw/buraaq"
)
print(f"Downloaded to: {path}")
```

### Option 3: Streaming (No Download - TEST MODELS FIRST)

This is perfect for testing your models without downloading the full 100-200 GB:

```python
from datasets import load_dataset

# Load and process WITHOUT downloading all files
dataset = load_dataset(
    "Buraaq/quran-md-ayahs",  # Buraaq ayah-level dataset
    streaming=True  # <-- This is key! Streams instead of downloading
)

# Use the data directly
for sample in dataset['train']:
    print(sample['surah_number'], sample['ayah_number'])
    print(sample['ayah_ar'])
    # Process sample...
    break  # Stop after one

# Similarly for rabah2026
dataset = load_dataset(
    "rabah2026/Quran-Ayah-Corpus",
    streaming=True
)
```

## Which Dataset Should I Choose?

### For Training Hafs/Warsh Classifier
**→ Use: Buraaq** (~150-200 GB)
- Has both Hafs (28 reciters) and Warsh (2 reciters)
- Professional canonical reciters
- Complete Quran coverage (6,236 verses)
- 187,080 total audio samples

### For Training ASR (Speech Recognition)
**→ Use: rabah2026** (~144 GB)
- Clean transcriptions (critical for ASR)
- 263,263 total samples
- Strict reciter separation (avoids data leakage)
- 44 different reciters

### For Extracting Tajweed Rules
**→ Use: obadx** (Variable, with detailed metadata)
- Most detailed rule annotations (~50 different tajweed rules)
- Perfect for rule-level supervision
- Smaller audio files but comprehensive metadata

### For Robustness Testing
**→ Use: Crowdsourced** (Variable size)
- Non-native Arabic speakers
- Diverse pronunciation styles
- Good for testing generalization

## Storage Planning

- **Minimum**: 1 dataset = 100-150 GB free space
- **Recommended**: 2 datasets = 250-350 GB free space
- **Full setup**: All 4 = 400+ GB (not practical)

**Check your disk space:**
```bash
df -h
# Need at least 200GB free for safe download + processing
```

## Download Tips

1. **Use wired network** (not WiFi) if possible
2. **Run overnight** - these take 12-48 hours depending on connection
3. **Don't stop the download** - resuming from scratch is painful
4. **Check bandwidth** - monitor uploads:
   ```bash
   watch -n 1 'du -sh ./data/raw/*'
   ```
5. **Use VPN if needed** - some regions have slow HuggingFace access

## After Download: Process Datasets

Once downloaded, process and merge them:

```bash
python quranic_qiraat_ml/scripts/process_and_merge_datasets.py \
  --raw-dir ./data/raw \
  --processed-dir ./data/processed
```

This creates:
- `merged_dataset.parquet` (all datasets combined)
- `train_split.parquet` (70% - for training)
- `validation_split.parquet` (15% - for validation)
- `test_split.parquet` (15% - for testing)

## Recitation Speed Variants

Note: Using **Murattal** (standard medium speed) is recommended:

| Speed | Duration per Ayah | Best For |
|-------|-------------------|----------|
| Hadr (Fast) | 3-4 sec | Speed-critical apps |
| Murattal (Standard) | 5-7 sec | **RECOMMENDED** - balanced |
| Mujawwad (Beautified) | 8-10 sec | Tajweed training |

## Storage by Qira'at

If you want to focus on ONE qirati'ah:

```python
# Filter for Hafs only
from datasets import load_dataset
ds_hafs = load_dataset("Buraaq/quran-md-ayahs", streaming=True)
# Filter to Hafs reciters only during loading

# Filter for Warsh only  (only in Buraaq)
# Need to explicitly filter for Warsh reciters
# (Husary Warsh, Yassin Warsh)
```

## Troubleshooting

**Q: Download is very slow**
A: Your ISP might throttle HuggingFace traffic. Try:
- Using a VPN
- Downloading at off-peak hours (3 AM - 6 AM)
- Splitting download across multiple days

**Q: Download was interrupted, can I resume?**
A: Yes. Run the same command again - it will resume from where it stopped.

**Q: I don't have 200 GB free**
A: Use streaming mode instead (Option 3 above) - streams data on-the-fly.

**Q: Which dataset is smallest?**
A: obadx metadata is ~35KB, but audio files are variable. Start with streaming + small test sample.

## Next Steps

1. **Download one dataset** (follow Option 1 or 2 above)
2. **Verify download**:
   ```bash
   ls -lh data/raw/buraaq/  # or your chosen dataset
   ```
3. **Process datasets**:
   ```bash
   python quranic_qiraat_ml/scripts/process_and_merge_datasets.py
   ```
4. **Train model**:
   ```bash
   python quranic_qiraat_ml/src/train.py
   ```

---

**Created**: March 1, 2026  
**Status**: Ready for download  
**Last Updated**: 2026-03-01
