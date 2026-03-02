import { BackgroundEffects } from '../shared/BackgroundEffects';

export function QuranReader() {
  return (
    <div className="min-h-full p-4 md:p-6 max-w-2xl mx-auto">
      <div className="text-white">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Quran Reader</h1>
        <p style={{ color: '#D7C29F', marginBottom: 24 }}>
          This feature is coming soon. The full Quran reader with tajweed highlighting will be available in the next update.
        </p>
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(106,36,40,0.6)',
            border: '1px solid rgba(220,160,72,0.15)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              fontFamily: 'Amiri, serif',
              fontSize: '4rem',
              color: '#DCA048',
              opacity: 0.3,
              marginBottom: 16,
            }}
          >
            &#1602;
          </div>
          <p style={{ color: 'white', fontWeight: 600 }}>Under Development</p>
          <p style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.9rem', marginTop: 8 }}>
            The Quran reader with verse-by-verse tajweed highlighting is being implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
