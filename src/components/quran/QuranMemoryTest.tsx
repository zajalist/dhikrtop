import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, StopCircle, CheckCircle, RotateCcw, Volume2, X, SkipForward } from 'lucide-react';

interface QuranMemoryAyah {
  surah: string;
  arabicName: string;
  ayah: string;
  ayahNumber: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface RecitationResult {
  ayahId: string;
  timestamp: number;
  recalled: boolean;
  recorded: boolean;
  duration?: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Quran memorization testing component
 * Tests user's ability to recall memorized Quranic passages
 */
export function QuranMemoryTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentAyah, setCurrentAyah] = useState<QuranMemoryAyah | null>(null);
  const [testState, setTestState] = useState<'intro' | 'testing' | 'recording' | 'result'>('intro');
  const [hasRecallResult, setHasRecallResult] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);


  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const memorizedAyahs: QuranMemoryAyah[] = [
    {
      surah: 'Al-Fatiha',
      arabicName: 'الفاتحة',
      ayah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      ayahNumber: 1,
      difficulty: 'easy',
    },
    {
      surah: 'Ayat al-Kursi',
      arabicName: 'آية الكرسي',
      ayah: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      ayahNumber: 255,
      difficulty: 'medium',
    },
    {
      surah: 'Al-Ikhlas',
      arabicName: 'الإخلاص',
      ayah: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      ayahNumber: 1,
      difficulty: 'easy',
    },
  ];

  // Initialize audio recording
  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        setAiAvailable(true);
      } catch (error) {
        console.log('Microphone not available, using manual mode', error);
        setAiAvailable(false);
        setShowManualOption(true);
      }
    };

    initAudio();
  }, []);

  // Start recording
  const startRecording = async () => {
    if (!mediaRecorderRef.current) return;

    audioChunksRef.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Start a new test
  const startTest = () => {
    const randomAyah = memorizedAyahs[Math.floor(Math.random() * memorizedAyahs.length)];
    setCurrentAyah(randomAyah);
    setTestState('testing');
    setHasRecallResult(null);
    setDifficulty(null);
  };

  // Submit manual recall result
  const submitManualResult = (recalled: boolean) => {
    setHasRecallResult(recalled);
    setTestState('result');

    // Store result
    const result: RecitationResult = {
      ayahId: currentAyah?.ayahNumber.toString() || '',
      timestamp: Date.now(),
      recalled,
      recorded: false,
      difficulty: difficulty || currentAyah?.difficulty || 'medium',
    };

    try {
      const results = JSON.parse(localStorage.getItem('quran_memory_results') || '[]');
      results.push(result);
      localStorage.setItem('quran_memory_results', JSON.stringify(results));
    } catch (e) {
      console.error('Failed to store result', e);
    }
  };

  // Handle recording submission
  const submitRecording = () => {
    setHasRecallResult(true);
    setTestState('result');

    const result: RecitationResult = {
      ayahId: currentAyah?.ayahNumber.toString() || '',
      timestamp: Date.now(),
      recalled: true,
      recorded: true,
      duration: recordingTime,
      difficulty: difficulty || currentAyah?.difficulty || 'medium',
    };

    try {
      const results = JSON.parse(localStorage.getItem('quran_memory_results') || '[]');
      results.push(result);
      localStorage.setItem('quran_memory_results', JSON.stringify(results));
    } catch (e) {
      console.error('Failed to store result', e);
    }
  };

  const nextTest = () => {
    startTest();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-40 pointer-events-auto">
      <AnimatePresence mode="wait">
        {testState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative rounded-3xl p-8 max-w-md w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(106,36,40,0.8), rgba(74,21,24,0.9))',
              border: '2px solid rgba(220,160,72,0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>
                  Test Your Memorization
                </h2>
                <p style={{ color: '#D7C29F' }}>
                  Let's check how well you remember your Quranic passages
                </p>
              </div>

              <div
                className="rounded-2xl p-6 space-y-4"
                style={{
                  background: 'rgba(220,160,72,0.08)',
                  border: '1px solid rgba(220,160,72,0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Volume2 style={{ color: '#DCA048' }} size={20} />
                  <span style={{ color: '#D7C29F' }}>
                    {aiAvailable ? 'Mic available - Record your recitation' : 'Manual mode - Affirm what you recall'}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startTest}
                className="w-full py-3 rounded-xl text-white font-600"
                style={{
                  background: 'linear-gradient(135deg, #DCA048, #CF9555)',
                  boxShadow: '0 10px 30px rgba(220,160,72,0.3)',
                }}
              >
                Begin Test
              </motion.button>
            </div>
          </motion.div>
        )}

        {testState === 'testing' && currentAyah && (
          <motion.div
            key="testing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative rounded-3xl p-8 max-w-2xl w-full"
            style={{
              background: 'linear-gradient(135deg, rgba(106,36,40,0.8), rgba(74,21,24,0.9))',
              border: '2px solid rgba(220,160,72,0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div className="space-y-6">
              {/* Ayah Display */}
              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(220,160,72,0.2)',
                }}
              >
                <h3 style={{ color: '#DCA048', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  {currentAyah.surah} • {currentAyah.arabicName}
                </h3>
                <p
                  dir="rtl"
                  style={{
                    color: 'white',
                    fontSize: '1.6rem',
                    fontFamily: 'Amiri, serif',
                    lineHeight: 2,
                    marginBottom: '1rem',
                  }}
                >
                  {currentAyah.ayah}
                </p>
                <p style={{ color: '#CF9555', fontSize: '0.9rem' }}>
                  Can you recite this ayah by memory?
                </p>
              </div>

              {/* Recording Controls */}
              {aiAvailable && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    {!isRecording ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #DCA048, #CF9555)',
                          boxShadow: '0 0 30px rgba(220,160,72,0.5)',
                        }}
                      >
                        <Mic size={32} color="white" />
                      </motion.button>
                    ) : (
                      <>
                        <motion.button
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                          }}
                          onClick={stopRecording}
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
                          }}
                        >
                          <StopCircle size={32} color="white" />
                        </motion.button>
                        <div style={{ color: '#D7C29F' }}>{recordingTime}s</div>
                      </>
                    )}
                  </div>

                  {!isRecording && recordingTime > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={submitRecording}
                      className="w-full py-3 rounded-xl text-white font-600"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      }}
                    >
                      Submit Recording
                    </motion.button>
                  )}
                </div>
              )}

              {/* Manual Mode Alternative */}
              {!isRecording && (showManualOption || !aiAvailable) && recordingTime === 0 && (
                <div className="space-y-3 border-t border-white/10 pt-6">
                  <p style={{ color: '#D7C29F', textAlign: 'center' }}>
                    {aiAvailable
                      ? 'Or affirm manually:'
                      : 'Did you recall this ayah correctly?'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => submitManualResult(true)}
                      className="py-3 rounded-xl text-white font-600 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      }}
                    >
                      <CheckCircle size={18} />
                      Yes, I Recall It
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => submitManualResult(false)}
                      className="py-3 rounded-xl text-white font-600 flex items-center justify-center gap-2"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#D7C29F',
                      }}
                    >
                      <X size={18} />
                      I Forgot
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Skip option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextTest}
                className="w-full py-2 rounded-xl text-sm"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#D7C29F',
                }}
              >
                <SkipForward size={16} className="inline mr-2" />
                Skip This Ayah
              </motion.button>
            </div>
          </motion.div>
        )}

        {testState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative rounded-3xl p-8 max-w-md w-full text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(106,36,40,0.8), rgba(74,21,24,0.9))',
              border: '2px solid rgba(220,160,72,0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex justify-center"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: hasRecallResult
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                    border: `2px solid ${hasRecallResult ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  <CheckCircle
                    size={40}
                    color={hasRecallResult ? '#22c55e' : '#ef4444'}
                  />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>
                  {hasRecallResult ? 'Excellent!' : 'Keep Practicing!'}
                </h3>
                <p style={{ color: '#D7C29F' }}>
                  {hasRecallResult
                    ? 'Your memorization is strong. Keep it up!'
                    : "Don't worry, you'll remember this soon. Keep reviewing!"}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextTest}
                className="w-full py-3 rounded-xl text-white font-600 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #DCA048, #CF9555)',
                  boxShadow: '0 10px 30px rgba(220,160,72,0.3)',
                }}
              >
                <RotateCcw size={18} />
                Test Another Ayah
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setTestState('intro')}
        className="absolute inset-0 z-[-1] bg-black/50"
      />
    </div>
  );
}
