import { CLASSES, PlayerStats } from '../types/game';

const BASE_XP = 100;
const XP_MULTIPLIER = 1.5;

export const calculateNextLevelXp = (level: number) => {
    return Math.floor(BASE_XP * Math.pow(level, XP_MULTIPLIER));
};

export const getTitleForLevel = (level: number): string => {
    const reversedClasses = [...CLASSES].reverse();
    const matchedClass = reversedClasses.find(c => level >= c.level);
    return matchedClass ? matchedClass.title : CLASSES[0].title;
};

export const calculateXpGain = (durationMinutes: number): number => {
    return Math.floor(durationMinutes * 10);
};

export const checkLevelUp = (currentXp: number, currentLevel: number): { newLevel: number, leveledUp: boolean } => {
    // Safety: Prevent infinite loops if logic is flawed or XP is NaN
    if (currentXp < 0 || isNaN(currentXp) || currentLevel < 1) {
        return { newLevel: currentLevel, leveledUp: false };
    }

    let xp = currentXp;
    let level = currentLevel;
    const originalLevel = currentLevel;
    let leveledUp = false;
    let safetyCounter = 0;

    while (safetyCounter < 100) { // Max 100 levels at once to prevent hanging
        const required = calculateNextLevelXp(level);
        if (xp >= required) {
            xp -= required;
            level++;
            leveledUp = true;
        } else {
            break;
        }
        safetyCounter++;
    }

    return { newLevel: level, leveledUp };
};
