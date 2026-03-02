import { useCallback, useEffect, useRef, useState } from 'react';
import type { Adhkar } from '../lib/types';
import styles from './AdhkarCard.module.css';

interface Props {
  adhkar: Adhkar;
  onDismiss: () => void;
  onLike: () => void;
  onDislike: () => void;
  onSnooze: () => void;
  onSettings: () => void;
  /** seconds before auto-dismiss (default 30) */
  autoDismissSec?: number;
}

export default function AdhkarCard({
  adhkar,
  onDismiss,
  onLike,
  onDislike,
  onSnooze,
  onSettings,
  autoDismissSec = 30,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | undefined>(undefined);

  // Fade-in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Countdown progress bar
  useEffect(() => {
    startRef.current = Date.now();
    const duration = autoDismissSec * 1000;

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onDismiss();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoDismissSec, onDismiss]);

  const handle = useCallback(
    (action: () => void) => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setVisible(false);
      setTimeout(action, 220);
    },
    []
  );

  return (
    <div
      className={`${styles.card} ${visible ? styles.visible : ''}`}
      onMouseEnter={() => {
        // Pause countdown on hover by resetting start time proportionally
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      }}
      onMouseLeave={() => {
        // Resume countdown from current progress
        startRef.current = Date.now() - ((100 - progress) / 100) * autoDismissSec * 1000;
        const duration = autoDismissSec * 1000;
        const tick = () => {
          const elapsed = Date.now() - startRef.current;
          const pct = Math.max(0, 100 - (elapsed / duration) * 100);
          setProgress(pct);
          if (pct > 0) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            onDismiss();
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      }}
    >
      {/* Progress bar */}
      <div className={styles.progress}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <div className={styles.body}>
        <span className={styles.category}>{adhkar.category}</span>

        <p className={styles.arabic}>{adhkar.arabic}</p>
        <p className={styles.transliteration}>{adhkar.transliteration}</p>
        <p className={styles.english}>{adhkar.english}</p>

        <div className={styles.meta}>
          <span className={styles.source}>{adhkar.source}</span>
          {adhkar.repeat && (
            <span className={styles.repeat}>× {adhkar.repeat}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnLike}`}
          onClick={handle(onLike)}
          title="Like"
        >
          ♥
        </button>
        <button
          className={`${styles.btn} ${styles.btnDislike}`}
          onClick={handle(onDislike)}
          title="Dislike"
        >
          ✕
        </button>
        <button
          className={`${styles.btn} ${styles.btnSnooze}`}
          onClick={handle(onSnooze)}
          title="Snooze 30 min"
        >
          ⏱
        </button>
        <div className={styles.spacer} />
        <button
          className={`${styles.btn} ${styles.btnSettings}`}
          onClick={onSettings}
          title="Settings"
        >
          ⚙
        </button>
        <button
          className={`${styles.btn} ${styles.btnDismiss}`}
          onClick={handle(onDismiss)}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
