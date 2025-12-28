import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestManager } from '../hooks/useTestManager';
import { CoordinateTest } from '../components/tests/CoordinateTest';
import { MovingObjectsTest } from '../components/tests/MovingObjectsTest';
import { ComfortZoneTest } from '../components/tests/ComfortZoneTest';
import { AppLayout } from '../components/layout/AppLayout';
import type { TestResult } from '../types';

export function TestRunner() {
    const navigate = useNavigate();
    const { saveResult } = useTestManager();
    const [currentTestIndex, setCurrentTestIndex] = useState(0);

    const tests = [
        {
            id: 'coord-1',
            type: 'coordinate',
            component: CoordinateTest,
            title: 'Orientation',
            instruction: 'Where do you feel most in control?',
            props: { axisX: ['Flow', 'Control'] as [string, string], axisY: ['Safety', 'Risk'] as [string, string] }
        },
        {
            id: 'moving-1',
            type: 'moving',
            component: MovingObjectsTest,
            title: 'Attention',
            instruction: 'Select the object that draws you.',
            props: {}
        },
        {
            id: 'comfort-1',
            type: 'comfort',
            component: ComfortZoneTest,
            title: 'Boundaries',
            instruction: 'Drag yourself to where you belong.',
            props: {}
        }
    ];

    const handleTestComplete = (result: TestResult) => {
        saveResult(result);

        if (currentTestIndex < tests.length - 1) {
            setCurrentTestIndex(prev => prev + 1);
        } else {
            navigate('/results');
        }
    };

    const CurrentTestComponent = tests[currentTestIndex].component;
    const currentTestDef = tests[currentTestIndex];

    return (
        <AppLayout>
            {/* Key forces remount/reset on test change */}
            <CurrentTestComponent
                key={currentTestDef.id}
                id={currentTestDef.id}
                title={currentTestDef.title}
                instruction={currentTestDef.instruction}
                onComplete={handleTestComplete}
                {...currentTestDef.props} // Pass specific props (axes, etc)
            />

            {/* Progress Indicator */}
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 pointer-events-none">
                {tests.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-500 ${idx === currentTestIndex ? 'w-8 bg-foreground' : 'w-2 bg-gray-300'}`}
                    />
                ))}
            </div>
        </AppLayout>
    );
}
