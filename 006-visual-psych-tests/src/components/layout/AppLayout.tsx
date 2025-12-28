import { ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    className?: string;
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
    return (
        <div className={`min-h-screen w-full bg-background text-foreground flex flex-col overflow-hidden relative ${className}`}>
            {/* Decorative background elements could go here (e.g. subtle gradients) */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-accent/5 pointer-events-none" />

            <main className="flex-1 relative z-10 w-full h-full">
                {children}
            </main>
        </div>
    );
}
