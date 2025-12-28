import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { TestWrapper } from './TestWrapper';
import type { TestResult } from '../../types';

interface MovingObjectsTestProps {
    id: string;
    title: string;
    instruction: string;
    onComplete: (result: TestResult) => void;
}

interface ObjectVariant {
    id: string;
    speed: number;   // 0-1
    size: number;    // 0-1
    chaos: number;   // 0-1 (predictability)
    color: string;
}

export function MovingObjectsTest({ id, title, instruction, onComplete }: MovingObjectsTestProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const startTime = useRef(Date.now());

    // Generate distinct objects
    // 1. Slow, large, predictable (Comfort/Safety)
    // 2. Fast, small, erratic (Stimulation/Risk)
    // 3. Medium, medium, circular (Balance)
    // 4. Slow, small, wandering (Exploration)
    const variants: ObjectVariant[] = [
        { id: 'safety', speed: 0.2, size: 0.8, chaos: 0.1, color: 'bg-blue-300' },
        { id: 'stimulation', speed: 0.9, size: 0.4, chaos: 0.9, color: 'bg-red-300' },
        { id: 'balance', speed: 0.5, size: 0.6, chaos: 0.3, color: 'bg-purple-300' },
        { id: 'exploration', speed: 0.3, size: 0.3, chaos: 0.6, color: 'bg-green-300' },
    ];

    const handleSelect = (variant: ObjectVariant) => {
        if (selected) return;
        setSelected(variant.id);
        const reactionTime = Date.now() - startTime.current;

        setTimeout(() => {
            onComplete({
                testId: id,
                timestamp: Date.now(),
                data: { choice: variant.id, reactionTime },
                metrics: {
                    sensationSeeking: variant.speed,
                    stabilityNeed: variant.size, // large objects = stable?
                    predictabilityNeed: 1 - variant.chaos
                }
            });
        }, 1000);
    };

    // Helper to generate keyframes based on chaos
    const generatePath = (chaos: number) => {
        // Return array of x/y values 0-100%
        const points = [];
        const numPoints = 10 + Math.floor(chaos * 10);
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: Math.random() * 80 + 10 + "%", // keep within bounds
                y: Math.random() * 80 + 10 + "%"
            });
        }
        return points;
    };

    return (
        <TestWrapper title={title} instruction={instruction}>
            <div className="relative w-full h-full">
                {variants.map((v) => (
                    <FloatingObject
                        key={v.id}
                        variant={v}
                        onSelect={() => handleSelect(v)}
                        isSelected={selected === v.id}
                        isOtherSelected={selected !== null && selected !== v.id}
                    />
                ))}
            </div>
        </TestWrapper>
    );
}

function FloatingObject({ variant, onSelect, isSelected, isOtherSelected }: {
    variant: ObjectVariant,
    onSelect: () => void,
    isSelected: boolean,
    isOtherSelected: boolean
}) {
    // Use simple CSS animation or framer motion keyframes?
    // Framer motion is smoother for complex paths.

    return (
        <motion.div
            className={`absolute rounded-full cursor-pointer shadow-lg backdrop-blur-sm ${variant.color} bg-opacity-80`}
            style={{
                width: 60 + (variant.size * 60),
                height: 60 + (variant.size * 60),
            }}
            animate={
                isSelected ? { scale: 1.5, zIndex: 50, x: '50vw', y: '50vh', left: '-50%', top: '-50%' } :
                    isOtherSelected ? { opacity: 0, scale: 0 } :
                        {
                            x: [0, Math.random() * window.innerWidth * 0.5, 0], // Simplified for now, real implementation needs better pathing
                            y: [0, Math.random() * window.innerHeight * 0.5, 0],
                        }
            }
            transition={
                isSelected ? { duration: 0.8 } :
                    isOtherSelected ? { duration: 0.5 } :
                        {
                            duration: 10 + (1 - variant.speed) * 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }
            }
            onClick={onSelect}
            whileHover={{ scale: 1.1 }}
        />
    );
}
