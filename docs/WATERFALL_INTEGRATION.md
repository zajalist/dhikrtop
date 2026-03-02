# Integration Guide - Waterfall Adhkar Popup

## Quick Start (5 minutes)

### Step 1: Copy Files
```bash
cp WaterfallAdhkarPopup.tsx src/sidepanel/components/
cp WaterfallAdhkarPopup.css src/sidepanel/components/
```

### Step 2: Import Component
```tsx
import WaterfallAdhkarPopup, { AdhkarDisplay } from './components/WaterfallAdhkarPopup';
```

### Step 3: Use in Your Component
```tsx
export function SidePanelApp() {
  const [adhkar, setAdhkar] = useState<AdhkarDisplay | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      {showPopup && adhkar && (
        <WaterfallAdhkarPopup
          adhkar={adhkar}
          config={{ theme: 'dark' }}
          onDismiss={() => setShowPopup(false)}
          onLike={() => {
            // Update backend
            rateAdhkar(adhkar.id, 'liked');
            setShowPopup(false);
          }}
          onDislike={() => {
            rateAdhkar(adhkar.id, 'disliked');
            setShowPopup(false);
          }}
          onSnooze={() => {
            snoozeAdhkar(30); // 30 minutes
            setShowPopup(false);
          }}
        />
      )}
    </>
  );
}
```

---

## Integration with Smart Display Engine

### In Background Service Worker

```typescript
// background/smartEngine.ts
import { SmartDisplayEngine } from '../shared/smartEngine';

const engine = new SmartDisplayEngine();

engine.onReadyToDisplay((adhkar) => {
  // Send to popup
  chrome.tabs.query({ active: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'DISPLAY_ADHKAR_WATERFALL',
      payload: {
        adhkar,
        config: {
          showArabic: true,
          showTransliteration: true,
          showEnglish: true,
          theme: userPreferences.theme,
        },
      },
    });
  });
});

engine.start();
```

### In Content Script

```typescript
// content/index.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DISPLAY_ADHKAR_WATERFALL') {
    // Inject React component into the page
    showWaterfallPopup(message.payload);
  }
});

function showWaterfallPopup(payload) {
  // Create or get React root
  const root = ReactDOM.createRoot(document.getElementById('adhkar-popup-root'));
  
  root.render(
    <WaterfallAdhkarPopup
      adhkar={payload.adhkar}
      config={payload.config}
      onDismiss={() => {
        chrome.runtime.sendMessage({ type: 'ADHKAR_DISMISSED' });
      }}
      onLike={() => {
        chrome.runtime.sendMessage({
          type: 'ADHKAR_RATED',
          adhkarId: payload.adhkar.id,
          rating: 'liked',
        });
      }}
      onDislike={() => {
        chrome.runtime.sendMessage({
          type: 'ADHKAR_RATED',
          adhkarId: payload.adhkar.id,
          rating: 'disliked',
        });
      }}
      onSnooze={() => {
        chrome.runtime.sendMessage({ type: 'ADHKAR_SNOOZED' });
      }}
    />
  );
}
```

---

## Integration with User Preferences

### Dynamic Configuration Based on Settings

```typescript
// shared/storage/userPrefs.ts
export async function getAdhkarPopupConfig(): Promise<WaterfallConfig> {
  const prefs = await userPreferencesStore.getAll();

  return {
    showArabic: prefs.adhkarDisplay.showArabic,
    showTransliteration: prefs.adhkarDisplay.showTransliteration,
    showEnglish: prefs.adhkarDisplay.showEnglish,
    theme: prefs.theme,
    animationDuration: prefs.animation.duration || 600,
    staggerDelay: prefs.animation.staggerDelay || 150,
  };
}
```

### Usage in Component

```tsx
export function AdhkarPopupContainer() {
  const [config, setConfig] = useState<WaterfallConfig | null>(null);
  const [adhkar, setAdhkar] = useState<AdhkarDisplay | null>(null);

  useEffect(() => {
    (async () => {
      const config = await getAdhkarPopupConfig();
      setConfig(config);
    })();
  }, []);

  if (!config || !adhkar) return null;

  return (
    <WaterfallAdhkarPopup
      adhkar={adhkar}
      config={config}
      onDismiss={handleDismiss}
      onLike={handleLike}
      onDislike={handleDislike}
      onSnooze={handleSnooze}
    />
  );
}
```

---

## Integration with Analytics

### Track User Interactions

```typescript
// shared/analytics.ts
export function trackAdhkarInteraction(
  adhkarId: string,
  action: 'displayed' | 'liked' | 'disliked' | 'snoozed' | 'dismissed',
  metadata?: Record<string, any>
) {
  // Log to IndexedDB or analytics service
  logEvent({
    type: 'adhkar_interaction',
    adhkarId,
    action,
    timestamp: Date.now(),
    ...metadata,
  });
}
```

### In Component

```tsx
const handleLike = () => {
  trackAdhkarInteraction(adhkar.id, 'liked', {
    category: adhkar.category,
    source: adhkar.source,
  });
  onLike?.();
};
```

---

## Integration with Styling System

### Theming with Tailwind CSS

If using Tailwind CSS in your project, you can extend the theme:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        adhkar: {
          primary: 'var(--wf-dark-bg)',
          text: 'var(--wf-dark-text)',
          accent: 'var(--wf-dark-accent)',
        },
      },
      backdropBlur: {
        glass: '10px',
      },
      animation: {
        waterfall: 'waterfallCascade var(--animation-duration) forwards',
      },
    },
  },
};
```

---

## Testing

### Unit Tests

```typescript
// tests/unit/WaterfallAdhkarPopup.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import WaterfallAdhkarPopup from './WaterfallAdhkarPopup';

describe('WaterfallAdhkarPopup', () => {
  const mockAdhkar = {
    id: 'test-1',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhanallah',
    english: 'Glory be to Allah',
  };

  it('renders Arabic text when showArabic is true', () => {
    render(
      <WaterfallAdhkarPopup
        adhkar={mockAdhkar}
        config={{ showArabic: true, showTransliteration: false, showEnglish: false }}
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByText('سُبْحَانَ اللَّهِ')).toBeInTheDocument();
  });

  it('calls onLike when like button is clicked', () => {
    const onLike = jest.fn();
    render(
      <WaterfallAdhkarPopup
        adhkar={mockAdhkar}
        config={{ theme: 'dark' }}
        onLike={onLike}
        onDismiss={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('Like this adhkar'));
    expect(onLike).toHaveBeenCalled();
  });

  it('respects animation duration config', () => {
    const { container } = render(
      <WaterfallAdhkarPopup
        adhkar={mockAdhkar}
        config={{ animationDuration: 1000, staggerDelay: 200 }}
        onDismiss={jest.fn()}
      />
    );

    const textBlock = container.querySelector('.waterfall-text-block.arabic');
    expect(textBlock?.style.animationDuration).toBe('1000ms');
  });
});
```

### E2E Tests

```typescript
// tests/e2e/waterfallPopup.spec.ts
import { test, expect } from '@playwright/test';

test('Waterfall popup displays and responds to interactions', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:3000');

  // Trigger the popup
  await page.click('[data-testid="trigger-adhkar"]');

  // Wait for popup to appear
  const popup = page.locator('.waterfall-popup-container');
  await expect(popup).toBeVisible();

  // Verify text is displayed
  const arabicText = page.locator('.waterfall-arabic-text');
  await expect(arabicText).toContainText('سُبْحَانَ اللَّهِ');

  // Test like button
  await page.click('button:has-text("Like")');
  
  // Popup should close
  await expect(popup).not.toBeVisible();

  // Verify analytics event was sent
  const events = await page.evaluate(() => window.analyticsEvents);
  expect(events).toContainEqual(
    expect.objectContaining({
      type: 'adhkar_interaction',
      action: 'liked',
    })
  );
});
```

---

## Performance Optimization

### Lazy Loading

```tsx
const WaterfallAdhkarPopup = React.lazy(() =>
  import('./components/WaterfallAdhkarPopup')
);

export function App() {
  return (
    <Suspense fallback={null}>
      <WaterfallAdhkarPopup {...props} />
    </Suspense>
  );
}
```

### Memoization

```tsx
const MemoizedWaterfallPopup = React.memo(WaterfallAdhkarPopup, (prevProps, nextProps) => {
  return (
    prevProps.adhkar.id === nextProps.adhkar.id &&
    JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config)
  );
});
```

---

## Accessibility Integration

### ARIA Labels

The component includes built-in ARIA labels. Enhance further:

```tsx
<WaterfallAdhkarPopup
  adhkar={adhkar}
  // Add to parent for context
  role="dialog"
  aria-labelledby="adhkar-title"
  aria-describedby="adhkar-content"
/>
```

### Keyboard Shortcut Integration

```typescript
// background/shortcuts.ts
// Already handles Ctrl+Shift+A to show/hide
// When showing, automatically focuses first interactive element
function handleToggleSidePanel() {
  showWaterfallPopup();
  // Focus will be automatically on close button (first tabstop)
}
```

---

## Migration Guide (If Replacing Existing Popup)

### Before (Old Popup)
```tsx
<SimpleAdhkarPopup adhkar={adhkar} />
```

### After (Waterfall Popup)
```tsx
<WaterfallAdhkarPopup
  adhkar={adhkar}
  config={{
    showArabic: true,
    showTransliteration: true,
    showEnglish: true,
    theme: 'dark',
  }}
  onDismiss={handleDismiss}
  onLike={handleLike}
  onDislike={handleDislike}
  onSnooze={handleSnooze}
/>
```

### Update Event Handlers
```typescript
// Old API
onClose() -> New: onDismiss()
onRate(rating) -> New: onLike() / onDislike()
(no snooze) -> New: onSnooze()
```

---

## Troubleshooting Integration

### CSS Not Applied
```tsx
// Ensure CSS is imported in your main app file
import './components/WaterfallAdhkarPopup.css';
```

### Component Not Rendering
```tsx
// Check that adhkar data is correct
console.log('Adhkar:', adhkar);

// Verify all required fields exist
if (!adhkar.arabic || !adhkar.english) {
  console.error('Missing required adhkar fields');
  return null;
}
```

### Animation Not Working
```tsx
// Check browser support for CSS animations
// Try disabling prefers-reduced-motion in browser
// Verify staggerDelay is > 0
```

---

## File Structure After Integration

```
src/
├── sidepanel/
│   ├── components/
│   │   ├── WaterfallAdhkarPopup.tsx
│   │   ├── WaterfallAdhkarPopup.css
│   │   ├── WaterfallAdhkarDemo.tsx
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── shared/
│   ├── types.ts (includes AdhkarDisplay, WaterfallConfig)
│   └── ...
└── ...

docs/
├── WATERFALL_COMPONENT.md
├── WATERFALL_INTEGRATION.md (this file)
└── ...
```

---

## Next Steps

1. ✅ Copy component files
2. ✅ Import in your app
3. ✅ Connect to smart engine
4. ✅ Set up event handlers
5. ✅ Add to user preferences
6. ✅ Test with sample data
7. ✅ Deploy to Chrome Web Store

---

**Questions?** See WATERFALL_COMPONENT.md for detailed documentation.
