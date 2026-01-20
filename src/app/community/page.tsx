'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import '../demo-styles.css';

// Original imports (kept for reference)
import Navbar from '../../components/Navbar/Navbar';
import './Community.css';

// Types (Hidden)
interface StudyGroup {
  id: string;
  name: string;
  category: string;
  description: string;
  members: number;
  languages: string[];
  level: string;
  schedule: string;
  isFeatured: boolean;
  isJoined: boolean;
}

// ... other types ...

// Hidden original component
function HiddenCommunityPage() {
  // Original logic would go here
  return null;
}

export default function CommunityPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="demo-page flex flex-col min-h-screen overflow-hidden relative font-sans !bg-[#001822]">
      {/* ===== ANIMATED BACKGROUND IDENTICAL TO HOME ===== */}
      <div className="particles-bg">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`particle p${i % 5}`} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 20}s`
          }} />
        ))}
      </div>

      {/* Hero Parallax Orbs */}
      <div className="hero-orb orb-1" style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`, top: '20%', left: '20%' }} />
      <div className="hero-orb orb-2" style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`, bottom: '20%', right: '20%' }} />

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto space-y-16"
        >
          {/* Glass Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-5 px-10 py-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl mb-14 group hover:bg-white/10 transition-colors cursor-default"
          >
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81b532] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-[#81b532]"></span>
            </span>
            <span className="text-5xl md:text-8xl font-bold tracking-[0.2em] text-[#81b532] uppercase drop-shadow-2xl">Coming Soon</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="hero-title-main text-6xl md:text-8xl font-black tracking-tight leading-tight">
            <span className="block text-white mb-2 drop-shadow-lg">Community</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81b532] via-[#a3cf5b] to-emerald-400 drop-shadow-2xl">
              Reimagined.
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Connect with passionate learners, engage in <span className="text-white font-medium">meaningful discussions</span>, <br className="hidden md:block" />
            and grow together in your Quranic journey with a global brotherhood.
          </motion.p>

          {/* Connected Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="pt-32 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/learn-quran">
              <button className="btn-explore-platform magnetic-btn px-10 py-5 text-lg shadow-[0_0_40px_rgba(129,181,50,0.4)] hover:shadow-[0_0_60px_rgba(129,181,50,0.6)]">
                Start Learning Now
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}