# Dhikrtop Test Suite

This document describes the comprehensive test suite for the Dhikrtop application.

## Running Tests

### Install Test Dependencies
First, install the test dependencies:

```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests Once (CI Mode)
```bash
npm run test:run
```

### View Test Coverage
```bash
npm run test:coverage
```

### Interactive Test UI
```bash
npm run test:ui
```

## Test Structure

### React Component Tests

Located in `src/components/__tests__/` and `src/windows/__tests__/`

#### AdhkarCard.test.tsx
Tests for the Adhkar card component:
- Rendering adhkar content (Arabic, transliteration, English)
- Category badges
- Button interactions (dismiss, like, dislike)
- Auto-dismiss countdown functionality
- Repeat indicator display
- Progress bar animation

#### SettingsWindow.test.tsx
Tests for the settings window:
- Window rendering with all sections (General, Adhkar, Appearance, About)
- Navigation between sections
- Toggling adhkar categories
- Changing display language
- Enable/disable toggle
- Save button functionality

#### SetupWindow.test.tsx
Tests for the setup wizard:
- Multi-step navigation (4 steps)
- Form data validation
- Step progression with Next/Back buttons
- Complete Setup button functionality
- Dialog close button
- Loading states

### Rust Unit Tests

Located in `src-tauri/src/tests.rs`

Tests for backend Tauri commands:
- Preferences structure validation
- Idle threshold validation (must be > 0)
- Interval validation (must be >= 5 minutes)
- Preferences serialization/deserialization
- Default preference values

## Test Coverage Goals

- **Components**: >80% line coverage
- **Backend**: >70% line coverage
- **Critical Paths**: 100% coverage (setup, preferences, persistence)

## Writing New Tests

### For React Components

1. Create a test file in `__tests__/` directory with `.test.tsx` extension
2. Use `vitest` + `@testing-library/react`
3. Mock Tauri APIs using `vi.mock()`
4. Test user interactions with `userEvent`

Example:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('does something', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Expected text')).toBeDefined();
    });
    
    await user.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### For Rust Components

1. Add tests in `#[cfg(test)]` modules
2. Create helper functions for setup
3. Test validation, parsing, and state management

Example:
```rust
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_my_function() {
    let result = my_function(input);
    assert_eq!(result, expected);
  }
}
```

## CI/CD Integration

Tests are automatically run on:
- `git push` to main branch
- Pull requests
- GitHub Actions workflow

To run tests locally before pushing:
```bash
npm run test:run
```

## Debugging Tests

### Run specific test file:
```bash
npx vitest src/components/__tests__/AdhkarCard.test.tsx
```

### Run tests matching pattern:
```bash
npx vitest -t "should render"
```

### Debug with VS Code:
1. Add breakpoint in test file
2. Run test with Node debugger
3. Use VS Code Debug console

### View detailed output:
```bash
npx vitest --reporter=verbose
```

## Known Limitations

- Tauri window APIs are mocked (not integration tested)
- File system operations are not tested
- System tray interactions need integration tests
- The ML module tests are in `quranic_qiraat_ml/` separately

## Future Improvements

- [ ] Add E2E tests with Tauri's testing utilities
- [ ] Integration tests for Tauri commands
- [ ] Cross-platform testing
- [ ] Performance benchmarks
- [ ] Visual regression testing
