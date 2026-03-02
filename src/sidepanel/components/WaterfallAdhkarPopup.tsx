import React, { useState, useEffect } from 'react';
import './WaterfallAdhkarPopup.css';

export interface AdhkarDisplay {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  category?: string;
  source?: string;
}

export interface WaterfallConfig {
  showArabic?: boolean;
  showTransliteration?: boolean;
  showEnglish?: boolean;
  animationDuration?: number; // ms
  staggerDelay?: number; // ms between each element
  theme?: 'light' | 'dark';
}

interface WaterfallAdhkarPopupProps {
  adhkar: AdhkarDisplay;
  config?: WaterfallConfig;
  onDismiss?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onSnooze?: () => void;
}

const defaultConfig: WaterfallConfig = {
  showArabic: true,
  showTransliteration: true,
  showEnglish: true,
  animationDuration: 600,
  staggerDelay: 150,
  theme: 'dark',
};

export const WaterfallAdhkarPopup: React.FC<WaterfallAdhkarPopupProps> = ({
  adhkar,
  config = {},
  onDismiss,
  onLike,
  onDislike,
  onSnooze,
}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  const handleLike = () => {
    setIsVisible(false);
    setTimeout(() => onLike?.(), 300);
  };

  const handleDislike = () => {
    setIsVisible(false);
    setTimeout(() => onDislike?.(), 300);
  };

  const handleSnooze = () => {
    setIsVisible(false);
    setTimeout(() => onSnooze?.(), 300);
  };

  return (
    <div
      className={`waterfall-popup-overlay ${finalConfig.theme} ${
        isVisible ? 'visible' : 'hidden'
      }`}
      onClick={handleDismiss}
    >
      <div
        className="waterfall-popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient background */}
        <div className="waterfall-gradient-bg" />

        {/* Content wrapper */}
        <div className="waterfall-content">
          {/* Arabic Text */}
          {finalConfig.showArabic && (
            <div
              className="waterfall-text-block arabic"
              style={{
                animationDelay: `0ms`,
                animationDuration: `${finalConfig.animationDuration}ms`,
              }}
            >
              <div className="waterfall-label">Adhkar</div>
              <p className="waterfall-arabic-text">{adhkar.arabic}</p>
            </div>
          )}

          {/* Transliteration */}
          {finalConfig.showTransliteration && (
            <div
              className="waterfall-text-block transliteration"
              style={{
                animationDelay: `${finalConfig.staggerDelay}ms`,
                animationDuration: `${finalConfig.animationDuration}ms`,
              }}
            >
              <div className="waterfall-label">Transliteration</div>
              <p className="waterfall-transliteration-text">
                {adhkar.transliteration}
              </p>
            </div>
          )}

          {/* English Translation */}
          {finalConfig.showEnglish && (
            <div
              className="waterfall-text-block english"
              style={{
                animationDelay: `${finalConfig.staggerDelay * 2}ms`,
                animationDuration: `${finalConfig.animationDuration}ms`,
              }}
            >
              <div className="waterfall-label">Translation</div>
              <p className="waterfall-english-text">{adhkar.english}</p>
            </div>
          )}

          {/* Source */}
          {adhkar.source && (
            <div
              className="waterfall-source"
              style={{
                animationDelay: `${finalConfig.staggerDelay * 3}ms`,
                animationDuration: `${finalConfig.animationDuration}ms`,
              }}
            >
              <span className="source-label">Source:</span>
              <span className="source-text">{adhkar.source}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="waterfall-actions">
          <button
            className={`waterfall-btn btn-snooze ${
              hoveredButton === 'snooze' ? 'hovered' : ''
            }`}
            onClick={handleSnooze}
            onMouseEnter={() => setHoveredButton('snooze')}
            onMouseLeave={() => setHoveredButton(null)}
            title="Remind me later"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="13" r="8" strokeWidth="2" />
              <path d="M12 9v4l3 2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Snooze</span>
          </button>

          <button
            className={`waterfall-btn btn-dislike ${
              hoveredButton === 'dislike' ? 'hovered' : ''
            }`}
            onClick={handleDislike}
            onMouseEnter={() => setHoveredButton('dislike')}
            onMouseLeave={() => setHoveredButton(null)}
            title="Don't show this adhkar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 2.05L5 11m0 0a1 1 0 001 1h6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            className={`waterfall-btn btn-like ${
              hoveredButton === 'like' ? 'hovered' : ''
            }`}
            onClick={handleLike}
            onMouseEnter={() => setHoveredButton('like')}
            onMouseLeave={() => setHoveredButton(null)}
            title="Like this adhkar"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <button
            className={`waterfall-btn btn-dismiss ${
              hoveredButton === 'dismiss' ? 'hovered' : ''
            }`}
            onClick={handleDismiss}
            onMouseEnter={() => setHoveredButton('dismiss')}
            onMouseLeave={() => setHoveredButton(null)}
            title="Close"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" stroke="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterfallAdhkarPopup;
