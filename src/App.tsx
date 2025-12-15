import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { calculateXpGain, calculateNextLevelXp, getTitleForLevel } from './utils/gameLogic';

const STORAGE_KEY = 'pomodoro-quest-v1';
const FOCUS_DURATION = 25;

function App() {
  // --- Timer Logic ---
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION * 60);
  const [isActive, setIsActive] = useState(false);

  // --- Gamification Logic ---
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

  const addXp = (amount) => {
    setStats(prev => {
      let xp = prev.currentXp + amount;
      let level = prev.level;

      // Level Up Logic
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

  // --- Timer Effect ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false);
            const earned = calculateXpGain(FOCUS_DURATION);
            addXp(earned);
            // We need to use setTimeout to allow render to finish before alert
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

      {/* HUD: Stats */}
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

      {/* Timer Display */}
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
            <span className="flex items-center gap-2">
              <Play size={24} fill="currentColor" /> Begin Quest
            </span>
          </button>
        ) : (
          <div className="flex gap-4">
            <button onClick={pause} className="px-8 py-4 bg-slate-800 border border-white/20 hover:bg-white/10 text-white rounded font-bold text-lg transition-colors flex items-center gap-2">
              <Pause size={24} fill="currentColor" /> Pause
            </button>

            <button onClick={reset} className="px-8 py-4 bg-red-900/80 hover:bg-red-800 text-red-100 rounded font-bold text-lg transition-colors flex items-center gap-2">
              <RotateCcw size={24} /> Abandon
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
