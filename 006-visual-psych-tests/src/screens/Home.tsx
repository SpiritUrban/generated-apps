import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

export function Home() {
    const navigate = useNavigate();

    return (
        <AppLayout className="flex flex-col items-center justify-center text-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="max-w-xl"
            >
                <h1 className="text-4xl md:text-6xl font-light mb-8 tracking-tighter">
                    Mental <span className="font-semibold text-primary/80">Topography</span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground font-light mb-12 leading-relaxed">
                    A non-verbal exploration of your psychological landscape.
                    <br />
                    No questions. Just interaction.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/test')}
                    className="group relative px-12 py-4 bg-foreground text-background text-lg font-medium rounded-full overflow-hidden transition-all shadow-xl hover:shadow-2xl"
                >
                    <span className="relative z-10">Begin Exploration</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>

                <div className="mt-16 opacity-50 text-sm">
                    <p>Please use a mouse or trackpad for best experience.</p>
                </div>
            </motion.div>
        </AppLayout>
    );
}
