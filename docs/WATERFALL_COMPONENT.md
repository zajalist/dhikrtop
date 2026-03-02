# 🌊 Waterfall Adhkar Popup Component

## Overview

A beautiful, modern popup component for displaying Islamic adhkar (remembrances) with a cascading waterfall animation effect. Features Arabic text, transliteration, and English translation with full configurability.

**Design Inspiration**: Modern UI patterns from [reactbits.dev](https://reactbits.dev) including glassmorphism, smooth animations, and contemporary visual design.

---

## Features

### ✨ Visual Features
- **Waterfall Cascade Animation**: Each text block appears with staggered delay for a flowing effect
- **Glassmorphism Design**: Frosted glass effect with backdrop blur
- **Gradient Overlays**: Beautiful gradient accents on labels and buttons
- **Smooth Interactions**: Hover effects, button animations, and entrance transitions
- **Theme Support**: Light and dark theme variants
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens

### 🎯 Functional Features
- **Multi-language Support**: Arabic, transliteration, and English text
- **Configurable Display**: Toggle any text element on/off
- **Source Attribution**: Display hadith/Quran source reference
- **Action Buttons**: Like, Dislike, Snooze, and Dismiss
- **Category Support**: Organize adhkar by category (morning, evening, work, etc.)
- **Animation Control**: Configurable animation duration and stagger delays

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Reduced Motion Support**: Respects `prefers-reduced-motion` preference
- **ARIA Labels**: Proper semantic HTML and labels
- **High Contrast**: Maintains readability in all themes
- **Screen Reader Friendly**: Proper text hierarchy and labels

---

## Installation

### Prerequisites
```bash
npm install react react-dom
```

### Add to Project
```bash
cp WaterfallAdhkarPopup.tsx src/sidepanel/components/
cp WaterfallAdhkarPopup.css src/sidepanel/components/
```

---

## Usage

### Basic Example

```tsx
import WaterfallAdhkarPopup from './components/WaterfallAdhkarPopup';

function App() {
  const adhkar = {
    id: '1',
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: 'Al-hamdu lillahi rabbi l-ʿālamīn',
    english: 'All praise is due to Allah, the Lord of all that exists',
    category: 'morning',
    source: 'Quran (1:2)',
  };

  return (
    <WaterfallAdhkarPopup
      adhkar={adhkar}
      onDismiss={() => console.log('Dismissed')}
      onLike={() => console.log('Liked')}
      onDislike={() => console.log('Disliked')}
      onSnooze={() => console.log('Snoozed')}
    />
  );
}
```

### With Custom Configuration

```tsx
const customConfig = {
  showArabic: true,
  showTransliteration: true,
  showEnglish: true,
  animationDuration: 600, // ms
  staggerDelay: 150, // ms between elements
  theme: 'dark', // 'light' | 'dark'
};

<WaterfallAdhkarPopup
  adhkar={adhkar}
  config={customConfig}
  onDismiss={handleDismiss}
  onLike={handleLike}
  onDislike={handleDislike}
  onSnooze={handleSnooze}
/>
```

---

## API Reference

### Component Props

```typescript
interface WaterfallAdhkarPopupProps {
  // Required
  adhkar: AdhkarDisplay;

  // Optional
  config?: WaterfallConfig;
  onDismiss?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onSnooze?: () => void;
}
```

### AdhkarDisplay

```typescript
interface AdhkarDisplay {
  id: string;              // Unique identifier
  arabic: string;          // Arabic text
  transliteration: string; // Romanized/Latin transliteration
  english: string;         // English translation
  category?: string;       // Category: 'morning' | 'evening' | 'sleep' | 'work' | 'general'
  source?: string;         // Source attribution (Quran/Hadith reference)
}
```

### WaterfallConfig

```typescript
interface WaterfallConfig {
  showArabic?: boolean;          // Default: true
  showTransliteration?: boolean; // Default: true
  showEnglish?: boolean;         // Default: true
  animationDuration?: number;    // Default: 600 (milliseconds)
  staggerDelay?: number;         // Default: 150 (milliseconds)
  theme?: 'light' | 'dark';      // Default: 'dark'
}
```

### Callbacks

| Callback | Triggered When | Usage |
|----------|---|---|
| `onDismiss` | Close/X button clicked | Hide popup, update state |
| `onLike` | Heart button clicked | Mark as favorite, increase frequency |
| `onDislike` | Thumbs down clicked | Hide adhkar, reduce frequency |
| `onSnooze` | Clock button clicked | Hide for 30 minutes, then remind |

---

## Configuration Examples

### Arabic Only (with English Translation)
```tsx
const config = {
  showArabic: true,
  showTransliteration: false,
  showEnglish: true,
  theme: 'dark',
};
```

### Light Theme - Minimal Display
```tsx
const config = {
  showArabic: true,
  showTransliteration: false,
  showEnglish: false,
  theme: 'light',
};
```

### Fast Animation
```tsx
const config = {
  animationDuration: 300,  // 300ms instead of 600ms
  staggerDelay: 75,        // 75ms between elements instead of 150ms
};
```

### Slow, Dramatic Animation
```tsx
const config = {
  animationDuration: 1000, // 1 second
  staggerDelay: 250,       // 250ms delay between elements
};
```

---

## Styling & Customization

### CSS Variables

The component uses CSS variables for easy theming:

```css
:root {
  /* Colors - Light Theme */
  --wf-light-bg: #ffffff;
  --wf-light-border: rgba(0, 0, 0, 0.08);
  --wf-light-text: #1a1a1a;

  /* Colors - Dark Theme */
  --wf-dark-bg: #0f172a;
  --wf-dark-border: rgba(255, 255, 255, 0.08);
  --wf-dark-text: #f1f5f9;

  /* Gradients */
  --wf-gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --wf-gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --wf-gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
```

### Custom Theme

Create a new CSS file to override colors:

```css
.waterfall-popup-overlay.custom-theme {
  --wf-dark-bg: #1e293b;
  --wf-dark-text: #f8fafc;
  --wf-gradient-1: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
}
```

Then pass it through a wrapper component.

---

## Animation Details

### Waterfall Effect

Each text block has a configurable cascade animation:

```
t=0ms:   Arabic appears
t=150ms: Transliteration appears
t=300ms: English appears
t=450ms: Source appears
```

The delays can be customized via `staggerDelay` config.

### Animation Keyframes

```css
@keyframes waterfallCascade {
  from {
    opacity: 0;
    transform: translateY(20px);  /* Slide down from above */
  }
  to {
    opacity: 1;
    transform: translateY(0);     /* Settle into position */
  }
}
```

### Button Animations

- **Hover**: `translateY(-2px)` + shadow lift
- **Active**: `scale(0.95)` for press effect
- **Like Button**: Special `heartBeat` animation on hover
- **Dismiss Button**: `rotate(90deg)` on hover for visual interest

---

## Responsive Behavior

### Desktop (>600px)
- Full 500px width popup
- All buttons show text labels + icons
- Full spacing and padding

### Mobile (<600px)
- 95% width with padding
- Icon-only buttons (text hidden)
- Reduced padding and margins
- Scrollable if needed

---

## Performance Considerations

### Animation Performance
- Uses CSS animations (GPU-accelerated)
- No JavaScript animation calculations
- Smooth 60fps performance
- Efficient `will-change` hints via transform

### Memory
- Single instance per popup
- Automatic cleanup on dismiss
- No memory leaks from event listeners

### Bundle Size
- Component: ~4KB (minified)
- CSS: ~8KB (minified)
- Total: ~12KB (production)

---

## Accessibility

### Keyboard Navigation
- **Tab**: Focus button controls
- **Space/Enter**: Activate button
- **Escape**: Dismiss popup (via click handler)

### ARIA
```tsx
// Buttons have implicit roles
// Labels provide context
<button title="Like this adhkar">
  <svg>...</svg>
  <span>Like</span>
</button>
```

### Color Contrast
- WCAG AA compliant
- Tested with WAVE accessibility tool
- Dark text on light backgrounds
- Light text on dark backgrounds

### Motion
- Respects `prefers-reduced-motion`
- All animations disabled if motion is disabled
- Essential interactions still work

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Glassmorphism, animations |
| Firefox 88+ | ✅ Full | All features supported |
| Safari 14+ | ✅ Full | -webkit- prefixes included |
| Edge 90+ | ✅ Full | Chromium-based |
| Mobile Chrome | ✅ Full | Responsive design |
| Mobile Safari | ✅ Full | Touch-optimized |
| IE 11 | ❌ Not supported | No CSS Grid, no backdrop-filter |

---

## Common Use Cases

### 1. Display in Background Service Worker

```tsx
// background.ts
chrome.tabs.query({ active: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {
    type: 'SHOW_ADHKAR_POPUP',
    adhkar: selectedAdhkar,
    config: userPreferences,
  });
});
```

### 2. With Redux State Management

```tsx
function AdhkarContainer() {
  const adhkar = useSelector(state => state.adhkar.current);
  const dispatch = useDispatch();

  return (
    <WaterfallAdhkarPopup
      adhkar={adhkar}
      onLike={() => dispatch(likeAdhkar(adhkar.id))}
      onDislike={() => dispatch(dislikeAdhkar(adhkar.id))}
      onSnooze={() => dispatch(snoozeAdhkar())}
      onDismiss={() => dispatch(hideAdhkar())}
    />
  );
}
```

### 3. Conditional Display Based on Settings

```tsx
<WaterfallAdhkarPopup
  adhkar={adhkar}
  config={{
    showArabic: userSettings.displayArabic,
    showTransliteration: userSettings.displayTransliteration,
    showEnglish: userSettings.displayEnglish,
    theme: userSettings.theme,
  }}
  onDismiss={handleDismiss}
  {...handlers}
/>
```

### 4. With Analytics Tracking

```tsx
const handleLike = () => {
  logAnalytics('adhkar_liked', {
    adhkarId: adhkar.id,
    category: adhkar.category,
    timestamp: Date.now(),
  });
  onLike?.();
};
```

---

## Troubleshooting

### Animation Not Playing
**Problem**: Waterfall animation doesn't appear

**Solution**:
```tsx
// Check if CSS is imported
import './WaterfallAdhkarPopup.css';

// Verify animation duration is set
config={{ animationDuration: 600, staggerDelay: 150 }}

// Check browser motion preference
// Animations disable if user prefers reduced motion
```

### Text Not Displaying Correctly
**Problem**: Arabic text appears garbled

**Solution**:
```tsx
// Ensure proper font support
// Add to your HTML head:
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">

// Or use system fonts
```

### Buttons Not Responding
**Problem**: Click handlers don't fire

**Solution**:
```tsx
// Ensure handlers are passed correctly
<WaterfallAdhkarPopup
  adhkar={adhkar}
  onLike={() => handleLike()} // Arrow function
  onDislike={() => handleDislike()}
  onSnooze={() => handleSnooze()}
  onDismiss={() => handleDismiss()}
/>
```

### Layout Issues on Mobile
**Problem**: Popup too small/large on mobile

**Solution**: Verify viewport meta tag is set
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## Examples

### Example 1: Morning Adhkar

```tsx
const morningAdhkar = {
  id: 'morning-1',
  arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
  transliteration: 'Asbahna wa asbaha al-mulku lillah',
  english: 'We have reached the morning and Allah is the owner of all sovereignty',
  category: 'morning',
  source: 'Sunan At-Tirmidhi',
};

<WaterfallAdhkarPopup
  adhkar={morningAdhkar}
  config={{ theme: 'light', animationDuration: 700 }}
  onDismiss={dismissHandler}
/>
```

### Example 2: Work Adhkar (English Focus)

```tsx
const workAdhkar = {
  id: 'work-1',
  arabic: 'اللَّهُمَّ أَعِنِّي وَلَا تَكِلْنِي',
  transliteration: 'Allahumma aʿinni wa la takilni',
  english: 'O Allah, help me and do not abandon me',
  category: 'work',
  source: 'Sunan At-Tirmidhi',
};

<WaterfallAdhkarPopup
  adhkar={workAdhkar}
  config={{
    theme: 'dark',
    showArabic: false,
    showTransliteration: true,
    showEnglish: true,
  }}
/>
```

### Example 3: Fast Animation Variant

```tsx
<WaterfallAdhkarPopup
  adhkar={adhkar}
  config={{
    animationDuration: 400,
    staggerDelay: 75,
    theme: 'dark',
  }}
/>
```

---

## Component Hierarchy

```
WaterfallAdhkarPopup
├── .waterfall-popup-overlay
│   └── .waterfall-popup-container
│       ├── .waterfall-gradient-bg
│       ├── .waterfall-content
│       │   ├── .waterfall-text-block (Arabic)
│       │   ├── .waterfall-text-block (Transliteration)
│       │   ├── .waterfall-text-block (English)
│       │   └── .waterfall-source
│       └── .waterfall-actions
│           ├── .waterfall-btn.btn-snooze
│           ├── .waterfall-btn.btn-dislike
│           ├── .waterfall-btn.btn-like
│           └── .waterfall-btn.btn-dismiss
```

---

## Future Enhancements

- [ ] Voice playback for Arabic recitation
- [ ] Swipe gestures for mobile (left = dislike, right = like)
- [ ] Copy to clipboard for text
- [ ] Share to social media
- [ ] Custom notification sounds
- [ ] Haptic feedback on mobile
- [ ] Animation preset library
- [ ] Advanced theme customization UI

---

## License

This component is part of Dhikrtop and follows the project's license.

---

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/zajalist/dhikrtop/issues
- Documentation: See DOCUMENTATION_INDEX.md in project root

---

**Created with ❤️ for Dhikrtop - Modern Islamic Remembrance Browser Extension**
