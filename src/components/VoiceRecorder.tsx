/**
 * VoiceRecorder Component
 *
 * UI for recording Quranic verses with real-time feedback
 *
 * Features:
 * - Record/pause/resume/stop controls
 * - Real-time timer
 * - Visual feedback
 * - Integration with useVoiceRecorder hook
 * - Save recordings to database
 */

import { useState, useEffect } from "react";
import { useVoiceRecorder } from "../lib/useVoiceRecorder";
import { useQuranAPI } from "../lib/useQuranAPI";

interface VoiceRecorderProps {
    surahNumber: number;
    verseNumber: number;
    userId: string;
    onRecordingSaved?: (recordingId: string) => void;
    onCancel?: () => void;
}

export function VoiceRecorder({
    surahNumber,
    verseNumber,
    userId: _userId,
    onRecordingSaved,
    onCancel,
}: VoiceRecorderProps) {
    const recorder = useVoiceRecorder();
    const quran = useQuranAPI();

    const [verse, setVerse] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load verse text
    useEffect(() => {
        quran.getVerse(surahNumber, verseNumber).then(setVerse);
    }, [surahNumber, verseNumber]);

    // Format duration for display
    const formatDuration = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleStartRecording = async () => {
        try {
            await recorder.startRecording(surahNumber, verseNumber);
        } catch (error) {
            console.error("Failed to start recording:", error);
        }
    };

    const handlePauseRecording = async () => {
        try {
            await recorder.pauseRecording();
        } catch (error) {
            console.error("Failed to pause recording:", error);
        }
    };

    const handleResumeRecording = async () => {
        try {
            await recorder.resumeRecording();
        } catch (error) {
            console.error("Failed to resume recording:", error);
        }
    };

    const handleStopRecording = async () => {
        try {
            await recorder.stopRecording();
        } catch (error) {
            console.error("Failed to stop recording:", error);
        }
    };

    const handleSaveRecording = async () => {
        try {
            setIsSaving(true);
            const recordingId = await recorder.saveRecording();
            onRecordingSaved?.(recordingId);
        } catch (error) {
            console.error("Failed to save recording:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (recorder.isRecording || recorder.isPaused) {
            recorder.stopRecording().catch(console.error);
        }
        onCancel?.();
    };

    return (
        <div className="voice-recorder">
            {/* Verse Display */}
            <div className="verse-display">
                <h3>
                    Surah {surahNumber}, Verse {verseNumber}
                </h3>
                {verse && (
                    <>
                        <p className="verse-arabic" dir="rtl">
                            {verse.text_arabic}
                        </p>
                        <p className="verse-translation">
                            {verse.text_english}
                        </p>
                    </>
                )}
            </div>

            {/* Recording Status */}
            <div className="recording-status">
                {recorder.isRecording && !recorder.isPaused && (
                    <div className="status-indicator recording">
                        <div className="pulse-dot" />
                        <span>Recording...</span>
                    </div>
                )}
                {recorder.isPaused && (
                    <div className="status-indicator paused">
                        <span>⏸ Paused</span>
                    </div>
                )}
                {!recorder.isRecording &&
                    !recorder.isPaused &&
                    recorder.durationMs > 0 && (
                        <div className="status-indicator stopped">
                            <span>✓ Ready to save</span>
                        </div>
                    )}
            </div>

            {/* Timer */}
            <div className="timer">
                <span className="duration">
                    {formatDuration(recorder.durationMs)}
                </span>
            </div>

            {/* Waveform Visualization (Placeholder) */}
            <div className="waveform">
                {recorder.isRecording && !recorder.isPaused && (
                    <div className="waveform-bars">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="bar"
                                style={{
                                    height: `${Math.random() * 100}%`,
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div className="controls">
                {!recorder.isRecording &&
                    !recorder.isPaused &&
                    recorder.durationMs === 0 && (
                        <button
                            onClick={handleStartRecording}
                            className="btn btn-primary btn-record"
                        >
                            <span className="icon">🎤</span>
                            Start Recording
                        </button>
                    )}

                {recorder.isRecording && !recorder.isPaused && (
                    <>
                        <button
                            onClick={handlePauseRecording}
                            className="btn btn-secondary"
                        >
                            <span className="icon">⏸</span>
                            Pause
                        </button>
                        <button
                            onClick={handleStopRecording}
                            className="btn btn-danger"
                        >
                            <span className="icon">⏹</span>
                            Stop
                        </button>
                    </>
                )}

                {recorder.isPaused && (
                    <>
                        <button
                            onClick={handleResumeRecording}
                            className="btn btn-primary"
                        >
                            <span className="icon">▶️</span>
                            Resume
                        </button>
                        <button
                            onClick={handleStopRecording}
                            className="btn btn-danger"
                        >
                            <span className="icon">⏹</span>
                            Stop
                        </button>
                    </>
                )}

                {!recorder.isRecording &&
                    !recorder.isPaused &&
                    recorder.durationMs > 0 && (
                        <>
                            <button
                                onClick={handleSaveRecording}
                                className="btn btn-success"
                                disabled={isSaving}
                            >
                                <span className="icon">💾</span>
                                {isSaving ? "Saving..." : "Save Recording"}
                            </button>
                            <button
                                onClick={handleStartRecording}
                                className="btn btn-secondary"
                            >
                                <span className="icon">🔄</span>
                                Re-record
                            </button>
                        </>
                    )}

                <button onClick={handleCancel} className="btn btn-outline">
                    Cancel
                </button>
            </div>

            {/* Error Display */}
            {recorder.error && (
                <div className="error-message">
                    <span className="icon">⚠️</span>
                    {recorder.error}
                </div>
            )}
        </div>
    );
}

// Styles (inline for now, can be extracted to CSS file later)
const styles = `
.voice-recorder {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.verse-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.verse-display h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.verse-arabic {
  font-size: 1.8rem;
  line-height: 2.5;
  color: #1a1a1a;
  margin: 1rem 0;
  font-family: 'Traditional Arabic', 'Scheherazade', serif;
}

.verse-translation {
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
  margin-top: 1rem;
}

.recording-status {
  text-align: center;
  margin: 1rem 0;
  min-height: 30px;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.status-indicator.recording {
  background: #fee;
  color: #d32f2f;
}

.status-indicator.paused {
  background: #fff3e0;
  color: #f57c00;
}

.status-indicator.stopped {
  background: #e8f5e9;
  color: #388e3c;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #d32f2f;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.timer {
  text-align: center;
  margin: 1.5rem 0;
}

.timer .duration {
  font-size: 3rem;
  font-weight: 300;
  color: #2c3e50;
  font-family: 'Monaco', 'Courier New', monospace;
}

.waveform {
  height: 80px;
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.waveform-bars {
  display: flex;
  gap: 3px;
  align-items: center;
  height: 100%;
}

.waveform-bars .bar {
  width: 4px;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 2px;
  animation: wave 0.5s ease-in-out infinite alternate;
}

@keyframes wave {
  from { opacity: 0.3; }
  to { opacity: 1; }
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-record {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-outline {
  background: white;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #6c757d;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  color: #d32f2f;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1.2em;
}
`;

// Add styles to document (temporary, move to CSS file later)
if (typeof document !== "undefined") {
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
}
