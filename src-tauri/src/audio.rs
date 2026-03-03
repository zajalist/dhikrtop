//! Audio Recording Module (feature-gated)
//!
//! This module is only compiled when the `audio` Cargo feature is enabled.
//! On Linux, enabling audio requires the ALSA development package:
//!   - Debian/Ubuntu: `sudo apt-get install -y libasound2-dev pkg-config`
//!
//! Usage:
//! ```no_run
//! let mut recorder = Recorder::new()?;
//! recorder.start_recording()?;
//! // ... record ...
//! recorder.stop_recording()?;
//! let duration_ms = recorder.save_recording("output.wav")?;
//! ```

#![cfg(feature = "audio")]
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, Host, Stream, StreamConfig};
use std::path::Path;
use std::sync::{Arc, Mutex};
use thiserror::Error;

/// Audio recording errors
#[derive(Error, Debug, Clone)]
pub enum AudioError {
    #[error("No audio devices found")]
    NoDevices,

    #[error("Failed to build recording stream: {0}")]
    StreamBuildError(String),

    #[error("Failed to play stream: {0}")]
    StreamPlayError(String),

    #[error("Failed to write audio file: {0}")]
    FileWriteError(String),

    #[error("Failed to create audio file: {0}")]
    FileCreateError(String),

    #[error("Recording not in progress")]
    NotRecording,

    #[error("Already recording")]
    AlreadyRecording,

    #[error("Invalid audio configuration")]
    InvalidConfig,

    #[error("IO Error: {0}")]
    IoError(String),
}

impl From<std::io::Error> for AudioError {
    fn from(err: std::io::Error) -> Self {
        AudioError::IoError(err.to_string())
    }
}

/// Recording state
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecordingState {
    /// Not recording
    Idle,
    /// Currently recording
    Recording,
    /// Recording paused (can resume)
    Paused,
    /// Recording stopped (ready to save)
    Stopped,
}

/// Audio recorder handle
pub struct Recorder {
    /// Host for audio device management
    host: Host,
    /// Input device
    device: Option<Device>,
    /// Stream configuration
    config: Option<StreamConfig>,
    /// Active recording stream
    stream: Option<Stream>,
    /// Recording state
    state: Arc<Mutex<RecordingState>>,
    /// Audio data buffer
    audio_data: Arc<Mutex<Vec<i16>>>,
}

impl Recorder {
    /// Create a new recorder with default settings
    pub fn new() -> Result<Self, AudioError> {
        let host = cpal::default_host();

        // Get default input device
        let device = host.default_input_device().ok_or(AudioError::NoDevices)?;

        println!("Using audio device: {}", device.name().unwrap_or_default());

        Ok(Recorder {
            host,
            device: Some(device),
            config: None,
            stream: None,
            state: Arc::new(Mutex::new(RecordingState::Idle)),
            audio_data: Arc::new(Mutex::new(Vec::new())),
        })
    }

    /// Get available input devices
    pub fn list_devices(&self) -> Result<Vec<String>, AudioError> {
        self.host
            .input_devices()
            .map_err(|_| AudioError::NoDevices)?
            .map(|d| d.name().unwrap_or_else(|_| "Unknown".to_string()))
            .collect::<Result<Vec<_>, _>>()
            .map_err(|_| AudioError::NoDevices)
    }

    /// Get supported recording configurations
    pub fn supported_configs(&self) -> Result<Vec<String>, AudioError> {
        let device = self.device.as_ref().ok_or(AudioError::NoDevices)?;

        let configs = device
            .supported_input_configs()
            .map_err(|_| AudioError::InvalidConfig)?
            .map(|cfg| {
                format!(
                    "{} channels, {} Hz, {:?}",
                    cfg.channels(),
                    cfg.max_sample_rate().0,
                    cfg.sample_format()
                )
            })
            .collect::<Vec<_>>();

        Ok(configs)
    }

    /// Start recording (audio is buffered in memory until saved).
    pub fn start_recording(&mut self) -> Result<(), AudioError> {
        // Check if already recording
        let mut state = self.state.lock().unwrap();
        if *state == RecordingState::Recording {
            return Err(AudioError::AlreadyRecording);
        }

        let device = self.device.as_ref().ok_or(AudioError::NoDevices)?;

        // Use default config (44.1kHz, 16-bit, mono)
        let config = StreamConfig {
            channels: 1,
            sample_rate: cpal::SampleRate(44100),
            buffer_size: cpal::BufferSize::Default,
        };

        // Clear previous audio data
        self.audio_data.lock().unwrap().clear();

        // Create recording stream
        let audio_data_clone = Arc::clone(&self.audio_data);

        let stream = device
            .build_input_stream(
                &config,
                move |data: &[i16], _: &cpal::InputCallbackInfo| {
                    let mut audio = audio_data_clone.lock().unwrap();
                    audio.extend_from_slice(data);
                },
                |err| eprintln!("Stream error: {}", err),
                None,
            )
            .map_err(|e| AudioError::StreamBuildError(e.to_string()))?;

        // Start the stream
        stream
            .play()
            .map_err(|e| AudioError::StreamPlayError(e.to_string()))?;

        *state = RecordingState::Recording;
        drop(state); // Release lock

        self.stream = Some(stream);
        self.config = Some(config);

        Ok(())
    }

    /// Pause recording
    pub fn pause_recording(&mut self) -> Result<(), AudioError> {
        let mut state = self.state.lock().unwrap();

        if *state != RecordingState::Recording {
            return Err(AudioError::NotRecording);
        }

        if let Some(stream) = &self.stream {
            stream
                .pause()
                .map_err(|e| AudioError::StreamPlayError(e.to_string()))?;
        }

        *state = RecordingState::Paused;
        Ok(())
    }

    /// Resume recording from pause
    pub fn resume_recording(&mut self) -> Result<(), AudioError> {
        let mut state = self.state.lock().unwrap();

        if *state != RecordingState::Paused {
            return Err(AudioError::NotRecording);
        }

        if let Some(stream) = &self.stream {
            stream
                .play()
                .map_err(|e| AudioError::StreamPlayError(e.to_string()))?;
        }

        *state = RecordingState::Recording;
        Ok(())
    }

    /// Stop recording
    pub fn stop_recording(&mut self) -> Result<(), AudioError> {
        let mut state = self.state.lock().unwrap();

        if *state != RecordingState::Recording && *state != RecordingState::Paused {
            return Err(AudioError::NotRecording);
        }

        // Drop the stream (stops recording)
        self.stream = None;
        *state = RecordingState::Stopped;

        Ok(())
    }

    /// Save recorded audio to WAV file
    pub fn save_recording<P: AsRef<Path>>(&self, output_path: P) -> Result<u32, AudioError> {
        let audio_data = self.audio_data.lock().unwrap();
        let config = self.config.ok_or(AudioError::InvalidConfig)?;

        let spec = hound::WavSpec {
            channels: config.channels,
            sample_rate: config.sample_rate.0,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let mut writer = hound::WavWriter::create(output_path, spec)
            .map_err(|e| AudioError::FileCreateError(e.to_string()))?;

        for &sample in audio_data.iter() {
            writer
                .write_sample(sample)
                .map_err(|e| AudioError::FileWriteError(e.to_string()))?;
        }

        writer
            .finalize()
            .map_err(|e| AudioError::FileWriteError(e.to_string()))?;

        let duration_ms = (audio_data.len() as u32 * 1000) / config.sample_rate.0;
        Ok(duration_ms)
    }

    /// Get current recording state
    pub fn state(&self) -> RecordingState {
        *self.state.lock().unwrap()
    }

    /// Get duration of recorded audio in milliseconds
    pub fn get_duration_ms(&self) -> u32 {
        let audio_data = self.audio_data.lock().unwrap();
        let config = self.config.unwrap_or(StreamConfig {
            channels: 1,
            sample_rate: cpal::SampleRate(44100),
            buffer_size: cpal::BufferSize::Default,
        });

        (audio_data.len() as u32 * 1000) / config.sample_rate.0
    }

    /// Get number of audio samples recorded
    pub fn get_sample_count(&self) -> usize {
        self.audio_data.lock().unwrap().len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recorder_creation() {
        let recorder = Recorder::new();
        assert!(recorder.is_ok());
    }

    #[test]
    fn test_initial_state() {
        if let Ok(recorder) = Recorder::new() {
            assert_eq!(recorder.state(), RecordingState::Idle);
        }
    }

    #[test]
    fn test_list_devices() {
        if let Ok(recorder) = Recorder::new() {
            let devices = recorder.list_devices();
            assert!(devices.is_ok());
            assert!(!devices.unwrap().is_empty());
        }
    }

    #[test]
    fn test_supported_configs() {
        if let Ok(recorder) = Recorder::new() {
            let configs = recorder.supported_configs();
            assert!(configs.is_ok());
        }
    }
}
