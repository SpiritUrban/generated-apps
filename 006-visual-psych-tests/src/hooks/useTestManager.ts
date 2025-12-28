import { useState, useCallback } from 'react';
import { StorageService } from '../services/storage';
import type { TestResult, UserProfile } from '../types';

export function useTestManager() {
    const [profile, setProfile] = useState<UserProfile>(() => StorageService.initProfile());
    const [activeTestId, setActiveTestId] = useState<string | null>(null);

    const saveResult = useCallback((result: TestResult) => {
        const updatedProfile = StorageService.addResult(result);
        setProfile(updatedProfile);
    }, []);

    const clearProgress = useCallback(() => {
        StorageService.clear();
        setProfile(StorageService.initProfile());
    }, []);

    return {
        profile,
        activeTestId,
        setActiveTestId,
        saveResult,
        clearProgress
    };
}
