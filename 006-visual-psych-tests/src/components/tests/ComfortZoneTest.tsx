import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { TestWrapper } from './TestWrapper';
import type { TestResult } from '../../types';

interface ComfortZoneTestProps {
    id: string;
    title: string;
    instruction: string;
    onComplete: (result: TestResult) => void;
}

export function ComfortZoneTest({ id, title, instruction, onComplete }: ComfortZoneTestProps) {
    const [completed, setCompleted] = useState(false);
    const startTime = useRef(Date.now());
    const dragStartTime = useRef<number>(0);
    const totalDragTime = useRef<number>(0);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Track "hesitation" or movement jitter? 
    // Maybe just track where they stop. Center = Balance, Edges = Seeking Boundaries?

    const onDragStart = () => {
        dragStartTime.current = Date.now();
    };

    const onDragEnd = () => {
        const dragDuration = Date.now() - dragStartTime.current;
        totalDragTime.current += dragDuration;

        // Check if user dropped it (mouse up)
        // We can show a confirm button OR just take the drop position after a pause?
        // Let's use a "Hold to confirm" or just a button appearing.
    };

    const handleConfirm = () => {
        if (completed) return;
        setCompleted(true);

        // Get final Position relative to center
        // Framer motion values are pixels from center (limited by constraints)
        const finalX = x.get();
        const finalY = y.get();

        // Normalize
        const winW = window.innerWidth / 2;
        const winH = window.innerHeight / 2;

        const normX = finalX / winW; // -1 to 1 approx
        const normY = finalY / winH;

        const reactionTime = Date.now() - startTime.current;

        setTimeout(() => {
            onComplete({
                testId: id,
                timestamp: Date.now(),
                data: { x: normX, y: normY, dragTime: totalDragTime.current },
                metrics: {
                    centrality: 1 - Math.sqrt(normX * normX + normY * normY), // 1 = center, 0 = edge
                    decisiveness: totalDragTime.current < 2000 ? 1 : 0.5 // faster drag = more decisive
                }
            });
        }, 1000);
    };

    return (
        <TestWrapper title={title} instruction={instruction}>
            <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Visual zones - Subtle concentric rings */}
                    <div className="w-[80vw] h-[80vw] md:w-[60vh] md:h-[60vh] rounded-full border-2 border-dashed border-muted/50 bg-card/30" />
                    <div className="w-[50vw] h-[50vw] md:w-[40vh] md:h-[40vh] rounded-full border-2 border-dashed border-muted/50 absolute" />
                </div>

                <motion.div
                    drag
                    dragConstraints={{ left: -window.innerWidth / 2 + 50, right: window.innerWidth / 2 - 50, top: -window.innerHeight / 2 + 50, bottom: window.innerHeight / 2 - 50 }}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    style={{ x, y }}
                    whileDrag={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-foreground shadow-2xl cursor-grab active:cursor-grabbing z-20"
                />

                {/* Floating Confirm Button (appears after interaction) */}
                <div className="absolute bottom-12 z-30">
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-4 bg-foreground text-background shadow-xl rounded-full font-medium tracking-wider hover:scale-105 active:scale-95 transition-all text-sm uppercase"
                    >
                        Confirm Position
                    </button>
                </div>
            </div>
        </TestWrapper>
    );
}
