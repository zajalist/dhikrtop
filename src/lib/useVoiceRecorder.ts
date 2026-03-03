/**
 * React Hook: Voice Recorder
 *
 * Provides recording, playback, and storage functionality
 * for Quranic verse practice
 *
 * Usage:
 * const recorder = useVoiceRecorder();
 * await recorder.startRecording(surahNumber, verseNumber);
 * await recorder.stopRecording();
 * await recorder.saveRecording();
 */

import { useState, useCallback, useRef } from "react";
import { useDatabase } from "./useDatabase";

// ── Type Definitions ────────────────────────────────────────────────

export interface RecordingState {
    surahNumber: number;
    verseNumber: number;
    isRecording: boolean;
    isPaused: boolean;
    durationMs: number;
}

export interface RecordingFile {
    id: string;
    surahNumber: number;
    verseNumber: number;
    filePath: string;
    duration: number;
    createdAt: number;
}

export interface UseVoiceRecorder {
    // State
    isRecording: boolean;
    isPaused: boolean;
    durationMs: number;
    currentSurah: number | null;
    currentVerse: number | null;
    error: string | null;

    // Recording control
    startRecording: (surahNumber: number, verseNumber: number) => Promise<void>;
    pauseRecording: () => Promise<void>;
    resumeRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;

    // File management
    saveRecording: () => Promise<string>;
    deleteRecording: (recordingId: string) => Promise<void>;

    // Retrieval
    getUserRecordings: () => Promise<RecordingFile[]>;
    getVerseRecordings: (
        surahNumber: number,
        verseNumber: number,
    ) => Promise<RecordingFile[]>;

    // Playback
    playRecording: (recordingId: string) => Promise<void>;
    pausePlayback: () => Promise<void>;
    stopPlayback: () => Promise<void>;
}

// ── State Management ────────────────────────────────────────────────

interface RecordingSession {
    surahNumber: number;
    verseNumber: number;
    startTime: number;
    audioData?: Blob;
}

// ── Main Hook ──────────────────────────────────────────────────────

export function useVoiceRecorder(): UseVoiceRecorder {
    // State
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [durationMs, setDurationMs] = useState(0);
    const [currentSurah, setCurrentSurah] = useState<number | null>(null);
    const [currentVerse, setCurrentVerse] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const recordingSessionRef = useRef<RecordingSession | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

    // Database hook for persistence
    const db = useDatabase();

    // Helper: Update recording timer
    const updateTimer = useCallback(() => {
        if (recordingSessionRef.current && isRecording && !isPaused) {
            const elapsed = Date.now() - recordingSessionRef.current.startTime;
            setDurationMs(elapsed);
        }
    }, [isRecording, isPaused]);

    // Start recording
    const startRecording = useCallback(
        async (surahNumber: number, verseNumber: number) => {
            try {
                setError(null);

                // Check if already recording
                if (isRecording) {
                    throw new Error("Already recording");
                }

                // Request microphone access
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });

                // Create audio context if needed
                if (!audioContextRef.current) {
                    audioContextRef.current = new (
                        window.AudioContext ||
                        (window as any).webkitAudioContext
                    )();
                }

                // Create media recorder
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "audio/wav",
                    audioBitsPerSecond: 128000, // 128 kbps
                });

                // Setup recording session
                recordingSessionRef.current = {
                    surahNumber,
                    verseNumber,
                    startTime: Date.now(),
                    audioData: undefined,
                };

                // Record audio chunks
                const audioChunks: Blob[] = [];
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, {
                        type: "audio/wav",
                    });
                    if (recordingSessionRef.current) {
                        recordingSessionRef.current.audioData = audioBlob;
                    }

                    // Stop all tracks
                    stream.getTracks().forEach((track) => track.stop());
                };

                // Start recording
                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;

                // Start timer
                setCurrentSurah(surahNumber);
                setCurrentVerse(verseNumber);
                setIsRecording(true);
                setIsPaused(false);
                setDurationMs(0);

                // Update timer every 100ms
                timerRef.current = setInterval(updateTimer, 100);
            } catch (err: any) {
                const errorMsg = err.message || "Failed to start recording";
                setError(errorMsg);
                throw err;
            }
        },
        [isRecording, updateTimer],
    );

    // Pause recording
    const pauseRecording = useCallback(async () => {
        try {
            setError(null);

            if (!isRecording || isPaused) {
                throw new Error("Not recording");
            }

            mediaRecorderRef.current?.pause();
            setIsPaused(true);

            // Pause timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        } catch (err: any) {
            setError(err.message || "Failed to pause recording");
            throw err;
        }
    }, [isRecording, isPaused]);

    // Resume recording
    const resumeRecording = useCallback(async () => {
        try {
            setError(null);

            if (!isRecording || !isPaused) {
                throw new Error("Not paused");
            }

            mediaRecorderRef.current?.resume();
            setIsPaused(false);

            // Resume timer
            timerRef.current = setInterval(updateTimer, 100);
        } catch (err: any) {
            setError(err.message || "Failed to resume recording");
            throw err;
        }
    }, [isRecording, isPaused, updateTimer]);

    // Stop recording
    const stopRecording = useCallback(async () => {
        try {
            setError(null);

            if (!isRecording) {
                throw new Error("Not recording");
            }

            // Stop media recorder
            mediaRecorderRef.current?.stop();

            // Stop timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            setIsRecording(false);
            setIsPaused(false);
        } catch (err: any) {
            setError(err.message || "Failed to stop recording");
            throw err;
        }
    }, [isRecording]);

    // Save recording to database
    const saveRecording = useCallback(async (): Promise<string> => {
        try {
            setError(null);

            if (!recordingSessionRef.current) {
                throw new Error("No recording session");
            }

            const { surahNumber, verseNumber, audioData } =
                recordingSessionRef.current;

            if (!audioData || !currentSurah || !currentVerse) {
                throw new Error("Invalid recording data");
            }

            // Save to file (in real app, would use Tauri file system)
            const fileName = `recording_${surahNumber}_${verseNumber}_${Date.now()}.wav`;

            // Save to database
            const recordingId = await db.saveVoiceRecording({
                userId: "current-user", // TODO: Get from auth
                surahNumber,
                verseNumber,
                filePath: fileName,
                duration: durationMs / 1000, // Convert to seconds
            });

            return recordingId;
        } catch (err: any) {
            const errorMsg = err.message || "Failed to save recording";
            setError(errorMsg);
            throw err;
        }
    }, [currentSurah, currentVerse, durationMs, db]);

    // Delete recording
    const deleteRecording = useCallback(
        async (recordingId: string) => {
            try {
                setError(null);
                await db.deleteVoiceRecording(recordingId);
            } catch (err: any) {
                setError(err.message || "Failed to delete recording");
                throw err;
            }
        },
        [db],
    );

    // Get user recordings
    const getUserRecordings = useCallback(async (): Promise<
        RecordingFile[]
    > => {
        try {
            setError(null);
            const recordings = await db.getVoiceRecordings("current-user"); // TODO: Get from auth
            return recordings as RecordingFile[];
        } catch (err: any) {
            setError(err.message || "Failed to get recordings");
            throw err;
        }
    }, [db]);

    // Get verse-specific recordings
    const getVerseRecordings = useCallback(
        async (
            surahNumber: number,
            verseNumber: number,
        ): Promise<RecordingFile[]> => {
            try {
                setError(null);
                const recordings = await db.getVerseRecordings(
                    "current-user",
                    surahNumber,
                    verseNumber,
                );
                return recordings as RecordingFile[];
            } catch (err: any) {
                setError(err.message || "Failed to get verse recordings");
                throw err;
            }
        },
        [db],
    );

    // Play recording
    const playRecording = useCallback(async (recordingId: string) => {
        try {
            setError(null);

            // In real implementation, would fetch audio from file system
            // For now, this is a placeholder
            console.log("Playing recording:", recordingId);
        } catch (err: any) {
            setError(err.message || "Failed to play recording");
            throw err;
        }
    }, []);

    // Pause playback
    const pausePlayback = useCallback(async () => {
        try {
            setError(null);

            if (audioPlaybackRef.current) {
                audioPlaybackRef.current.pause();
            }
        } catch (err: any) {
            setError(err.message || "Failed to pause playback");
            throw err;
        }
    }, []);

    // Stop playback
    const stopPlayback = useCallback(async () => {
        try {
            setError(null);

            if (audioPlaybackRef.current) {
                audioPlaybackRef.current.pause();
                audioPlaybackRef.current.currentTime = 0;
            }
        } catch (err: any) {
            setError(err.message || "Failed to stop playback");
            throw err;
        }
    }, []);

    return {
        // State
        isRecording,
        isPaused,
        durationMs,
        currentSurah,
        currentVerse,
        error,

        // Recording control
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,

        // File management
        saveRecording,
        deleteRecording,

        // Retrieval
        getUserRecordings,
        getVerseRecordings,

        // Playback
        playRecording,
        pausePlayback,
        stopPlayback,
    };
}
