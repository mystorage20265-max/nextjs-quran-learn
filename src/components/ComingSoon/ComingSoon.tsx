'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import './ComingSoon.css';

interface ComingSoonProps {
    title?: string;
    subtitle?: string;
    primaryLink?: string;
    primaryLinkText?: string;
}

export default function ComingSoon({
    title = "Coming Soon",
    subtitle = "We're preparing something amazing for you",
    primaryLink = "/",
    primaryLinkText = "Back to Home"
}: ComingSoonProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress bar from 0 to 65%
        const timer = setTimeout(() => {
            setProgress(65);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="eclipse-coming-soon">
            {/* Starfield Background */}
            <div className="starfield">
                {[...Array(100)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 2 + 1}px`,
                            height: `${Math.random() * 2 + 1}px`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${Math.random() * 2 + 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="eclipse-content">
                {/* Eclipse Circle */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="eclipse-container"
                >
                    {/* Rotating Corona Glow */}
                    <div className="corona-glow" />
                    <div className="corona-glow corona-glow-2" />

                    {/* Eclipse Core */}
                    <div className="eclipse-core" />

                    {/* Light Flares */}
                    <div className="light-flare flare-1" />
                    <div className="light-flare flare-2" />
                </motion.div>

                {/* Coming Soon Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="coming-soon-text"
                >
                    <h1>COMING SOON</h1>

                    {/* Progress Bar */}
                    <div className="progress-container">
                        <motion.div
                            className="progress-bar"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: 1.2, duration: 2, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>

                {/* Title */}
                {title && (
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3, duration: 1 }}
                        className="eclipse-title"
                    >
                        {title}
                    </motion.h2>
                )}

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="eclipse-subtitle"
                >
                    {subtitle}
                </motion.p>

                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="eclipse-footer"
                >
                    <Link href={primaryLink} className="back-link">
                        ← {primaryLinkText}
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
