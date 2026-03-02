import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Brain } from 'lucide-react';
import { BackgroundEffects } from '../shared/BackgroundEffects';
import { QuranMemoryTest } from './QuranMemoryTest';
import { GlowCard } from '../shared/BackgroundEffects';

export function QuranReader() {
  const [showMemoryTest, setShowMemoryTest] = useState(false);

  return (
    <div className="min-h-full p-4 md:p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-white space-y-2">
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Quran</h1>
          <p style={{ color: '#D7C29F' }}>
            Read and test your Quranic memorization
          </p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reader Card */}
          <GlowCard className="p-6 cursor-not-allowed opacity-60">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(220,160,72,0.2)' }}
              >
                <BookOpen size={24} style={{ color: '#DCA048' }} />
              </div>
              <div className="flex-1">
                <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>
                  Quran Reader
                </h3>
                <p style={{ color: '#D7C29F', fontSize: '0.85rem' }}>
                  Coming Soon - Full Quran with tajweed
                </p>
              </div>
            </div>
          </GlowCard>

          {/* Memory Test Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMemoryTest(true)}
          >
            <GlowCard className="p-6 cursor-pointer hover:border-yellow-500">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(220,160,72,0.2)' }}
                >
                  <Brain size={24} style={{ color: '#DCA048' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>
                    Test Memorization
                  </h3>
                  <p style={{ color: '#D7C29F', fontSize: '0.85rem' }}>
                    Record or affirm your recitation
                  </p>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>

        {/* Featured Surahs */}
        <div className="space-y-3">
          <h3 style={{ color: 'white', fontWeight: 600 }}>Featured Surahs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'Al-Fatiha', arabic: 'الفاتحة', verses: 7 },
              { name: 'Ya-Seen', arabic: 'يس', verses: 83 },
              { name: 'Ar-Rahman', arabic: 'الرحمن', verses: 78 },
              { name: 'Al-Mulk', arabic: 'الملك', verses: 30 },
              { name: 'Al-Kahf', arabic: 'الكهف', verses: 110 },
              { name: 'Maryam', arabic: 'مريم', verses: 98 },
            ].map((surah) => (
              <GlowCard key={surah.name} className="p-4 cursor-not-allowed opacity-60">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: 'rgba(220,160,72,0.15)' }}
                >
                  <span style={{ color: '#DCA048', fontSize: '0.7rem', fontWeight: 700 }}>
                    ۲
                  </span>
                </div>
                <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>
                  {surah.name}
                </div>
                <div dir="rtl" style={{ color: '#CF9555', fontSize: '0.85rem', fontFamily: 'Amiri, serif', marginTop: 4 }}>
                  {surah.arabic}
                </div>
                <div style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.65rem', marginTop: 4 }}>
                  {surah.verses} verses
                </div>
              </GlowCard>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <GlowCard className="p-6">
          <h4 style={{ color: '#DCA048', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
            About Tajweed
          </h4>
          <p style={{ color: '#D7C29F', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Tajweed is the science of Quranic recitation. When the reader fully masters the rules of tajweed, the Quran sounds beautiful and is recited correctly.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Madd', color: '#3b82f6' },
              { label: 'Qalqalah', color: '#ef4444' },
              { label: 'Idgham', color: '#22c55e' },
            ].map((rule) => (
              <div key={rule.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: rule.color }}
                />
                <span style={{ color: '#D7C29F', fontSize: '0.75rem' }}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </GlowCard>
      </motion.div>

      {/* Memory Test Modal */}
      {showMemoryTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <QuranMemoryTest />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowMemoryTest(false)}
            className="absolute inset-0 bg-black/30"
            style={{ zIndex: -1 }}
          />
        </div>
      )}
    </div>
  );
}
