import type { UserProfile, TestResult } from '../types';

const STORAGE_KEY = 'psych_tests_profile';

export const StorageService = {
    getProfile(): UserProfile | null {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load profile', error);
            return null;
        }
    },

    saveProfile(profile: UserProfile): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } catch (error) {
            console.error('Failed to save profile', error);
        }
    },

    initProfile(): UserProfile {
        const existing = this.getProfile();
        if (existing) return existing;

        const newProfile: UserProfile = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            results: [],
            traits: {},
        };
        this.saveProfile(newProfile);
        return newProfile;
    },

    addResult(result: TestResult): UserProfile {
        const profile = this.initProfile();
        profile.results.push(result);
        // Note: Trait recalculation should happen in AnalyticsService and update the profile
        this.saveProfile(profile);
        return profile;
    },

    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
};
