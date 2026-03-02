import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './SetupWindow.css';

interface SetupFormData {
  notificationInterval: number;
  enableSound: boolean;
  enablePopups: boolean;
  startOnBoot: boolean;
  language: 'en' | 'ar';
}

export default function SetupWindow() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<SetupFormData>({
    notificationInterval: 30,
    enableSound: true,
    enablePopups: true,
    startOnBoot: true,
    language: 'en',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof SetupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await invoke('save_preferences', { preferences: formData });
      await invoke('mark_setup_complete');
      await getCurrentWindow().close();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    await getCurrentWindow().close();
  };

  return (
    <div className="setup-container">
      <button className="close-btn" onClick={handleClose} title="Close">
        ✕
      </button>
      <div className="setup-header">
        <h1>Welcome to Dhikrtop</h1>
        <p>Islamic Remembrances Reminder</p>
      </div>

      <div className="setup-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">
          Step {step + 1} of 4
        </p>
      </div>

      <div className="setup-content">
        {step === 0 && (
          <div className="setup-step">
            <h2>Welcome!</h2>
            <div className="step-description">
              <p>
                Dhikrtop is a beautiful reminder app for Islamic remembrances
                (Adhkar) and Quranic verses.
              </p>
              <ul className="feature-list">
                <li>✓ Intelligent reminders based on your schedule</li>
                <li>✓ Beautiful Quranic verses and Hadith</li>
                <li>✓ Customizable preferences</li>
                <li>✓ System tray integration</li>
              </ul>
              <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
                Let's set up your preferences to get started!
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="setup-step">
            <h2>Language & Display</h2>
            <div className="form-group">
              <label>Preferred Language:</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={formData.language === 'en'}
                    onChange={(e) => handleChange('language', e.target.value as 'en' | 'ar')}
                  />
                  <span>English</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="language"
                    value="ar"
                    checked={formData.language === 'ar'}
                    onChange={(e) => handleChange('language', e.target.value as 'en' | 'ar')}
                  />
                  <span>العربية (Arabic)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <h2>Reminders & Notifications</h2>
            <div className="form-group">
              <label htmlFor="interval">
                Reminder Interval (minutes):
              </label>
              <input
                id="interval"
                type="number"
                min="15"
                max="240"
                step="15"
                value={formData.notificationInterval}
                onChange={(e) => handleChange('notificationInterval', parseInt(e.target.value))}
              />
              <small>Reminders will appear every {formData.notificationInterval} minutes</small>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.enablePopups}
                  onChange={(e) => handleChange('enablePopups', e.target.checked)}
                />
                <span>Enable popup notifications</span>
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.enableSound}
                  onChange={(e) => handleChange('enableSound', e.target.checked)}
                />
                <span>Enable notification sounds</span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="setup-step">
            <h2>Startup & System</h2>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.startOnBoot}
                  onChange={(e) => handleChange('startOnBoot', e.target.checked)}
                />
                <span>
                  Launch Dhikrtop when Windows starts
                </span>
              </label>
              <small>
                The app will run in your system tray and remind you of your daily remembrances
              </small>
            </div>

            <div className="setup-summary" style={{ marginTop: '30px' }}>
              <h3>Your Configuration:</h3>
              <ul>
                <li>Language: {formData.language === 'en' ? 'English' : 'العربية'}</li>
                <li>Reminder Interval: {formData.notificationInterval} minutes</li>
                <li>Popups: {formData.enablePopups ? 'Enabled' : 'Disabled'}</li>
                <li>Sound: {formData.enableSound ? 'Enabled' : 'Disabled'}</li>
                <li>Start on Boot: {formData.startOnBoot ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="setup-actions">
        {step > 0 && (
          <button
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={isLoading}
          >
            Back
          </button>
        )}

        {step < 3 && (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            Next
          </button>
        )}

        {step === 3 && (
          <button
            className="btn btn-success"
            onClick={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
        )}
      </div>
    </div>
  );
}
