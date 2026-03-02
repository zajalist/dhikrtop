# Algorithm Specifications

## 1. Smart Adhkar Display Algorithm

### Overview
The smart display algorithm determines when to show an adhkar to the user based on multiple detection signals. It uses activity monitoring, user preferences, and temporal factors to maximize relevance while minimizing intrusion.

### Core Decision Tree

```
FUNCTION shouldDisplayAdhkar():
  
  1. CHECK PRECONDITIONS:
     IF extension.isEnabled == false:
       RETURN false
     
     IF user.hasDisabledCategory(adhkar.category):
       RETURN false
     
     IF currentTime.sinceLastDisplay < user.minDisplayInterval:
       RETURN false
  
  2. CHECK ACTIVITY SIGNALS:
     activity_score = 0
     
     IF detectIdleState(threshold: user.idleThreshold):
       activity_score += 40
     
     IF detectPageLoadComplete():
       activity_score += 30
     
     IF detectConcentrationBreak():
       activity_score += 20
     
     IF timeOfDayScore(currentHour) > 0:
       activity_score += 10
     
  3. EVALUATE PROBABILITY:
     IF activity_score >= user.displayThreshold:
       random_value = random(0, 100)
       IF random_value < user.displayProbability:
         
         4. SELECT ADHKAR:
            candidates = queryAdhkarByPreferences()
            adhkar = selectBestAdhkar(candidates)
            
            5. TRIGGER DISPLAY:
            broadcastMessage('DISPLAY_ADHKAR', adhkar)
            recordDisplayEvent(adhkar.id)
            
            RETURN true
     
     RETURN false
```

### Component Algorithms

#### 1.1 Idle State Detection

```
FUNCTION detectIdleState(threshold_seconds):
  
  TRACK:
    - lastMouseMove timestamp
    - lastKeypress timestamp
    - lastScrollEvent timestamp
    - tabVisibilityState (visible/hidden)
  
  current_time = now()
  time_since_activity = current_time - max(
    lastMouseMove,
    lastKeypress,
    lastScrollEvent
  )
  
  IF tabVisibilityState == 'hidden':
    RETURN false  // Don't interrupt hidden tabs
  
  IF time_since_activity >= threshold_seconds:
    RETURN true
  ELSE:
    RETURN false
```

**Configuration Parameters:**
- `threshold_seconds`: 30s (MVP), 45s-5min (user customizable)
- `activity_threshold`: Reset if any activity detected

**Edge Cases:**
- Video/audio playing → Don't consider idle (check for `playing` event)
- Fullscreen → Don't trigger (check document.fullscreenElement)
- Page scrolling (smooth scroll) → Only trigger on scroll stop (debounce 5s)

#### 1.2 Page Load Detection

```
FUNCTION detectPageLoadComplete():
  
  // Method 1: Performance API
  IF window.performance.timing.loadEventEnd > 0:
    RETURN true
  
  // Method 2: Document ready state
  IF document.readyState == 'complete':
    
    // Check for common loading indicators (fallback)
    loadingIndicators = querySelectorAll([
      '.loader',
      '.spinner',
      '[data-loading="true"]',
      '.skeleton',
      '.placeholder'
    ])
    
    IF loadingIndicators.length == 0:
      RETURN true
  
  RETURN false
```

**Parameters:**
- Monitor `PerformanceObserver` for `navigation` and `resource` entries
- Wait 2+ seconds after page load before first display
- Don't trigger during active network requests

#### 1.3 Concentration Heuristics (Phase 3)

```
FUNCTION detectConcentrationBreak():
  
  ANALYZE last_30_seconds_of:
    - Mouse/keyboard frequency (events per second)
    - Scroll events
    - Input field focus changes
  
  baseline_activity = calculateMovingAverage(activity_frequency, 5min)
  current_activity = calculateMovingAverage(activity_frequency, 30s)
  
  // Detect significant drop in activity
  IF current_activity < (baseline_activity * 0.3):
    RETURN true  // Likely taking a break
  
  // Detect repetitive scrolling (reading content)
  scroll_variance = variance(scroll_deltas_30s)
  IF scroll_variance < 100:  // Low variance = repetitive scrolling
    consecutive_scrolls = count_scrolls_in(30s)
    IF consecutive_scrolls > 5:
      RETURN true
  
  RETURN false
```

**Parameters:**
- `baseline_window`: 5 minutes
- `observation_window`: 30 seconds
- `activity_drop_threshold`: 30% of baseline
- `scroll_variance_threshold`: 100px²

#### 1.4 Adhkar Selection Algorithm

```
FUNCTION selectBestAdhkar(category_filter):
  
  // Step 1: Query candidates by user preferences
  candidates = indexedDB.query('adhkar', {
    category: IN user.preferredCategories,
    archived: false
  })
  
  // Step 2: Score each candidate
  FOR adhkar IN candidates:
    score = 0
    
    // Freshness: prioritize recently added adhkar
    days_since_added = (now() - adhkar.createdAt) / 86400000
    freshness_score = max(0, 50 - days_since_added)
    
    // Recency: deprioritize recently shown
    hours_since_displayed = (now() - adhkar.lastDisplayed) / 3600000
    recency_score = min(50, hours_since_displayed / 24)
    
    // Display count: balance frequency
    display_count_score = 10 - min(10, adhkar.displayCount / 100)
    
    // User feedback: boost liked adhkar
    IF adhkar.userRating == 'liked':
      user_feedback_score = 30
    ELSE IF adhkar.userRating == 'disliked':
      user_feedback_score = -50  // Hide disliked adhkar
    ELSE:
      user_feedback_score = 0
    
    // Time of day: boost relevant adhkar
    current_hour = now().getHours()
    IF adhkar.timeOfDayOptimal(current_hour):
      time_score = 20
    ELSE:
      time_score = 0
    
    // Composite score
    adhkar.score = (
      freshness_score * 0.2 +
      recency_score * 0.3 +
      display_count_score * 0.2 +
      user_feedback_score * 0.15 +
      time_score * 0.15
    )
  
  // Step 3: Select top adhkar (weighted random to avoid always picking highest)
  ranked = sortByScore(candidates)
  top_10_percent = ranked[0:length*0.1]
  
  selected = selectWeightedRandom(top_10_percent, weights=scores)
  
  RETURN selected
```

**Scoring Weights:**
- Recency: 30% (not shown recently)
- Freshness: 20% (recently added content)
- Display count: 20% (balance exposure)
- User feedback: 15% (leverage preferences)
- Time of day: 15% (contextual relevance)

#### 1.5 Display Timing Decision

```
FUNCTION evaluateDisplayTiming():
  
  activity_score = calculateActivityScore()
  
  // Thresholds (customizable in UI)
  AGGRESSIVE = 70    // Display even with minimal signals
  NORMAL = 50        // Balanced approach (DEFAULT)
  CONSERVATIVE = 30  // Only display on strong signals
  
  user_threshold = user.displayAggressiveness // 30-70
  
  IF activity_score >= user_threshold:
    
    // Additional probability check
    final_probability = min(
      user.displayProbability,
      activity_score / 100  // Cap at score percentage
    )
    
    IF random(0, 100) < final_probability:
      RETURN true
  
  RETURN false
```

---

## 2. Quran Session Randomization Algorithm

### Overview
The Quran session algorithm generates random memorization challenges based on the user's memorized surahs. It selects a starting verse and requires the user to recite from that point onward.

### Main Algorithm

```
FUNCTION initiateQuranSession():
  
  1. VALIDATION:
     memorized_surahs = indexedDB.query('memorizedSurahs', {
       memorized: true
     })
     
     IF memorized_surahs.length == 0:
       RETURN error('No memorized surahs')
  
  2. SURAH SELECTION:
     // Weight by confidence level (bias towards beginner surahs)
     weighted_surahs = memorized_surahs.map(s => ({
       ...s,
       weight: getConfidenceWeight(s.confidenceLevel)
     }))
     
     selected_surah = selectWeightedRandom(weighted_surahs)
  
  3. VERSE RANDOMIZATION:
     total_verses = selected_surah.verseCount
     
     // Random starting verse (avoid last 5 verses)
     max_start_verse = max(1, total_verses - 5)
     start_verse = random(1, max_start_verse)
     
     // Display context: show 2 verses before start (for reference)
     display_start = max(1, start_verse - 2)
     
     // Session runs from start_verse to end of surah
     session = {
       sessionId: generateUUID(),
       surahNumber: selected_surah.surahNumber,
       surahName: selected_surah.surahName,
       
       displayRange: [display_start, start_verse + 3],
       recitationRange: [start_verse, total_verses],
       
       startTime: now(),
       status: 'IN_PROGRESS',
       transcript: null,
       accuracy: null
     }
     
     STORE session IN indexedDB.quranSessions
     
     RETURN session
```

### Surah Selection Weights

```
FUNCTION getConfidenceWeight(confidence_level):
  
  SWITCH confidence_level:
    CASE 'beginner':
      RETURN 0.6      // 60% chance
    CASE 'intermediate':
      RETURN 0.3      // 30% chance
    CASE 'advanced':
      RETURN 0.1      // 10% chance
  
  // Rationale: Beginners need more practice
```

### Verse Display Strategy

```
FUNCTION displayVerseRange(session):
  
  verses = fetchQuranData(session.surahNumber)
  
  display_verses = verses[session.displayRange[0]:session.displayRange[1]]
  
  UI_DISPLAY:
    - First 2 verses: GRAYED OUT (context only)
    - Verse at index (start_verse): HIGHLIGHTED (starting point)
    - Remaining verses: NORMAL (expected to memorize)
    
    PROMPT: "Start from here ↓ and continue to the end"
```

---

## 3. Voice Recognition & Matching Algorithm

### Overview
The voice recognition algorithm converts user speech to text and matches it against expected Quranic verses. It calculates a confidence score and provides feedback.

### Main Algorithm

```
FUNCTION processVoiceRecitation(session, audio_blob):
  
  1. SPEECH RECOGNITION:
     transcript = await speechRecognitionAPI.recognize(
       audio: audio_blob,
       language: 'ar-SA',
       interimResults: false
     )
     
     IF !transcript:
       RETURN { status: 'NO_SPEECH', confidence: 0 }
  
  2. NORMALIZE TEXT:
     cleaned_transcript = normalizeDiacritics(transcript)
     expected_text = getExpectedText(session.recitationRange)
     cleaned_expected = normalizeDiacritics(expected_text)
  
  3. MATCHING ALGORITHM:
     match_result = performSequenceMatching(
       cleaned_transcript,
       cleaned_expected
     )
     
     confidence = match_result.confidence
     matched_verses = match_result.matched_verses
  
  4. EVALUATE RESULT:
     result = {
       sessionId: session.sessionId,
       transcript: transcript,
       confidence: confidence,
       matchedVerses: matched_verses,
       accuracy: calculateAccuracy(matched_verses, session.recitationRange),
       completionPercentage: (matched_verses / session.recitationRange.length) * 100
     }
     
     IF confidence > 0.75:
       result.status = 'CORRECT'
     ELSE IF confidence > 0.50:
       result.status = 'PARTIAL'
     ELSE:
       result.status = 'INCORRECT'
     
     5. SAVE RESULT:
        STORE result IN indexedDB.quranSessions
        RETURN result
```

### Text Normalization

```
FUNCTION normalizeDiacritics(text):
  
  // Remove Arabic diacritical marks
  diacritics = [
    'ًّ', // Fathatan
    'ٌ',  // Dammatan
    'ٍ',  // Kasratan
    'َ',  // Fatha
    'ُ',  // Damma
    'ِ',  // Kasra
    'ّ',  // Shadda
    'ْ',  // Sukun
    'ْ'   // Diacritic combinations
  ]
  
  normalized = text
  FOR diacritic IN diacritics:
    normalized = normalized.replace(diacritic, '')
  
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim()
  
  // Normalize hamza variations
  normalized = normalized.replace(/أ|إ|آ/g, 'ا')
  
  RETURN normalized
```

### Sequence Matching

```
FUNCTION performSequenceMatching(transcript, expected):
  
  // Use Levenshtein distance with weighted operations
  transcript_words = transcript.split(' ')
  expected_words = expected.split(' ')
  
  // Dynamic programming: edit distance
  distance = levenshteinDistance(
    transcript_words,
    expected_words,
    weights: {
      insertion: 1,
      deletion: 1.5,    // Penalize missing words more
      substitution: 1
    }
  )
  
  max_distance = expected_words.length * 1.5
  similarity = max(0, 1 - (distance / max_distance))
  
  // Extract matched verses
  matched_indices = alignSequences(
    transcript_words,
    expected_words
  )
  
  confidence = similarity * speechRecognition.confidence
  
  RETURN {
    confidence: confidence,
    similarity: similarity,
    matched_verses: matched_indices.length,
    distance: distance
  }
```

### Accuracy Calculation

```
FUNCTION calculateAccuracy(matched_verses, expected_range):
  
  total_expected = expected_range[1] - expected_range[0] + 1
  
  accuracy = (matched_verses / total_expected) * 100
  
  // Confidence adjustment
  confidence_adjusted = accuracy * speechRecognition.confidence
  
  RETURN {
    raw_accuracy: accuracy,
    confidence_adjusted: confidence_adjusted
  }
```

### Fallback: Manual Completion

```
FUNCTION allowManualCompletion(session):
  
  IF user.selectedLanguage == 'English' OR
     user.selectedLanguage == 'Transliteration':
    
    // For non-native Arabic speakers, allow manual verification
    SHOW: "Did you recite correctly?"
    BUTTONS: [Yes, No]
    
    IF user_selects == 'Yes':
      // Mark as correct, advance to next session
      RETURN { status: 'CORRECT', confidence: 1.0 }
    ELSE:
      // Option to retry or skip
      SHOW: [Retry, Skip]

ELSE:
  // Arabic speakers: require voice recognition
  RETURN null
```

---

## 4. Keyboard Shortcut Routing Algorithm

### Overview
Handles keyboard input globally and routes to appropriate handlers.

```
FUNCTION registerGlobalKeyboardHandler():
  
  // Define shortcut map
  shortcuts_map = {
    'Ctrl+Shift+D': handleToggleExtension,
    'Ctrl+Shift+A': handleToggleSidePanel,
    'Ctrl+Shift+Q': handleStartQuranSession,
    'Ctrl+Shift+M': handleToggleMicrophone
  }
  
  LISTEN document.addEventListener('keydown', (event) => {
    
    // Build key combination string
    key_combo = buildKeyCombo(event)
    
    // Check if user-customized shortcut
    custom_shortcut = chromeStorage.get('shortcuts')[key_combo]
    
    IF custom_shortcut:
      handler = shortcuts_map[custom_shortcut]
      IF handler:
        event.preventDefault()
        handler()
  })

FUNCTION buildKeyCombo(event):
  
  parts = []
  
  IF event.ctrlKey:    parts.push('Ctrl')
  IF event.shiftKey:   parts.push('Shift')
  IF event.altKey:     parts.push('Alt')
  IF event.metaKey:    parts.push('Meta')
  
  parts.push(event.key.toUpperCase())
  
  RETURN parts.join('+')
```

---

## 5. Activity Detection Debounce

```
FUNCTION createDebouncedActivityDetector(delay_ms):
  
  last_check_time = 0
  pending_check = false
  
  RETURN function(callback):
    current_time = now()
    
    IF (current_time - last_check_time) >= delay_ms:
      last_check_time = current_time
      callback()
    ELSE:
      IF !pending_check:
        pending_check = true
        setTimeout(() => {
          pending_check = false
          callback()
        }, delay_ms - (current_time - last_check_time))
```

---

## Performance Optimizations

### Algorithm Complexity

| Algorithm | Complexity | Notes |
|-----------|-----------|-------|
| Adhkar Selection | O(n log n) | n = candidates, sorted by score |
| Voice Matching | O(m+n) | m = transcript, n = expected text |
| Verse Randomization | O(1) | Simple random selection |
| Keyboard Routing | O(1) | Hash map lookup |

### Caching Strategies

1. **Memorized Surahs Cache**: Refresh every 24 hours or on manual update
2. **Adhkar Selection**: Precompute top 10 candidates every 4 hours
3. **Verse Data**: Cache entire Quran locally in IndexedDB (load once)

---

## Testing Strategies

### Unit Test Cases

1. **Activity Detection**
   - Idle after 30 seconds
   - Reset idle on user action
   - Ignore hidden tabs
   - Ignore fullscreen content

2. **Adhkar Selection**
   - Respects user category preferences
   - Deprioritizes recently shown adhkar
   - Prioritizes highly-rated adhkar
   - Avoids showing same adhkar twice in short period

3. **Voice Matching**
   - Recognizes correct recitation (>90% match)
   - Flags partial recitation (50-90%)
   - Rejects incorrect recitation (<50%)
   - Handles diacritical marks correctly

---

## Configuration Parameters (Customizable)

```javascript
{
  // Activity Detection
  idleThreshold: [30, 300] seconds,        // Default: 60
  displayThreshold: [30, 70],              // Default: 50
  minDisplayInterval: [60, 3600] seconds,  // Default: 600
  displayProbability: [0, 100] %,          // Default: 60
  
  // Quran Sessions
  confidentWeightBias: [0, 1],             // Default: 0.6
  verseContextLines: [0, 5],               // Default: 2
  voiceConfidenceThreshold: [0, 1],        // Default: 0.75
  
  // Time-based Triggers
  morningHours: [5, 12],                   // Default: 5-9
  eveningHours: [16, 23],                  // Default: 18-22
  nightHours: [22, 5]                      // Default: 22-5
}
```
