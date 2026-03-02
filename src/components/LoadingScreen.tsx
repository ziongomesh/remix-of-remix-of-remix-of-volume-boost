import { useState, useEffect, useMemo } from 'react';
import logoImage from '@/assets/logo-new.png';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  // Random start rotation so the arc begins at a different position each time
  const startRotation = useMemo(() => Math.floor(Math.random() * 360), []);

  useEffect(() => {
    // Simulate real loading progress
    const intervals = [
      { delay: 100, value: 15 },
      { delay: 300, value: 35 },
      { delay: 500, value: 55 },
      { delay: 800, value: 75 },
      { delay: 1000, value: 88 },
      { delay: 1300, value: 100 },
    ];

    const timers = intervals.map(({ delay, value }) =>
      setTimeout(() => setProgress(value), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,6%)]">
      <div className="relative flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center">
          {/* Glow effect behind logo */}
          <div className="absolute w-24 h-24 rounded-full bg-primary/15 blur-2xl" />

          {/* Background track */}
          <svg className="absolute w-28 h-28" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="hsl(200, 80%, 65%)"
              strokeOpacity="0.08"
              strokeWidth="3"
            />
          </svg>

          {/* Spinning arc - random start rotation */}
          <svg
            className="absolute w-28 h-28 animate-spin"
            style={{
              animationDuration: '1.6s',
              transform: `rotate(${startRotation}deg)`,
            }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="180 280"
            />
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 80%, 65%)" />
                <stop offset="100%" stopColor="hsl(200, 80%, 65%)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Logo */}
          <img
            src={logoImage}
            alt="Data Sistemas"
            className="h-14 w-14 relative z-10 dark:invert"
          />
        </div>

        {/* Progress bar */}
        <div className="w-40 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
