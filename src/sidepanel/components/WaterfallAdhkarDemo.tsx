import React, { useState } from 'react';
import WaterfallAdhkarPopup, {
  AdhkarDisplay,
  WaterfallConfig,
} from './WaterfallAdhkarPopup';

/**
 * Demo Component for Waterfall Adhkar Popup
 * Shows various configurations and examples
 */
export const WaterfallAdhkarDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedExample, setSelectedExample] = useState<'full' | 'arabic-only' | 'english-only' | 'light'>('full');

  // Example adhkar
  const adhkarExamples: Record<string, AdhkarDisplay> = {
    full: {
      id: '1',
      arabic:
        'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ، الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration:
        'Bismillahir Rahmanir Raheem, Al-hamdu lillahi rabbi l-ʿālamīn',
      english:
        'In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, the Lord of all that exists',
      category: 'morning',
      source: 'Quran (1:1-2)',
    },
    'arabic-only': {
      id: '2',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
      transliteration: 'Subhanallahi wa bihamdihi, Subhanallahil Azeem',
      english:
        'Glory be to Allah and praise be to Him, Glory be to Allah, the Great',
      category: 'general',
      source: 'Sahih Al-Bukhari',
    },
    'english-only': {
      id: '3',
      arabic:
        'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ',
      transliteration:
        "Allahumma inni aʿudhu bika minal-hammi wal-ḥazan, wal-ʿajzi wal-kasal",
      english:
        'O Allah, I seek refuge in You from worry and grief, and from weakness and laziness',
      category: 'work',
      source: 'Sahih Al-Bukhari',
    },
    light: {
      id: '4',
      arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
      transliteration:
        'La hawla wa la quwwata illa billahil ʿAliyyil ʿAzeem',
      english:
        'There is no power and no strength except with Allah, the Most High, the Most Great',
      category: 'general',
      source: 'Quran (18:39)',
    },
  };

  const configExamples: Record<string, WaterfallConfig> = {
    full: {
      showArabic: true,
      showTransliteration: true,
      showEnglish: true,
      animationDuration: 600,
      staggerDelay: 150,
      theme: 'dark',
    },
    'arabic-only': {
      showArabic: true,
      showTransliteration: false,
      showEnglish: true,
      animationDuration: 500,
      staggerDelay: 120,
      theme: 'dark',
    },
    'english-only': {
      showArabic: false,
      showTransliteration: true,
      showEnglish: true,
      animationDuration: 700,
      staggerDelay: 180,
      theme: 'dark',
    },
    light: {
      showArabic: true,
      showTransliteration: true,
      showEnglish: true,
      animationDuration: 600,
      staggerDelay: 150,
      theme: 'light',
    },
  };

  const handleDismiss = () => {
    console.log('Dismissed');
    setIsVisible(false);
  };

  const handleLike = () => {
    console.log('Liked adhkar:', selectedExample);
    setIsVisible(false);
  };

  const handleDislike = () => {
    console.log('Disliked adhkar:', selectedExample);
    setIsVisible(false);
  };

  const handleSnooze = () => {
    console.log('Snoozed');
    setIsVisible(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🌊 Waterfall Adhkar Popup - Demo</h1>
        <p>Modern popup with cascading animation effects</p>
      </div>

      {/* Configuration Selector */}
      <div style={styles.configSection}>
        <h2>Choose Configuration</h2>
        <div style={styles.buttonGroup}>
          {(
            Object.keys(
              adhkarExamples
            ) as Array<keyof typeof adhkarExamples>
          ).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedExample(key);
                setIsVisible(true);
              }}
              style={{
                ...styles.configButton,
                backgroundColor:
                  selectedExample === key ? '#3b82f6' : '#e2e8f0',
                color: selectedExample === key ? 'white' : '#1a1a1a',
              }}
            >
              {key.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div style={styles.features}>
        <h2>Features</h2>
        <ul style={styles.featureList}>
          <li>✨ Waterfall cascade animation with configurable delays</li>
          <li>📝 Arabic, Transliteration, and English text</li>
          <li>🎨 Modern glassmorphism design inspired by ReactBits.dev</li>
          <li>🌓 Light and dark theme support</li>
          <li>⚙️ Fully configurable display options</li>
          <li>💫 Smooth interactions with hover effects</li>
          <li>♥️ Like, Dislike, Snooze, and Dismiss actions</li>
          <li>📱 Responsive design for mobile and desktop</li>
          <li>🎯 Source attribution display</li>
          <li>♿ Accessibility support (keyboard navigation, reduced motion)</li>
        </ul>
      </div>

      {/* Configuration Details */}
      <div style={styles.configDetails}>
        <h2>Configuration: {selectedExample.toUpperCase()}</h2>
        <pre style={styles.configCode}>
          {JSON.stringify(configExamples[selectedExample], null, 2)}
        </pre>
      </div>

      {/* Popup Instance */}
      {isVisible && (
        <WaterfallAdhkarPopup
          adhkar={adhkarExamples[selectedExample]}
          config={configExamples[selectedExample]}
          onDismiss={handleDismiss}
          onLike={handleLike}
          onDislike={handleDislike}
          onSnooze={handleSnooze}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center' as const,
  },
  configSection: {
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    marginTop: '12px',
  },
  configButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  features: {
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '12px 0 0 0',
  },
  configDetails: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  configCode: {
    backgroundColor: '#0f172a',
    color: '#e0e7ff',
    padding: '16px',
    borderRadius: '8px',
    overflowX: 'auto' as const,
    fontSize: '12px',
    fontFamily: '"Fira Code", monospace',
  },
};

export default WaterfallAdhkarDemo;
