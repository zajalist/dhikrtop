# 📓 Jupyter Notebooks Guide

Complete interactive walkthroughs for the Quranic Qira'at ML system.

## Notebooks

### 1. **1_quickstart.ipynb** - 15-Minute Quick Start ⚡
**Best for**: Getting started immediately

**Contents**:
- Setup & verification
- Data checking
- Load sample audio
- Detect Tajweed rules
- Prepare dataset
- Initialize model
- VRAM usage check

**Time**: ~15 minutes  
**Prerequisites**: None (just installed dependencies)

---

### 2. **2_training.ipynb** - Training Walkthrough 🚀
**Best for**: Understanding the training process

**Contents**:
- Configuration setup
- Load preprocessed data
- Initialize model & trainer
- VRAM monitoring
- Weights & Biases setup
- Training visualization
- Expected performance curves

**Time**: ~30 minutes  
**Prerequisites**: Preprocessed dataset

---

### 3. **3_tajweed_analysis.ipynb** - Deep Dive into Tajweed Rules 🎓
**Best for**: Learning about Islamic rules

**Contents**:
- Rules database exploration
- Individual rule detection (Ghunnah, Idgham, Imalah, Lam Tafkhim)
- Complete Tajweed evaluation
- Visualize rule scores
- Hafs vs Warsh comparison
- Batch analysis
- Islamic standards reference

**Time**: ~45 minutes  
**Prerequisites**: Sample audio files

---

### 4. **4_evaluation.ipynb** - Model Evaluation & Inference 🧪
**Best for**: Testing trained models

**Contents**:
- Load trained model
- Test set evaluation
- Single sample inference
- Batch inference
- Performance metrics
- Confusion matrix
- Visualizations
- Troubleshooting

**Time**: ~30 minutes  
**Prerequisites**: Trained model checkpoint

---

## Quick Start Path

### New User (First Time)
1. ✅ **1_quickstart.ipynb** (15 min)
2. 🔧 Setup data
3. ✅ **2_training.ipynb** (30 min) 
4. 🚀 Run training

### Data Scientist
1. ✅ **3_tajweed_analysis.ipynb** (45 min)
2. ✅ **4_evaluation.ipynb** (30 min)
3. 📊 Analyze results

### Production Use
1. ✅ Run all notebooks sequentially
2. 🔄 Monitor metrics
3. 📈 Optimize hyperparameters

---

## Running Notebooks

### Launch Jupyter Lab
```bash
cd quranic_qiraat_ml/
jupyter lab
```

### Or Jupyter Notebook
```bash
jupyter notebook
```

### Or VS Code
- Install "Jupyter" extension
- Open `.ipynb` file
- Run cells with Shift+Enter

---

## Requirements

- Python 3.10+
- Jupyter or JupyterLab
- All dependencies from `requirements.txt`
- Optional: scikit-learn, pandas, seaborn (for evaluation)

---

## Tips

### Cell Execution
- **Ctrl+Enter**: Run current cell
- **Shift+Enter**: Run and move to next
- **Alt+Enter**: Run and insert new cell

### Magic Commands
```python
%time            # Time cell execution
%timeit          # Time multiple runs
%matplotlib inline  # Show plots inline
```

### Restart Kernel
If you encounter issues:
1. Kernel → Restart
2. Re-run all cells from top

---

## Common Issues

**ModuleNotFoundError**: 
```python
# Add to first cell:
import sys
sys.path.insert(0, './src')
```

**CUDA out of memory**:
- Reduce batch size in config
- Enable gradient checkpointing
- Clear GPU cache: `torch.cuda.empty_cache()`

**Audio files not found**:
- Verify paths in notebook
- Check `data/raw/hafs/` and `data/raw/warsh/` directories

---

## Notebook Features

All notebooks include:
- ✅ Clear section headers
- ✅ Explanatory text
- ✅ Error handling
- ✅ Visualization
- ✅ Progress bars
- ✅ Logging output

---

**Start here**: Open `1_quickstart.ipynb` in Jupyter!
