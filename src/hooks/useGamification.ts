import { useState, useEffect } from 'react';
import { PlayerStats, CLASSES } from '../types/game';
import { checkLevelUp, calculateNextLevelXp, getTitleForLevel } from '../utils/gameLogic';

const STORAGE_KEY = 'pomodoro-quest-v1';

const INITIAL_STATS: PlayerStats = {
    level: 1,
    currentXp: 0,
    nextLevelXp: calculateNextLevelXp(1),
    totalFocusModes: 0,
    title: CLASSES[0].title
};

export const useGamification = () => {
    const [stats, setStats] = useState<PlayerStats>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic validation schema check
                if (typeof parsed.level === 'number' && typeof parsed.currentXp === 'number') {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse stats:', e);
        }
        return INITIAL_STATS;
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        } catch (e) {
            console.error('Failed to save stats:', e);
        }
    }, [stats]);

    const addXp = (amount: number) => {
        setStats(prev => {
            // Re-calculate based on safe logic
            let currentXp = prev.currentXp + amount;

            const { newLevel, leveledUp } = checkLevelUp(currentXp, prev.level);

            // Calculate remaining XP for next level logic needs to align with checkLevelUp
            // checkLevelUp returns newLevel, but doesn't return the remaining XP!
            // My util logic subtracts XP from local 'xp' var but doesn't return it.
            // I need to replicate the subtraction logic here or return it from util.

            // Let's rely on the util's logic but we need the 'remaining' XP.
            // I'll update checkLevelUp to return remaining XP or handle it here responsibly.

            // Simple loop here again to be sure:
            let tempXp = currentXp;
            let tempLevel = prev.level;

            while (true) {
                const required = calculateNextLevelXp(tempLevel);
                if (tempXp >= required) {
                    tempXp -= required;
                    tempLevel++;
                } else {
                    break;
                }
            }

            return {
                level: tempLevel,
                currentXp: tempXp,
                nextLevelXp: calculateNextLevelXp(tempLevel),
                totalFocusModes: prev.totalFocusModes + 1,
                title: getTitleForLevel(tempLevel)
            };
        });
    };

    return { stats, addXp };
};
