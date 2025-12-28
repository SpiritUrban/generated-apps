import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TestWrapper } from './TestWrapper';
import type { TestResult } from '../../types';

interface CoordinateTestProps {
    id: string;
    title: string;
    instruction: string;
    axisX: [string, string]; // e.g. ["Control", "Freedom"]
    axisY: [string, string]; // e.g. ["Safety", "Risk"]
    onComplete: (result: TestResult) => void;
}

export function CoordinateTest({ id, title, instruction, axisX, axisY, onComplete }: CoordinateTestProps) {
    const [clicked, setClicked] = useState(false);
    const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
    const startTime = useRef(Date.now());

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log('CoordinateTest Clicked', { x: e.clientX, y: e.clientY });
        if (clicked) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalize to -1..1 range (center is 0,0)
        // x: 0 -> -1, width -> 1
        const normX = ((x / rect.width) * 2) - 1;
        // y: 0 -> -1, height -> 1 (assuming Cartesian, but screen Y is down. Let's invert Y so Up is +1)
        const normY = -(((y / rect.height) * 2) - 1);

        setClickPos({ x, y });
        setClicked(true);

        const reactionTime = Date.now() - startTime.current;

        // Wait a moment for visual feedback then complete
        setTimeout(() => {
            onComplete({
                testId: id,
                timestamp: Date.now(),
                data: { x: normX, y: normY, reactionTime },
                metrics: {
                    x: normX, // Directly map to X axis trait
                    y: normY, // Directly map to Y axis trait
                    speed: reactionTime < 1000 ? 1 : Math.max(0, 1 - (reactionTime / 5000)) // 1 = instant, 0 = >5s
                }
            });
        }, 1500);
    };

    return (
        <TestWrapper title={title} instruction={instruction}>
            <div
                className="relative w-full max-w-[85vmin] aspect-square mx-auto cursor-crosshair active:cursor-grabbing bg-card/30 border-2 border-dashed border-muted rounded-xl shadow-sm transition-colors hover:bg-card/50 touch-none"
                onClick={handleClick}
            >
                {/* Visual Feedback for Hover (Crosshair) - Optional */}

                {/* Axes visualization */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                    {/* X Axis */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground to-transparent" />
                    {/* Y Axis */}
                    <div className="h-full w-px bg-gradient-to-b from-transparent via-foreground to-transparent absolute" />
                    {/* Center Point */}
                    <div className="w-3 h-3 rounded-full bg-foreground/20 absolute backdrop-blur-sm" />
                </div>

                {/* Axis Labels - Added for clarity */}
                <div className="absolute inset-x-0 top-4 text-center text-xs tracking-widest uppercase text-muted-foreground opacity-50 pointer-events-none">
                    {axisY[0]}
                </div>
                <div className="absolute inset-x-0 bottom-4 text-center text-xs tracking-widest uppercase text-muted-foreground opacity-50 pointer-events-none">
                    {axisY[1]}
                </div>
                <div className="absolute inset-y-0 left-4 flex items-center text-xs tracking-widest uppercase text-muted-foreground opacity-50 pointer-events-none [writing-mode:vertical-rl] rotate-180">
                    {axisX[0]}
                </div>
                <div className="absolute inset-y-0 right-4 flex items-center text-xs tracking-widest uppercase text-muted-foreground opacity-50 pointer-events-none [writing-mode:vertical-rl] rotate-180">
                    {axisX[1]}
                </div>

                {/* Labels - optional, maybe too explicit? 
            Request said "No explicit psychology", but questions like "Where is safe?" implies axes.
            Let's keep labels HIDDEN or very subtle/abstract.
            The user prompt examples: "Where is it safer?" -> implies spatial mapping.
            We won't label the axes explicitly to avoid bias, purely use the prompt.
        */}

                {/* Click feedback */}
                {clicked && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border border-foreground shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                        style={{ left: clickPos.x, top: clickPos.y }}
                    >
                        <motion.div
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 4, opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 rounded-full bg-accent"
                        />
                    </motion.div>
                )}
            </div>
        </TestWrapper>
    );
}
