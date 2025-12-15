import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialMinutes: number, onComplete: () => void) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    // Track if manually paused vs just not started
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        let intervalId: any;

        if (isActive && timeLeft > 0) {
            intervalId = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalId);
                        // Defer callback to avoid update during render if that was issue?
                        // No, setter is safe.
                        // But we should handle completion effect separately?
                        // Let's just return 0 here and handle completion in another effect?
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [isActive]); // Removed timeLeft from dependency to avoid frequent effect Re-run? 
    // No, if isActive is true, interval runs. Inside interval, state setter uses function update. 
    // This is efficient.

    // Separate effect for completion
    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            setIsActive(false);
            onComplete();
        }
    }, [timeLeft, isActive, onComplete]);

    const start = useCallback(() => {
        // Only reset time if we are at 0 or starting fresh?
        // User wants "Resume" if paused.
        if (timeLeft === 0) {
            setTimeLeft(initialMinutes * 60);
        }
        setIsActive(true);
        setHasStarted(true);
    }, [timeLeft, initialMinutes]);

    const pause = useCallback(() => {
        setIsActive(false);
    }, []);

    const reset = useCallback(() => {
        setIsActive(false);
        setHasStarted(false);
        setTimeLeft(initialMinutes * 60);
    }, [initialMinutes]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const isPaused = hasStarted && !isActive && timeLeft > 0;
    // Progress 0 to 1
    const progress = 1 - (timeLeft / (initialMinutes * 60));

    return { minutes, seconds, isActive, isPaused, start, pause, reset, progress };
};
