import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { useTestManager } from '../hooks/useTestManager';
import { AnalyticsService } from '../services/analytics';

export function Results() {
    const navigate = useNavigate();
    const { profile, clearProgress } = useTestManager();

    const traits = useMemo(() => {
        return AnalyticsService.analyzeProfile(profile.results);
    }, [profile.results]);

    const { title, description, keywords } = useMemo(() => {
        return AnalyticsService.getProfileDescription(traits);
    }, [traits]);

    const handleRetake = () => {
        clearProgress();
        navigate('/');
    };

    // Simple Radar Chart using SVG
    // 4 Axes: Top (Control), Right (Risk), Bottom (Stability? or inverted Control?), Left (Tempo)
    // Let's map: 
    // Top: Control (0-1)
    // Right: Risk (0-1)
    // Bottom: Stability (0-1)
    // Left: Tempo (0-1)

    const size = 300;
    const center = size / 2;
    const scale = (size / 2) - 40; // padding

    const getPoint = (value: number, angleDeg: number) => {
        const angleRad = (angleDeg - 90) * (Math.PI / 180);
        return {
            x: center + (Math.cos(angleRad) * value * scale),
            y: center + (Math.sin(angleRad) * value * scale)
        };
    };

    const pControl = getPoint(traits.control, 0);
    const pRisk = getPoint(traits.risk, 90);
    const pStability = getPoint(traits.stability, 180);
    const pTempo = getPoint(traits.tempo, 270);

    const polyPoints = `${pControl.x},${pControl.y} ${pRisk.x},${pRisk.y} ${pStability.x},${pStability.y} ${pTempo.x},${pTempo.y}`;

    return (
        <AppLayout className="flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">

                {/* Visual Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative">
                        <svg width={size} height={size} className="overflow-visible">
                            {/* Axes */}
                            <line x1={center} y1={20} x2={center} y2={size - 20} stroke="#e5e7eb" strokeWidth="1" />
                            <line x1={20} y1={center} x2={size - 20} y2={center} stroke="#e5e7eb" strokeWidth="1" />

                            {/* Background Shape */}
                            <polygon points={getInputPoints(center, scale, 0.5)} fill="none" stroke="#e5e7eb" strokeDasharray="4 4" />
                            <polygon points={getInputPoints(center, scale, 1)} fill="none" stroke="#e5e7eb" />

                            {/* Data Shape */}
                            <motion.polygon
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 0.8, pathLength: 1 }}
                                points={polyPoints}
                                fill="rgba(var(--primary), 0.1)"
                                stroke="rgba(var(--primary), 1)"
                                strokeWidth="2"
                            />

                            {/* Labels */}
                            <text x={center} y={15} textAnchor="middle" className="text-xs uppercase tracking-widest fill-muted-foreground">Control</text>
                            <text x={size - 10} y={center} textAnchor="start" className="text-xs uppercase tracking-widest fill-muted-foreground">Risk</text>
                            <text x={center} y={size - 5} textAnchor="middle" className="text-xs uppercase tracking-widest fill-muted-foreground">Stability</text>
                            <text x={10} y={center} textAnchor="end" className="text-xs uppercase tracking-widest fill-muted-foreground">Tempo</text>
                        </svg>
                    </div>
                </motion.div>

                {/* Text Report */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="space-y-6"
                >
                    <div>
                        <h2 className="text-3xl font-light mb-2">{title}</h2>
                        <div className="flex gap-2 mb-4">
                            {keywords.map(k => (
                                <span key={k} className="px-3 py-1 bg-muted rounded-full text-xs uppercase tracking-wider">{k}</span>
                            ))}
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                        <button
                            onClick={handleRetake}
                            className="text-sm uppercase tracking-widest hover:underline"
                        >
                            Restart Analysis
                        </button>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}

function getInputPoints(center: number, scale: number, val: number) {
    const p1 = { x: center, y: center - (scale * val) };
    const p2 = { x: center + (scale * val), y: center };
    const p3 = { x: center, y: center + (scale * val) };
    const p4 = { x: center - (scale * val), y: center };
    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;
}
