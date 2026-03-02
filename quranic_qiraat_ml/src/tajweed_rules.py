"""
tajweed_rules.py - Quranic Tajweed Rule Detection and Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Functions:
- detect_ghunnah(): Nasal resonance detection (Hafs ~30-40ms, Warsh ~40-60ms)
- detect_idgham(): Consonant assimilation (7 pairs, 3 types)
- detect_imalah(): Alef/Ya shifting (Warsh-specific)
- detect_lam_tafkhim(): Lam emphasis rules
- validate_tajweed(): Cross-reference against canonical rules
- score_tajweed_accuracy(): Output {rule: score_0_to_100}

Islamic Standards:
- Reference: Traditional Tajweed books (Ibn Al-Jazari, Mujood, An-Nahdhan)
- Hafs: Most widespread, Egyptian standard
- Warsh: North African (Morocco, Algeria), strong Imalah
"""

import json
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple

import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENUMS & DATA STRUCTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class QiraatVariant(Enum):
    """Supported Quranic reading variants"""

    HAFS = "Hafs"
    WARSH = "Warsh"
    QALUN = "Qalun"
    AD_DURI = "Ad-Duri"
    IBN_KATHIR = "Ibn Kathir"


class IdghamType(Enum):
    """Three types of Idgham (Consonant Assimilation)"""

    PERFECT = "perfect"  # كامل - Complete assimilation
    NASAL = "nasal"  # بغنة - With nasal resonance (Ghunnah)
    PARTIAL = "partial"  # ناقص - Partial assimilation


@dataclass
class TajweedRule:
    """Single Tajweed rule definition"""

    rule_id: str
    rule_name: str
    arabic_name: str
    description: str

    # Duration ranges (milliseconds)
    duration_min_ms: Optional[float] = None
    duration_max_ms: Optional[float] = None

    # Affected letters
    affected_letters: List[str] = field(default_factory=list)

    # Qira'at-specific traits
    hafs_specific: bool = False
    warsh_specific: bool = False

    # Detection method
    detection_method: str = "spectral"  # spectral, temporal, linguistic

    # Confidence threshold
    confidence_threshold: float = 0.7


@dataclass
class TajweedViolation:
    """Single detected Tajweed violation"""

    rule_id: str
    rule_name: str
    ayah_ref: str  # e.g., "1:1" for Surah 1, Ayah 1
    severity: str  # "critical", "major", "minor"
    confidence: float  # 0.0-1.0
    suggested_correction: str = ""
    detected_value: Optional[float] = None  # e.g., duration in ms
    expected_value: Optional[float] = None


@dataclass
class TajweedScore:
    """Complete Tajweed evaluation output"""

    qiraat: str
    overall_accuracy: float  # 0.0-1.0
    rule_scores: Dict[str, float]  # {rule_id: score}
    violations: List[TajweedViolation] = field(default_factory=list)
    qiraat_confidence: float = 0.0  # Confidence in Qira'at classification


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CANONICAL TAJWEED RULES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class TajweedRuleDB:
    """Database of canonical Tajweed rules"""

    RULES = {
        "ghunnah": TajweedRule(
            rule_id="ghunnah",
            rule_name="Ghunnah (Nasal Resonance)",
            arabic_name="الغنة",
            description="Nasal resonance in Meem or Noon (~20-60ms)",
            duration_min_ms=20,
            duration_max_ms=60,
            affected_letters=["م", "ن"],  # Meem, Noon
            detection_method="spectral",  # Formant analysis
            confidence_threshold=0.75,
        ),
        "idgham_perfect": TajweedRule(
            rule_id="idgham_perfect",
            rule_name="Idgham Perfect (Full Assimilation)",
            arabic_name="الإدغام الكامل",
            description="Complete consonant assimilation without Ghunnah",
            affected_letters=["ل", "ر"],  # Lam, Ra (into same letter)
            detection_method="temporal",  # Duration comparison
            confidence_threshold=0.8,
        ),
        "idgham_nasal": TajweedRule(
            rule_id="idgham_nasal",
            rule_name="Idgham with Ghunnah (Nasal)",
            arabic_name="الإدغام بغنة",
            description="Assimilation with nasal resonance (Noon/Meem → Y/W/M)",
            duration_min_ms=30,
            duration_max_ms=50,
            affected_letters=["ن", "م"],
            detection_method="spectral",
            confidence_threshold=0.75,
        ),
        "imalah": TajweedRule(
            rule_id="imalah",
            rule_name="Imalah (Vowel Shifting)",
            arabic_name="الإمالة",
            description="Shift of Alef toward Ya sound (Warsh-specific, strong)",
            affected_letters=["ا"],  # Alef
            warsh_specific=True,
            detection_method="spectral",  # Formant frequency shift
            confidence_threshold=0.75,
        ),
        "lam_tafkhim": TajweedRule(
            rule_id="lam_tafkhim",
            rule_name="Lam Tafkhim (Emphasis)",
            arabic_name="تفخيم اللام",
            description="Emphasis on Lam after Damma (Hafs-specific)",
            affected_letters=["ل"],
            hafs_specific=True,
            detection_method="spectral",  # Formant frequency
            confidence_threshold=0.7,
        ),
        "qasr_vs_madd": TajweedRule(
            rule_id="qasr_vs_madd",
            rule_name="Qasr vs. Madd (Short vs. Long)",
            arabic_name="القصر والمد",
            description="Short vowels (Qasr ~100ms) vs. Long (Madd ~200-300ms)",
            duration_min_ms=100,
            duration_max_ms=300,
            detection_method="temporal",  # Duration measurement
            confidence_threshold=0.8,
        ),
        "hamza_handling": TajweedRule(
            rule_id="hamza_handling",
            rule_name="Hamza Handling",
            arabic_name="الهمز",
            description="Stop glottis or soft handling of Hamza",
            affected_letters=["ء"],
            detection_method="spectral",
            confidence_threshold=0.7,
        ),
    }

    @classmethod
    def get_rule(cls, rule_id: str) -> Optional[TajweedRule]:
        """Get rule by ID"""
        return cls.RULES.get(rule_id)

    @classmethod
    def get_all_rules(cls) -> Dict[str, TajweedRule]:
        """Get all rules"""
        return cls.RULES.copy()

    @classmethod
    def get_qiraat_rules(cls, qiraat: str) -> List[TajweedRule]:
        """Get variant-specific rules"""
        rules = []
        for rule in cls.RULES.values():
            if qiraat == "Hafs" and rule.hafs_specific:
                rules.append(rule)
            elif qiraat == "Warsh" and rule.warsh_specific:
                rules.append(rule)
            elif not rule.hafs_specific and not rule.warsh_specific:
                # Common rules
                rules.append(rule)
        return rules


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DETECTION FUNCTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


class TajweedDetector:
    """Detect and score Tajweed rules"""

    def __init__(self, sample_rate: int = 16000):
        """
        Initialize detector.

        Args:
            sample_rate: Audio sample rate (Hz)
        """
        self.sample_rate = sample_rate
        self.frame_duration_ms = 20
        self.frame_samples = int(sample_rate * self.frame_duration_ms / 1000)
        self.rules = TajweedRuleDB.get_all_rules()

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SPECTRAL ANALYSIS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def compute_spectral_features(
        self,
        waveform: np.ndarray,
    ) -> Dict[str, np.ndarray]:
        """
        Compute spectral features for Tajweed detection.

        Args:
            waveform: Audio waveform

        Returns:
            {
                'stft': Complex STFT matrix,
                'magnitude': Magnitude spectrum,
                'spectrogram': Power spectrogram,
                'mfcc': Mel-Frequency Cepstral Coefficients,
                'energy': Frame energy
            }
        """
        from scipy.fftpack import fft
        from scipy.signal import hamming

        features = {}

        # Short-Time Fourier Transform
        window = hamming(self.frame_samples)
        stft_frames = []

        for i in range(0, len(waveform) - self.frame_samples, self.frame_samples):
            frame = waveform[i : i + self.frame_samples] * window
            stft_frame = fft(frame)
            stft_frames.append(stft_frame)

        features["stft"] = np.array(stft_frames)
        features["magnitude"] = np.abs(features["stft"])
        features["spectrogram"] = features["magnitude"] ** 2

        # Energy
        features["energy"] = np.sum(features["magnitude"], axis=1)

        return features

    def detect_formant_shift(
        self,
        spectrogram: np.ndarray,
        baseline_freq: float = 500,  # Hz
        threshold: float = 50,  # Hz
    ) -> Tuple[float, float]:
        """
        Detect formant frequency shift (for Imalah, Lam Tafkhim).

        Args:
            spectrogram: Power spectrogram
            baseline_freq: Expected formant frequency
            threshold: Detection threshold

        Returns:
            (formant_freq, confidence)
        """
        # Find peak frequencies
        peak_indices = np.argmax(spectrogram, axis=0)
        peak_freqs = peak_indices * (self.sample_rate / spectrogram.shape[0])

        mean_freq = np.mean(peak_freqs)
        shift = abs(mean_freq - baseline_freq)

        # Confidence based on consistency
        consistency = 1 - (np.std(peak_freqs) / mean_freq)
        confidence = max(0, 1 - (shift / threshold)) * consistency

        return mean_freq, confidence

    def detect_nasal_resonance(
        self,
        spectrogram: np.ndarray,
    ) -> Tuple[float, float]:
        """
        Detect nasal resonance (Ghunnah) via spectral peaks.

        Nasal sounds (Meem, Noon) have characteristic formants ~250Hz and ~2000Hz.

        Returns:
            (ghunnah_score, confidence)
        """
        # Extract nasal formant region (200-300 Hz)
        nasal_freq_idx = int(250 * spectrogram.shape[0] / self.sample_rate)
        nasal_energy = np.mean(
            spectrogram[nasal_freq_idx - 10 : nasal_freq_idx + 10, :]
        )

        # Compare to broadband
        total_energy = np.mean(spectrogram)
        nasal_ratio = nasal_energy / (total_energy + 1e-6)

        # Score: 0-100
        score = min(100, nasal_ratio * 100)
        confidence = min(1.0, nasal_ratio)

        return score, confidence

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TEMPORAL ANALYSIS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def measure_segment_duration(
        self,
        energy: np.ndarray,
        threshold_percentile: float = 50,
    ) -> float:
        """
        Measure duration of voiced segment.

        Args:
            energy: Frame energy
            threshold_percentile: Percentile for voice activity

        Returns:
            Duration in milliseconds
        """
        threshold = np.percentile(energy, threshold_percentile)
        voiced_frames = energy > threshold
        num_voiced = np.sum(voiced_frames)
        duration_ms = num_voiced * self.frame_duration_ms

        return duration_ms

    def detect_qasr_vs_madd(
        self,
        energy: np.ndarray,
    ) -> Tuple[str, float, float]:
        """
        Detect Qasr (short) vs. Madd (long) vowels via duration.

        - Qasr: ~100ms
        - Madd: ~200-300ms

        Returns:
            (classification, duration_ms, confidence)
        """
        duration = self.measure_segment_duration(energy)

        if duration < 150:
            classification = "qasr"
            confidence = 1 - (duration / 100)
        else:
            classification = "madd"
            confidence = 1 - (abs(duration - 250) / 150)

        confidence = max(0, min(1, confidence))

        return classification, duration, confidence

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # HIGH-LEVEL DETECTION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def detect_ghunnah(
        self,
        waveform: np.ndarray,
    ) -> Dict[str, float]:
        """
        Detect Ghunnah (nasal resonance).

        Differences:
        - Hafs: ~30-40ms
        - Warsh: ~40-60ms

        Returns:
            {
                'score': 0-100,
                'confidence': 0-1,
                'duration_ms': estimated duration,
            }
        """
        features = self.compute_spectral_features(waveform)
        score, confidence = self.detect_nasal_resonance(features["spectrogram"])
        duration = self.measure_segment_duration(features["energy"])

        return {
            "score": score,
            "confidence": confidence,
            "duration_ms": duration,
        }

    def detect_idgham(
        self,
        waveform: np.ndarray,
    ) -> Dict[str, float]:
        """
        Detect Idgham (consonant assimilation).

        Returns:
            {
                'score': 0-100,
                'confidence': 0-1,
                'type': 'perfect' | 'nasal' | 'partial',
            }
        """
        features = self.compute_spectral_features(waveform)

        # Check for nasal resonance (indicates nasal idgham)
        nasal_score, nasal_conf = self.detect_nasal_resonance(features["spectrogram"])

        if nasal_score > 50:
            idgham_type = "nasal"
        else:
            idgham_type = "perfect"

        return {
            "score": nasal_score,
            "confidence": nasal_conf,
            "type": idgham_type,
        }

    def detect_imalah(
        self,
        waveform: np.ndarray,
    ) -> Dict[str, float]:
        """
        Detect Imalah (vowel shift toward Ya).

        Strong in Warsh, weak/absent in Hafs.

        Returns:
            {
                'score': 0-100,
                'confidence': 0-1,
                'formant_shift_hz': frequency shift,
            }
        """
        features = self.compute_spectral_features(waveform)
        formant_freq, formant_conf = self.detect_formant_shift(
            features["spectrogram"],
            baseline_freq=700,  # Typical Alef formant
            threshold=150,
        )

        formant_shift = formant_freq - 700

        # Score: stronger shift = higher Imalah
        imalah_score = min(100, abs(formant_shift))

        return {
            "score": imalah_score,
            "confidence": formant_conf,
            "formant_shift_hz": formant_shift,
        }

    def detect_lam_tafkhim(
        self,
        waveform: np.ndarray,
    ) -> Dict[str, float]:
        """
        Detect Lam Tafkhim (Lam emphasis).

        Hafs-specific emphasis after Damma.

        Returns:
            {
                'score': 0-100,
                'confidence': 0-1,
            }
        """
        features = self.compute_spectral_features(waveform)

        # Lower formants for emphasized (backed) consonants
        formant_freq, formant_conf = self.detect_formant_shift(
            features["spectrogram"],
            baseline_freq=1000,  # Lam formant
            threshold=200,
        )

        # Emphasis lowers formants
        formant_shift = 1000 - formant_freq

        tafkhim_score = min(100, formant_shift * 2)  # Scale to 0-100

        return {
            "score": max(0, tafkhim_score),
            "confidence": formant_conf,
        }

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # OVERALL EVALUATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def score_tajweed(
        self,
        waveform: np.ndarray,
        predicted_qiraat: str,
        expected_qiraat: str,
        qiraat_confidence: float = 0.9,
    ) -> TajweedScore:
        """
        Comprehensive Tajweed scoring.

        Args:
            waveform: Audio waveform
            predicted_qiraat: Predicted Qira'at (Hafs/Warsh)
            expected_qiraat: Expected Qira'at
            qiraat_confidence: Confidence in Qira'at prediction

        Returns:
            TajweedScore with all violations and scores
        """
        violations = []
        rule_scores = {}

        # Detect all rules
        ghunnah_result = self.detect_ghunnah(waveform)
        rule_scores["ghunnah"] = ghunnah_result["score"]

        idgham_result = self.detect_idgham(waveform)
        rule_scores["idgham"] = idgham_result["score"]

        imalah_result = self.detect_imalah(waveform)
        rule_scores["imalah"] = imalah_result["score"]

        lam_tafkhim_result = self.detect_lam_tafkhim(waveform)
        rule_scores["lam_tafkhim"] = lam_tafkhim_result["score"]

        # Variant-specific validation
        if expected_qiraat == "Warsh":
            if imalah_result["score"] < 40:
                violations.append(
                    TajweedViolation(
                        rule_id="imalah",
                        rule_name="Imalah (Weak in Warsh)",
                        ayah_ref="N/A",
                        severity="major",
                        confidence=imalah_result["confidence"],
                        detected_value=imalah_result["score"],
                        expected_value=70,
                    )
                )

        if expected_qiraat == "Hafs":
            if lam_tafkhim_result["score"] < 30:
                violations.append(
                    TajweedViolation(
                        rule_id="lam_tafkhim",
                        rule_name="Lam Tafkhim (Weak in Hafs)",
                        ayah_ref="N/A",
                        severity="minor",
                        confidence=lam_tafkhim_result["confidence"],
                        detected_value=lam_tafkhim_result["score"],
                        expected_value=60,
                    )
                )

        # Overall accuracy
        avg_score = np.mean([s for s in rule_scores.values()])
        overall_accuracy = avg_score / 100

        return TajweedScore(
            qiraat=predicted_qiraat,
            overall_accuracy=overall_accuracy,
            rule_scores=rule_scores,
            violations=violations,
            qiraat_confidence=qiraat_confidence,
        )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXPORT & UTILITIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def tajweed_score_to_json(score: TajweedScore) -> Dict:
    """Convert TajweedScore to JSON-serializable dict"""
    return {
        "qiraat": score.qiraat,
        "overall_accuracy": round(score.overall_accuracy, 3),
        "qiraat_confidence": round(score.qiraat_confidence, 3),
        "rule_scores": {k: round(v, 1) for k, v in score.rule_scores.items()},
        "violations": [
            {
                "rule_id": v.rule_id,
                "rule_name": v.rule_name,
                "severity": v.severity,
                "confidence": round(v.confidence, 3),
            }
            for v in score.violations
        ],
    }


if __name__ == "__main__":
    # Example usage
    import librosa

    # Load sample audio
    sample_audio, sr = librosa.load("sample_hafs.wav", sr=16000)

    # Initialize detector
    detector = TajweedDetector(sample_rate=16000)

    # Score Tajweed
    score = detector.score_tajweed(
        waveform=sample_audio,
        predicted_qiraat="Hafs",
        expected_qiraat="Hafs",
        qiraat_confidence=0.92,
    )

    print("Tajweed Score:")
    print(json.dumps(tajweed_score_to_json(score), indent=2, ensure_ascii=False))
