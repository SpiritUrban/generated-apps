import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { AppLayout } from '../layout/AppLayout';

interface TestWrapperProps {
    title?: string;
    instruction: string;
    children: ReactNode;
    onComplete?: (data: any) => void;
    className?: string; // For custom layout if needed
}

export function TestWrapper({ title, instruction, children, className }: TestWrapperProps) {

    return (
        <AppLayout className="overflow-hidden bg-background">
            <div className={cn("relative w-full h-full flex flex-col", className)}>

                {/* Header / Instruction Area - Static flow (no overlap) */}
                <div className="flex-none pt-12 pb-4 px-6 text-center z-20 relative select-none">
                    {title && <h2 className="text-xl font-light tracking-widest text-muted-foreground mb-4 uppercase">{title}</h2>}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-3xl md:text-4xl font-light text-foreground leading-tight">
                            {instruction}
                        </p>
                        <p className="text-sm text-muted-foreground mt-4 opacity-70 animate-pulse">
                            ( Tap or click to select )
                        </p>
                    </motion.div>
                </div>

                {/* Test Content Area - Fills remaining space */}
                <div className="flex-1 relative z-10 flex items-center justify-center p-4 min-h-0">
                    <div className="w-full h-full flex items-center justify-center">
                        {children}
                    </div>
                </div>

                {/* Subtle grid or noise overlay if we want texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay z-0" />
            </div>
        </AppLayout>
    );
}
