export type TestType = 'coordinate' | 'moving' | 'comfort';

export interface TestResult {
    testId: string;
    timestamp: number;
    data: Record<string, number | string>; // Flexible payload
    metrics: {
        [key: string]: number; // Normalized metrics (0-1)
    };
}

export interface UserProfile {
    id: string;
    createdAt: number;
    results: TestResult[];
    traits: Record<string, number>; // Aggregated traits (0-1)
}

export interface TestDefinition {
    id: string;
    type: TestType;
    title: string;
    description: string;
    duration?: number;
}
