import type { TestResult } from '../types';

interface TraitDefinition {
    id: string;
    name: string;
    lowLabel: string;
    highLabel: string;
}

export const TRAITS: Record<string, TraitDefinition> = {
    control: { id: 'control', name: 'Need for Control', lowLabel: 'Flow-oriented', highLabel: 'Control-oriented' },
    risk: { id: 'risk', name: 'Risk Tolerance', lowLabel: 'Safety-seeking', highLabel: 'Risk-taking' },
    tempo: { id: 'tempo', name: 'Internal Tempo', lowLabel: 'Contemplative', highLabel: 'Reactive' },
    stability: { id: 'stability', name: 'Need for Stability', lowLabel: 'Exploratory', highLabel: 'Grounded' }
};

export const AnalyticsService = {
    analyzeProfile(results: TestResult[]): Record<string, number> {
        const traits: Record<string, number> = {
            control: 0.5,
            risk: 0.5,
            tempo: 0.5,
            stability: 0.5
        };

        if (results.length === 0) return traits;

        const counts: Record<string, number> = { control: 0, risk: 0, tempo: 0, stability: 0 };

        results.forEach(r => {
            // Metric mapping logic
            // Note: metrics in results are 0..1 or -1..1 depending on test. 
            // We should normalize everything to 0...1 for the final trait score.

            // 1. Coordinate Test
            if (r.data.x !== undefined && r.data.y !== undefined) {
                // data.x (Control/Freedom). Let's say +1 is Control, -1 is Freedom? 
                // Actually in CoordinateTest we mapped X/Y directly. 
                // Let's assume the test normalized them -1..1.
                // Trait = (Value + 1) / 2
                const valX = Number(r.data.x);
                const valY = Number(r.data.y);

                // Accumulate
                traits.control += (valX + 1) / 2; counts.control++;
                traits.risk += (valY + 1) / 2; counts.risk++;

                // Speed -> Tempo
                const speed = r.metrics?.speed || 0.5;
                traits.tempo += speed; counts.tempo++;
            }

            // 2. Moving Objects
            if (r.metrics?.sensationSeeking !== undefined) {
                traits.risk += r.metrics.sensationSeeking; counts.risk++;
                traits.stability += (r.metrics.stabilityNeed || 0.5); counts.stability++;
            }

            // 3. Comfort Zone
            if (r.metrics?.centrality !== undefined) {
                traits.stability += r.metrics.centrality; counts.stability++;
                traits.tempo += (r.metrics.decisiveness || 0.5); counts.tempo++;
            }
        });

        // Average out
        Object.keys(traits).forEach(key => {
            if (counts[key] > 0) {
                // Base value 0.5 counts as 1 weight? No, let's just average the accumulated raw values
                // We added to 0.5 initially. Let's subtract that and do proper average.
                // Actually, simpler:
                // trait[k] = sum / count
                // My previous logic was : start at 0.5, add value. That's wrong.

                // Re-calculate simplistic average:
                // (We can't easily retroactively fix the sum without knowing the specific contributions, 
                //  but for this MVP let's just pretend we started at 0 and added.)
                // Refactoring loop logic:
            }
        });

        // Correct loop:
        const finalTraits: Record<string, number> = { control: 0, risk: 0, tempo: 0, stability: 0 };
        const finalCounts: Record<string, number> = { control: 0, risk: 0, tempo: 0, stability: 0 };

        results.forEach(r => {
            if (r.data.x !== undefined && r.data.y !== undefined) {
                finalTraits.control += (Number(r.data.x) + 1) / 2; finalCounts.control++;
                finalTraits.risk += (Number(r.data.y) + 1) / 2; finalCounts.risk++;
                finalTraits.tempo += (r.metrics?.speed || 0.5); finalCounts.tempo++;
            }
            if (r.metrics?.sensationSeeking !== undefined) {
                finalTraits.risk += r.metrics.sensationSeeking; finalCounts.risk++;
                finalTraits.stability += (r.metrics?.stabilityNeed || 0.5); finalCounts.stability++;
            }
            if (r.metrics?.centrality !== undefined) {
                finalTraits.stability += r.metrics.centrality; finalCounts.stability++;
                finalTraits.tempo += (r.metrics?.decisiveness || 0.5); finalCounts.tempo++;
            }
        });

        Object.keys(finalTraits).forEach(k => {
            if (finalCounts[k] > 0) {
                finalTraits[k] = finalTraits[k] / finalCounts[k];
            } else {
                finalTraits[k] = 0.5; // Default neutral
            }
        });

        return finalTraits;
    },

    getProfileDescription(traits: Record<string, number>): { title: string, description: string, keywords: string[] } {
        // Generate a "Horoscope" style reading based on dominant traits
        const dominant = Object.entries(traits).reduce((a, b) => Math.abs(b[1] - 0.5) > Math.abs(a[1] - 0.5) ? b : a);

        const traitKey = dominant[0];
        const value = dominant[1]; // 0..1
        const definition = TRAITS[traitKey];
        const isHigh = value > 0.5;

        const title = isHigh ? definition.highLabel : definition.lowLabel;

        // Simple dynamic description
        let description = `Your interaction patterns suggest a tendency towards ${title.toLowerCase()}. `;
        description += `You balance this with a score of ${(traits.risk * 100).toFixed(0)}% in risk tolerance.`;

        return {
            title,
            description,
            keywords: [definition.lowLabel, definition.highLabel] // Placeholder
        };
    }
};
