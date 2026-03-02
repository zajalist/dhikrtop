"""
Quranic Qira'at ML Core System

Multi-Task Learning for Hafs/Warsh Differentiation & Tajweed Rule Verification

Modules:
- preprocess: Audio loading, normalization, dataset preparation
- tajweed_rules: Tajweed rule detection and scoring
- train: Multi-Task Learning training loop with LoRA fine-tuning
"""

__version__ = "1.0.0"
__author__ = "Agentic Development System"
__date__ = "March 1, 2026"

try:
    from . import preprocess, tajweed_rules, train
except ImportError:
    # Module can be imported even if submodules fail
    pass
