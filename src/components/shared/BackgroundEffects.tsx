import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface Orb {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const orbs: Orb[] = [
  { x: 10, y: 20, size: 300, delay: 0, duration: 8, color: 'rgba(106,36,40,0.4)' },
  { x: 75, y: 10, size: 200, delay: 2, duration: 10, color: 'rgba(220,160,72,0.15)' },
  { x: 85, y: 70, size: 250, delay: 1, duration: 9, color: 'rgba(106,36,40,0.3)' },
  { x: 20, y: 80, size: 180, delay: 3, duration: 7, color: 'rgba(207,149,85,0.12)' },
  { x: 50, y: 50, size: 150, delay: 0.5, duration: 11, color: 'rgba(74,21,24,0.5)' },
];

const particles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 6 + 4,
}));

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 20%, #1a0508 0%, #0d0205 50%, #080105 100%)',
      }} />

      {/* Animated orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale: [1, 1.2, 0.95, 1.1, 1],
            x: [0, 20, -15, 10, 0],
            y: [0, -15, 20, -10, 0],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(220,160,72,0.6)',
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DCA048' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
    </div>
  );
}

export function GlowCard({ children, className = '', gold = false }: {
  children: React.ReactNode;
  className?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: gold
          ? 'linear-gradient(135deg, rgba(220,160,72,0.15) 0%, rgba(106,36,40,0.8) 100%)'
          : 'rgba(106,36,40,0.6)',
        backdropFilter: 'blur(16px)',
        border: gold ? '1px solid rgba(220,160,72,0.4)' : '1px solid rgba(220,160,72,0.15)',
        boxShadow: gold
          ? '0 8px 32px rgba(220,160,72,0.15), inset 0 1px 0 rgba(220,160,72,0.2)'
          : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </div>
  );
}

export function ArabicCalligraphyBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute right-[-2rem] top-[-2rem] opacity-5 text-[#DCA048] select-none"
        style={{ fontSize: '18rem', fontFamily: 'Amiri, serif', lineHeight: 1 }}
        dir="rtl"
      >
        الله
      </div>
    </div>
  );
}
