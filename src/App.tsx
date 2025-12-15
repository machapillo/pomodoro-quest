import React, { useState, useEffect } from 'react';

// --- Inlined Game Logic ---
const BASE_XP = 100;
const XP_MULTIPLIER = 1.5;

const calculateNextLevelXp = (level: number) => {
  return Math.floor(BASE_XP * Math.pow(level, XP_MULTIPLIER));
};

const CLASSES = [
  { level: 1, title: 'Novice Wanderer' },
  { level: 5, title: 'Apprentice Focusing' },
  { level: 10, title: 'Quest Knight' },
  { level: 20, title: 'High Concentration Mage' },
  { level: 50, title: 'Grandmaster of Flow' }
];

const getTitleForLevel = (level: number): string => {
  const reversedClasses = [...CLASSES].reverse();
  const matchedClass = reversedClasses.find(c => level >= c.level);
  return matchedClass ? matchedClass.title : CLASSES[0].title;
};

// --- App Component ---
const STORAGE_KEY = 'pomodoro-quest-v1';
const FOCUS_DURATION = 25;

function App() {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION * 60);
  const [isActive, setIsActive] = useState(false);

  // Gamification State
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
        level: 1, currentXp: 0, nextLevelXp: 100, totalFocusModes: 0, title: 'Novice Wanderer'
      };
    } catch {
      return { level: 1, currentXp: 0, nextLevelXp: 100, totalFocusModes: 0, title: 'Novice Wanderer' };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const addXp = (amount: number) => {
    setStats((prev: any) => {
      let xp = prev.currentXp + amount;
      let level = prev.level;

      let loopGuard = 0;
      while (loopGuard < 100) {
        const req = calculateNextLevelXp(level);
        if (xp >= req) {
          xp -= req;
          level++;
        } else {
          break;
        }
        loopGuard++;
      }
      return {
        level,
        currentXp: xp,
        nextLevelXp: calculateNextLevelXp(level),
        totalFocusModes: prev.totalFocusModes + 1,
        title: getTitleForLevel(level)
      };
    });
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t: number) => {
          if (t <= 1) {
            setIsActive(false);
            const earned = 250; // Fixed 250 XP
            addXp(earned);
            // Alert wrapped in timeout to avoid render blocking
            setTimeout(() => alert(`Quest Complete! +${earned} XP`), 100);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const start = () => {
    if (timeLeft === 0) setTimeLeft(FOCUS_DURATION * 60);
    setIsActive(true);
  };
  const pause = () => setIsActive(false);
  const reset = () => { setIsActive(false); setTimeLeft(FOCUS_DURATION * 60); };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center text-center p-4 bg-slate-900 text-white font-sans selection:bg-yellow-400 selection:text-black">

      {/* HUD Panel */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="text-left bg-slate-800/80 backdrop-blur p-4 rounded-lg border border-white/10 pointer-events-auto shadow-lg">
          <h2 className="text-xl text-yellow-400 font-bold tracking-wider">{stats.title}</h2>
          <div className="text-sm text-gray-400 font-bold">Level {stats.level}</div>

          <div className="mt-2 w-48 h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
            <div
              className="h-full bg-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${Math.min((stats.currentXp / stats.nextLevelXp) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-right mt-1 text-gray-400 font-mono">
            {stats.currentXp} / {stats.nextLevelXp} XP
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="relative mb-12">
        <div className={`absolute -inset-10 bg-cyan-500/20 blur-3xl rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-20'}`}></div>

        <div className="relative z-10 text-9xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <div className="text-yellow-400 tracking-[0.5em] uppercase text-sm mt-4 font-bold opacity-80 animate-pulse">
          {isActive ? 'Focus Quest Active' : 'Ready for Adventure'}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 z-10">
        {!isActive ? (
          <button
            onClick={start}
            className="group relative px-8 py-4 bg-yellow-500 text-black font-bold text-lg rounded shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-105 transition-all"
          >
            ▶ Begin Quest
          </button>
        ) : (
          <div className="flex gap-4">
            <button onClick={pause} className="px-8 py-4 bg-slate-800 border border-white/20 hover:bg-white/10 text-white rounded font-bold text-lg transition-colors">
              ❚❚ Pause
            </button>

            <button onClick={reset} className="px-8 py-4 bg-red-900/80 hover:bg-red-800 text-red-100 rounded font-bold text-lg transition-colors">
              ↻ Abandon
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4 opacity-50 text-xs">
        <button onClick={() => addXp(100)}>[Debug: +100XP]</button>
      </div>

    </div>
  );
}

export default App;
