'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePrefetch } from '@/hooks/usePrefetch';
import { useState, useEffect } from 'react';
import GlobalLoader from '@/components/Loader/GlobalLoader';

export default function ClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Initialize background prefetching
    usePrefetch();

    useEffect(() => {
        setMounted(true);
        // Artificial delay for premium feel, matching video-gallery
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Also trigger brief loader on pathname change (optional, for "super fast & smooth" feel)
    useEffect(() => {
        if (mounted) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 600);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    return (
        <>
            <GlobalLoader loading={loading} />
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: loading ? 0 : 1, y: loading ? 10 : 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="page-transition-wrapper"
                >
                    {!loading && children}
                </motion.div>
            </AnimatePresence>
        </>
    );
}
