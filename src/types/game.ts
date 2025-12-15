export interface PlayerStats {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    totalFocusModes: number; // Completed Pomodoros
    title: string;
}

export interface QuestResult {
    completed: boolean;
    xpGained: number;
    message: string;
}

export const CLASSES = [
    { level: 1, title: 'Novice Wanderer' },
    { level: 5, title: 'Apprentice Focusing' },
    { level: 10, title: 'Quest Knight' },
    { level: 20, title: 'High Concentration Mage' },
    { level: 50, title: 'Grandmaster of Flow' }
];
