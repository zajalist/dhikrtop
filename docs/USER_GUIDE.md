# User Guide - Dhikrtop

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Getting Started](#getting-started)
3. [Features Guide](#features-guide)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Settings & Customization](#settings--customization)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Installation & Setup

### Prerequisites
- Chrome browser (v95+), Edge (v95+), or Brave (v1.0+)
- Microphone (for voice recitation features - optional)

### Installation Steps

1. **From Chrome Web Store** (when published)
   - Open [Dhikrtop on Chrome Web Store](chrome://webstore)
   - Click "Add to Chrome"
   - Confirm permissions prompt

2. **Manual Installation** (for developers)
   - Clone the repository: `git clone https://github.com/zajalist/dhikrtop`
   - Follow [Developer Setup Guide](DEVELOPER_SETUP.md)
   - Load extension: Go to `chrome://extensions/`, enable "Developer Mode", click "Load unpacked"

### Initial Permission Grant
On first install, Dhikrtop requests:
- **Read your browsing history**: To detect page loads and activity
- **Microphone access**: For voice recitation (can be disabled in settings)
- **Storage access**: To save your preferences and progress locally

**Your data stays local.** No data is sent to external servers without explicit permission.

---

## Getting Started

### 1. First Launch
- Click the **Dhikrtop icon** in your Chrome toolbar
- You'll see the **Quick Start** popup
- Choose your preferences:
  - Preferred language (Arabic, English, Transliteration)
  - Enable/disable features
  - Select adhkar categories you want to see

### 2. Configure Memorized Surahs
- Go to **Options** (click extension icon → gear icon)
- Navigate to **Quran** tab
- Select each surah you have memorized
- Set confidence level (Beginner/Intermediate/Advanced)
- Save

### 3. Adjust Activity Detection Settings
- Go to **Options** → **Detection Settings**
- Choose detection aggressiveness:
  - 🟢 **Conservative**: Only show adhkar when you're clearly idle
  - 🟡 **Normal**: Balanced approach (recommended)
  - 🔴 **Aggressive**: Show more frequently

### 4. Enable Keyboard Shortcuts (Optional)
- Go to **Options** → **Keyboard Shortcuts**
- Leave default or customize:
  - `Ctrl+Shift+D`: Toggle extension on/off
  - `Ctrl+Shift+A`: Show/hide side panel
  - `Ctrl+Shift+Q`: Start Quran session
  - `Ctrl+Shift+M`: Toggle microphone

---

## Features Guide

### Feature 1: Smart Adhkar Display

#### How It Works
Dhikrtop monitors your browser activity. When it detects you're taking a break (idle for ~1 minute), it displays an Islamic remembrance (adhkar) in a side panel.

#### What You See
- **Arabic text**: The adhkar in original Arabic
- **English translation**: Full meaning
- **Transliteration**: Arabic romanized (if enabled)

#### Actions You Can Take
- **🔙 Dismiss**: Close this adhkar and hide panel
- **⏱️ Snooze**: Hide for 30 minutes, then remind again
- **❤️ Like**: Mark as favorite; you'll see it more often
- **👎 Dislike**: Hide this adhkar from your feed

#### Customization
1. Go **Options** → **Adhkar Categories**
2. Toggle which categories you want to see:
   - Morning adhkar (after waking up)
   - Evening adhkar (before sunset)
   - Sleep adhkar (before bedtime)
   - General adhkar (anytime)
   - Work adhkar (productivity breaks)
3. Save

---

### Feature 2: Quran Memorization Aide

#### How It Works
This feature helps you practice your memorized surahs. It randomly selects a surah you know and a starting verse, then prompts you to recite from there to the end.

#### Starting a Session

**Option 1: Manual Start**
- Click extension icon
- Click **"Start Quran Session"** button
- Or use keyboard shortcut: `Ctrl+Shift+Q`

**Option 2: Auto-Trigger**
- Enable "Auto Quran Sessions" in settings
- Dhikrtop will trigger sessions during breaks, similar to adhkar

#### During a Session

1. **You'll see**:
   - Surah name and verse range
   - The starting verse (highlighted)
   - 2 verses before for context (faded)
   - A "Start Reciting" button

2. **Recitation Methods**:
   - **Voice Recitation** (if enabled):
     - Click the microphone 🎤 button
     - Speak the verses clearly
     - System will match your speech to expected text
   - **Manual Completion**:
     - If voice not available, click "Completed"
     - System will mark session complete

3. **Feedback**:
   - ✅ **Correct**: You recited accurately (>75% match)
   - ⚠️ **Partial**: Some verses correct (50-75%)
   - ❌ **Incorrect**: Try again or skip
   - 🎤 **No Speech Detected**: Speak louder or try again

#### After Session
- See your accuracy score (0-100%)
- Option to continue session or start a new one
- Results saved in your history

#### Tracking Progress
- Go **Options** → **Quran Progress**
- See:
  - List of memorized surahs
  - Confidence level for each
  - Recent sessions
  - Overall completion percentage

---

### Feature 3: Voice Recitation

#### Enable Microphone

1. **First Time**:
   - When you click the microphone button
   - Browser will ask for permission
   - Click "Allow"

2. **Settings**:
   - Go **Options** → **Voice Settings**
   - Microphone should be listed and active
   - Test microphone: Click "Test Mic" button
   - You should hear yourself

#### Using Voice Recitation

- During Quran sessions, click **🎤 Recite**
- **Speak clearly** in Arabic
- System records and matches your speech
- Click **Stop** when done
- Get instant feedback

#### Tips for Better Accuracy
1. Use a quiet environment
2. Speak at normal pace
3. Pronounce clearly (system recognizes Arabic)
4. Avoid background noise
5. Use a good-quality microphone

#### Troubleshooting Voice
- **"No Speech Detected"**: 
  - Check microphone is plugged in
  - Speak louder
  - Try again
  
- **"Low Confidence"**: 
  - Your speech didn't match well
  - Check for background noise
  - Verify you're reciting correct verses
  - Try manual completion instead

---

## Keyboard Shortcuts

### Default Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle extension on/off |
| `Ctrl+Shift+A` | Show/hide side panel |
| `Ctrl+Shift+Q` | Start Quran session |
| `Ctrl+Shift+M` | Toggle microphone on/off |

### In-Session Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Pause/resume recitation |
| `Esc` | Exit session |
| `→` | Next verse (if manually stepping) |
| `←` | Previous verse |

### Customizing Shortcuts

1. Go **Options** → **Keyboard Shortcuts**
2. Click on any shortcut row
3. Press your desired key combination
4. Save

**Note**: Shortcuts work system-wide, even when browser is not focused.

---

## Settings & Customization

### Activity Detection Settings

**Location**: Options → **Detection Settings**

#### Idle Threshold
- How long browser should be inactive before showing adhkar
- Range: 30 seconds - 5 minutes
- Default: 60 seconds
- Lower = show adhkar more frequently

#### Display Aggressiveness
- How likely adhkar is to show when conditions are met
- Range: Conservative (30%) to Aggressive (70%)
- Default: Normal (50%)

#### Minimum Display Interval
- Minimum time between adhkar displays
- Range: 1 minute - 1 hour
- Default: 10 minutes
- Prevents spam

#### Detection Methods
Toggle which detection types to use:
- ☑️ **Idle detection**: Monitor for inactivity
- ☑️ **Page load detection**: Detect when page finishes loading
- ☐ **Concentration breaks**: (Advanced) Detect work breaks

---

### Adhkar Categories

**Location**: Options → **Categories**

Enable/disable which types of adhkar you want to see:
- ☑️ Morning adhkar
- ☑️ Evening adhkar
- ☑️ Sleep adhkar
- ☑️ General adhkar
- ☑️ Work adhkar

You can also rate individual adhkar to improve recommendations:
- Click extension → View history
- Rate each adhkar with 👍 (like) / 👎 (dislike)

---

### Voice & Microphone

**Location**: Options → **Voice**

- **Microphone**: Select which microphone to use
- **Language**: Arabic (default), or transliteration
- **Confidence Threshold**: How strict voice matching is
  - Low (50%): More forgiving, accepts partial matches
  - High (90%): Strict, requires near-perfect recitation
- **Test Microphone**: Click to test your mic works

---

### Privacy & Data

**Location**: Options → **Privacy**

#### What Data We Collect
- ✅ Your adhkar preferences (stored locally)
- ✅ Your memorization progress (stored locally)
- ✅ Session history (stored locally, 30 days)
- ❌ Voice recordings (deleted after evaluation)
- ❌ Personal browsing data (never collected)
- ❌ Any data sent to external servers (unless you enable analytics)

#### Data Deletion
- **Clear all data**: Resets all preferences and history
- **Clear history only**: Keeps settings but deletes sessions
- **Export data**: Download your data as JSON

---

### Import/Export Settings

**Location**: Options → **Data**

#### Export
1. Click **"Export Settings"**
2. Your data (preferences, progress) is downloaded as `dhikrtop_backup.json`
3. Safe to share or backup

#### Import
1. Click **"Import Settings"**
2. Select a previously exported JSON file
3. Settings are restored

**Use case**: Sync settings across multiple computers

---

## Troubleshooting

### Adhkar Not Showing

**Problem**: Extension is on but no adhkar appears.

**Solutions**:
1. ✅ Check if extension is enabled
   - Click icon → Look for green "ON" indicator
   
2. ✅ Verify detection settings
   - Go Options → Detection Settings
   - Try lowering idle threshold to 30 seconds
   - Set aggressiveness to "Aggressive"
   - Save and wait 1 minute of inactivity
   
3. ✅ Check category preferences
   - Go Options → Categories
   - Ensure at least one category is enabled
   
4. ✅ Check minimum interval
   - If adhkar was shown recently, it won't show again soon
   - Interval set to 10 minutes by default
   
5. ⚙️ Try manual trigger
   - It's easier to test if extension is working
   - (See "Quran Sessions Not Starting")

### Quran Sessions Not Starting

**Problem**: Can't start a Quran session.

**Solutions**:
1. ✅ Check if you've added memorized surahs
   - Go Options → Quran
   - Select at least one surah and save
   - Try again
   
2. ✅ Verify keyboard shortcut
   - Press `Ctrl+Shift+Q`
   - Or click extension icon → "Start Session"
   
3. ✅ Check if extension is enabled
   - Should see green "ON" indicator
   
4. ⚙️ Restart browser
   - Close all Chrome windows
   - Reopen Chrome
   - Try again

### Voice Recognition Not Working

**Problem**: Microphone button appears but doesn't work.

**Solutions**:
1. ✅ Check microphone permissions
   - Go Options → Voice
   - Check "Microphone" dropdown has a device selected
   - If not, select your microphone
   
2. ✅ Test microphone
   - Click "Test Mic" button in Voice settings
   - Speak "assalamu alaikum"
   - You should hear yourself or see "Speech detected"
   
3. ✅ Check browser permissions
   - Address bar → Click the lock icon
   - Find "Microphone" → Click "Allow"
   
4. ✅ Check system microphone
   - Test in another app (Discord, Skype)
   - Ensure microphone is plugged in
   - Test microphone levels in system settings
   
5. ⚙️ Restart extension
   - Go to `chrome://extensions`
   - Find Dhikrtop
   - Toggle off, then on
   - Try again

### Low Voice Accuracy

**Problem**: Voice recognition confidence is low.

**Solutions**:
1. ✅ Reduce background noise
   - Move to a quieter room
   - Close music/videos
   - Mute browser notifications
   
2. ✅ Speak more clearly
   - Articulate each word
   - Use correct Arabic pronunciation
   - Speak at normal speed (not too fast)
   
3. ✅ Lower confidence threshold
   - Go Options → Voice
   - Set "Confidence Threshold" to "Low"
   - System will be more forgiving
   
4. ✅ Use a better microphone
   - USB microphones are often better than built-in
   - Ensure microphone is close (6 inches away)
   
5. ⚙️ Use manual completion
   - Click "I recited correctly" button instead of voice

---

## FAQ

### Q: Is my data private?
**A**: Yes. All your data stays on your computer. Dhikrtop doesn't send anything to external servers by default. No cloud sync unless you explicitly enable it (Phase 4).

### Q: Does Dhikrtop listen to my microphone all the time?
**A**: No. Microphone is only active when you click the recitation button. You must manually start recording.

### Q: Can I use Dhikrtop offline?
**A**: Yes. All features work offline after initial installation. You don't need internet (except for future Quran data updates).

### Q: How is the Quran data stored?
**A**: The Quran text is stored locally in your browser's IndexedDB. It's about 5MB and downloaded once.

### Q: Can I customize the adhkar selection?
**A**: Yes, multiple ways:
- Select which categories to see
- Rate adhkar as "liked" or "disliked"
- Adjust detection thresholds
- Set minimum display interval

### Q: What if I dislike an adhkar?
**A**: 
1. Click the 👎 button on that adhkar
2. It will be hidden from future displays
3. You can re-enable it anytime in Options

### Q: How many adhkar are in the database?
**A**: 200+ common adhkar, covering:
- Morning remembrances
- Evening remembrances
- Sleep/bedtime adhkar
- Workplace/productivity adhkar
- General daily adhkar

More can be added via community contributions.

### Q: Can I add my own adhkar?
**A**: In Phase 3+, yes. You'll be able to:
- Create custom adhkar
- Organize in custom categories
- Share with others (optional)

### Q: How do I report a bug?
**A**: 
1. Go Options → Help
2. Click "Report Issue"
3. Or visit: https://github.com/zajalist/dhikrtop/issues

### Q: Can I contribute translations?
**A**: Yes! Dhikrtop is open source. See [Contributing Guide](CONTRIBUTING.md)

### Q: What's the roadmap?
**A**: See [Comprehensive Plan](COMPREHENSIVE_PLAN.md) for full roadmap.

Phase 2 (MVP):
- ✅ Smart adhkar display
- ✅ Quran sessions
- ✅ Voice integration
- ✅ Keyboard shortcuts

Phase 3:
- Concentration detection improvements
- Custom adhkar support
- Analytics dashboard

Phase 4:
- Cloud sync
- Community features
- AI learning

### Q: How do I uninstall?
**A**: 
1. Go `chrome://extensions`
2. Find Dhikrtop
3. Click "Remove"
4. All data is deleted

### Q: Can I back up my progress before uninstalling?
**A**: Yes:
1. Go Options → Data
2. Click "Export Settings"
3. Save the JSON file
4. If you reinstall later, you can import it back

---

## Getting Help

### Documentation
- [Architecture Guide](ARCHITECTURE.md)
- [Algorithm Specifications](ALGORITHMS.md)
- [Developer Setup](DEVELOPER_SETUP.md)

### Support Channels
- 📧 Email: support@dhikrtop.app
- 🐛 Issues: https://github.com/zajalist/dhikrtop/issues
- 💬 Discussions: https://github.com/zajalist/dhikrtop/discussions

### Community
- 🌐 Discord: [Join our server](https://discord.gg/dhikrtop) (coming soon)
- 🤝 Contribute: [Contributing Guide](CONTRIBUTING.md)

---

**Last Updated**: March 1, 2026  
**Version**: 1.0 (MVP)
