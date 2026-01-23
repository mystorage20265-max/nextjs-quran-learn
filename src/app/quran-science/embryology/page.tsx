'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Microscope,
    Clock,
    ChevronDown,
    Sparkles
} from 'lucide-react';
import './embryology.css';

// Stage data with scientific and Quranic information
const stages = [
    {
        id: 1,
        number: 'Stage 01',
        arabic: 'نُطْفَة',
        transliteration: 'Nutfah',
        translation: 'The Drop',
        weeks: '1-2 weeks',
        verse: 'Then We placed him as a sperm-drop (nutfah) in a place of rest, firmly fixed.',
        reference: 'Surah Al-Mu\'minun (23:13)',
        science: 'The journey begins with fertilization when sperm meets egg, forming a single cell called a zygote. This "drop" then travels to implant in the uterine wall, beginning the miraculous process of human development.',
        miracle: 'The Quran described the beginning of life as a "drop" 1,400 years before microscopes revealed the tiny nature of fertilization.',
        color: 'from-blue-500/20 to-cyan-500/20',
        icon: '💧'
    },
    {
        id: 2,
        number: 'Stage 02',
        arabic: 'عَلَقَة',
        transliteration: 'Alaqah',
        translation: 'The Clinging Clot',
        weeks: '2-3 weeks',
        verse: 'Then We made the sperm-drop into an alaqah (clinging clot).',
        reference: 'Surah Al-Mu\'minun (23:14)',
        science: 'The embryo attaches to the uterine wall through implantation. It literally "clings" to the mother. The word "alaqah" also means "blood clot" - the embryo at this stage appears reddish and suspended in blood.',
        miracle: 'The Arabic word "alaqah" has three meanings: to cling, a blood clot, and a leech-like shape - all perfectly describing this stage.',
        color: 'from-red-500/20 to-rose-500/20',
        icon: '🔴'
    },
    {
        id: 3,
        number: 'Stage 03',
        arabic: 'مُضْغَة',
        transliteration: 'Mudghah',
        translation: 'The Chewed Substance',
        weeks: '3-4 weeks',
        verse: 'Then We made the clinging clot into a mudghah (chewed lump of flesh).',
        reference: 'Surah Al-Mu\'minun (23:14)',
        science: 'Somites (the precursors of vertebrae) begin to appear in pairs along the embryo. These somites look remarkably like teeth marks on chewed gum, giving the embryo a segmented appearance.',
        miracle: 'The Quran\'s description of "chewed substance" matches the visual appearance of the somite stage, discovered only recently with modern embryology.',
        color: 'from-purple-500/20 to-pink-500/20',
        icon: '🟣'
    },
    {
        id: 4,
        number: 'Stage 04',
        arabic: 'عِظَام',
        transliteration: 'Idhaam',
        translation: 'The Bones',
        weeks: '5-6 weeks',
        verse: 'Then We made out of the chewed lump, bones.',
        reference: 'Surah Al-Mu\'minun (23:14)',
        science: 'The cartilaginous skeleton begins to form and gradually ossifies (hardens into bone). The skeletal framework provides structure for the developing embryo.',
        miracle: 'The Quran correctly identifies bone formation as a distinct stage, contradicting earlier beliefs that bones and flesh form simultaneously.',
        color: 'from-amber-500/20 to-yellow-500/20',
        icon: '🦴'
    },
    {
        id: 5,
        number: 'Stage 05',
        arabic: 'لَحْم',
        transliteration: 'Lahm',
        translation: 'The Flesh',
        weeks: '7-8 weeks',
        verse: 'And clothed the bones with flesh (muscle).',
        reference: 'Surah Al-Mu\'minun (23:14)',
        science: 'Muscles develop around the skeletal framework. The limbs become distinct and the embryo begins to take recognizable human form.',
        miracle: 'Modern embryology confirms bones form first, then muscles wrap around them - exactly as the Quran states, in that specific order.',
        color: 'from-orange-500/20 to-red-500/20',
        icon: '💪'
    },
    {
        id: 6,
        number: 'Stage 06',
        arabic: 'خَلْقًا آخَر',
        transliteration: 'Khalqan Aakhar',
        translation: 'Another Creation',
        weeks: '9+ weeks',
        verse: 'Then We developed out of it another creature. So blessed is Allah, the Best of Creators!',
        reference: 'Surah Al-Mu\'minun (23:14)',
        science: 'The fetus is now recognizably human with all major organs in place. Development continues as features refine and the baby grows toward birth.',
        miracle: 'The transformation into "another creation" marks the point where the developing fetus becomes distinctly human - a moment of profound change.',
        color: 'from-emerald-500/20 to-teal-500/20',
        icon: '👶'
    }
];

export default function EmbryologyPage() {
    const [activeStage, setActiveStage] = useState(0);
    const [comparisonMode, setComparisonMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    // Calculate progress percentage
    const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);

    // Track active stage based on scroll
    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            const stageIndex = Math.floor(latest * stages.length);
            setActiveStage(Math.min(stageIndex, stages.length - 1));
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <div className="embryology-page" ref={containerRef}>
            {/* Ambient Background with Organic Particles */}
            <div className="embryology-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="organic-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 15}s`,
                            animationDuration: `${25 + Math.random() * 20}s`
                        }}
                    />
                ))}
            </div>

            {/* Fixed Header */}
            <header className="embryology-header">
                <Link href="/quran-science" className="back-button">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Link>

                <div className="header-center">
                    <motion.div
                        className="progress-ring"
                        style={{
                            background: `conic-gradient(#14b8a6 ${progress.get()}%, rgba(255,255,255,0.1) ${progress.get()}%)`
                        }}
                    >
                        <div className="progress-inner">
                            <span className="progress-text">{activeStage + 1}/6</span>
                        </div>
                    </motion.div>
                </div>

                <button
                    className={`comparison-toggle ${comparisonMode ? 'active' : ''}`}
                    onClick={() => setComparisonMode(!comparisonMode)}
                >
                    <Microscope size={18} />
                    <span>{comparisonMode ? 'Quranic' : 'Compare'}</span>
                </button>
            </header>

            {/* Vertical Timeline */}
            <div className="vertical-timeline">
                <div className="timeline-line"></div>
                {stages.map((stage, index) => (
                    <button
                        key={stage.id}
                        className={`timeline-dot ${index === activeStage ? 'active' : ''} ${index < activeStage ? 'completed' : ''}`}
                        onClick={() => {
                            const element = document.getElementById(`stage-${stage.id}`);
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        <div className="dot-inner"></div>
                        <div className="dot-label">
                            <span className="stage-num">{stage.id}</span>
                            <span className="stage-name">{stage.transliteration}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Hero Section */}
            <section className="embryology-hero">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="hero-content"
                >
                    <div className="hero-icon">
                        <Sparkles size={48} />
                        <div className="icon-pulse"></div>
                    </div>

                    <h1 className="hero-title">
                        The Miracle of
                        <span className="gradient-text"> Human Creation</span>
                    </h1>

                    <p className="hero-subtitle">
                        A journey through the stages of embryonic development
                        <br />
                        as described in the Holy Quran 1,400 years ago
                    </p>

                    <div className="hero-verse">
                        <BookOpen size={20} />
                        <p>"We created man from an extract of clay..." <span className="verse-ref">- Surah Al-Mu'minun (23:12-14)</span></p>
                    </div>

                    <div className="scroll-indicator">
                        <ChevronDown className="bounce" size={28} />
                        <span>Scroll to explore</span>
                    </div>
                </motion.div>
            </section>

            {/* Motion Infographics Section */}
            <section className="motion-info-section">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="motion-info-container"
                >
                    {/* Animated Statistics */}
                    <div className="info-stats-grid">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="info-stat-card"
                        >
                            <div className="stat-icon">📅</div>
                            <motion.div
                                className="stat-number"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                1,400
                            </motion.div>
                            <div className="stat-label">Years Before Modern Science</div>
                            <div className="stat-detail">When these stages were revealed in the Quran</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="info-stat-card"
                        >
                            <div className="stat-icon">🔬</div>
                            <motion.div
                                className="stat-number"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                6
                            </motion.div>
                            <div className="stat-label">Distinct Developmental Stages</div>
                            <div className="stat-detail">Each precisely described in Surah Al-Mu'minun</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="info-stat-card"
                        >
                            <div className="stat-icon">⏱️</div>
                            <motion.div
                                className="stat-number"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                9+
                            </motion.div>
                            <div className="stat-label">Weeks to Complete Human</div>
                            <div className="stat-detail">From single cell to recognizable baby</div>
                        </motion.div>
                    </div>

                    {/* Animated Timeline Comparison */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="timeline-comparison"
                    >
                        <h3 className="comparison-title">
                            <span className="title-highlight">Timeline:</span> Divine Revelation vs Scientific Discovery
                        </h3>

                        <div className="comparison-tracks">
                            {/* Quran Track */}
                            <div className="track quran-track">
                                <div className="track-label">
                                    <BookOpen size={20} />
                                    <span>Quranic Revelation</span>
                                </div>
                                <div className="track-timeline">
                                    <motion.div
                                        className="timeline-bar quran-bar"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.7, duration: 1.5, ease: 'easeOut' }}
                                    >
                                        <div className="bar-glow"></div>
                                    </motion.div>
                                    <motion.div
                                        className="timeline-marker"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 1.2, duration: 0.5 }}
                                    >
                                        <div className="marker-dot"></div>
                                        <div className="marker-label">610 CE</div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Science Track */}
                            <div className="track science-track">
                                <div className="track-label">
                                    <Microscope size={20} />
                                    <span>Scientific Discovery</span>
                                </div>
                                <div className="track-timeline">
                                    <motion.div
                                        className="timeline-bar science-bar"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.9, duration: 1.5, ease: 'easeOut' }}
                                    >
                                        <div className="bar-glow"></div>
                                    </motion.div>
                                    <motion.div
                                        className="timeline-marker"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 1.4, duration: 0.5 }}
                                    >
                                        <div className="marker-dot"></div>
                                        <div className="marker-label">1950s+</div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Gap Indicator */}
                            <motion.div
                                className="gap-indicator"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.6, duration: 0.6 }}
                            >
                                <div className="gap-arrow">
                                    <div className="arrow-line"></div>
                                    <div className="arrow-head"></div>
                                </div>
                                <div className="gap-label">1,340+ Years Gap</div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Kinetic Typography Facts */}
                    <div className="kinetic-facts">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="kinetic-fact"
                        >
                            <div className="fact-number">01</div>
                            <div className="fact-content">
                                <h4>Microscopic Precision</h4>
                                <p>The Quran described embryonic stages that require a <span className="highlight">microscope to see</span> - yet revealed centuries before its invention</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="kinetic-fact"
                        >
                            <div className="fact-number">02</div>
                            <div className="fact-content">
                                <h4>Sequential Accuracy</h4>
                                <p>Modern embryology confirms the <span className="highlight">exact sequence</span> described: bones form first, then muscles clothe them</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="kinetic-fact"
                        >
                            <div className="fact-number">03</div>
                            <div className="fact-content">
                                <h4>Triple Meaning Words</h4>
                                <p>Arabic terms like "alaqah" carry <span className="highlight">multiple accurate descriptions</span> of each stage simultaneously</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Stage Sections */}
            <div className="stages-container">
                {stages.map((stage, index) => (
                    <section
                        key={stage.id}
                        id={`stage-${stage.id}`}
                        className="stage-section"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false, margin: '-20%' }}
                            transition={{ duration: 0.8 }}
                            className="stage-content"
                        >
                            {/* Stage Header */}
                            <div className="stage-header">
                                <span className="stage-number">{stage.number}</span>
                                <div className="stage-time">
                                    <Clock size={16} />
                                    <span>{stage.weeks}</span>
                                </div>
                            </div>

                            {/* Main Content Card */}
                            <div className={`stage-card ${comparisonMode ? 'comparison-mode' : ''}`}>
                                {/* Arabic Section */}
                                <div className="card-section arabic-section">
                                    <div className="stage-icon">{stage.icon}</div>

                                    <h2 className="arabic-title">{stage.arabic}</h2>
                                    <h3 className="transliteration">{stage.transliteration}</h3>
                                    <p className="translation">{stage.translation}</p>

                                    <div className="verse-box">
                                        <div className="verse-label">
                                            <BookOpen size={16} />
                                            <span>Quranic Verse</span>
                                        </div>
                                        <p className="verse-text">"{stage.verse}"</p>
                                        <p className="verse-reference">{stage.reference}</p>
                                    </div>
                                </div>

                                {/* Scientific Section */}
                                <div className="card-section science-section">
                                    <div className="science-label">
                                        <Microscope size={16} />
                                        <span>Scientific Understanding</span>
                                    </div>
                                    <p className="science-text">{stage.science}</p>

                                    {/* Subhanallah Moment */}
                                    <div className="miracle-badge">
                                        <Sparkles size={18} />
                                        <div className="miracle-content">
                                            <span className="miracle-label">Subhanallah!</span>
                                            <p className="miracle-text">{stage.miracle}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stage Transition Indicator */}
                            {index < stages.length - 1 && (
                                <div className="stage-transition">
                                    <div className="transition-line"></div>
                                    <span className="transition-text">Developing...</span>
                                </div>
                            )}
                        </motion.div>
                    </section>
                ))}
            </div>

            {/* Summary Comparison Table */}
            <section className="summary-section">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="summary-content"
                >
                    <h2 className="summary-title">
                        Complete Journey Overview
                    </h2>
                    <p className="summary-subtitle">
                        All stages at a glance - The perfect harmony of divine revelation and scientific discovery
                    </p>

                    <div className="comparison-table">
                        <div className="table-header">
                            <div className="col">Stage</div>
                            <div className="col">Arabic</div>
                            <div className="col">Quranic Description</div>
                            <div className="col">Scientific Equivalent</div>
                            <div className="col">Timeline</div>
                        </div>
                        {stages.map((stage) => (
                            <div key={stage.id} className="table-row">
                                <div className="col stage-col">
                                    <span className="stage-badge">{stage.id}</span>
                                </div>
                                <div className="col arabic-col">
                                    <span className="arabic-text">{stage.arabic}</span>
                                    <span className="trans-text">{stage.transliteration}</span>
                                </div>
                                <div className="col desc-col">{stage.translation}</div>
                                <div className="col science-col">
                                    {stage.science.split('.')[0]}.
                                </div>
                                <div className="col time-col">{stage.weeks}</div>
                            </div>
                        ))}
                    </div>

                    {/* Final Reflection */}
                    <div className="reflection-card">
                        <div className="reflection-icon">✨</div>
                        <h3 className="reflection-title">فَتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ</h3>
                        <p className="reflection-translation">"So blessed is Allah, the Best of Creators!"</p>
                        <p className="reflection-text">
                            The precision with which the Quran describes human embryonic development - revealed 1,400 years before microscopes and modern science - stands as one of the most profound miracles of the Holy Book. Each stage described with perfect accuracy, guiding humanity to both scientific discovery and spiritual truth.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="summary-actions">
                        <Link href="/quran-science" className="action-btn primary">
                            <ArrowLeft size={20} />
                            Explore More Miracles
                        </Link>
                        <Link href="/read-quran" className="action-btn secondary">
                            <BookOpen size={20} />
                            Read the Full Surah
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
