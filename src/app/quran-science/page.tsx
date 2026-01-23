'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Microscope,
    Atom,
    Waves,
    Mountain,
    Droplets,
    Baby,
    BookOpen,
    Sparkles,
    ArrowRight,
    ChevronRight,
    Globe,
    Sun
} from 'lucide-react';
import './quran-science.css';

const scientificTopics = [
    {
        id: 'embryology',
        icon: <Baby size={32} />,
        title: 'Embryology',
        subtitle: 'Human Development',
        description: 'The Quran describes stages of human embryonic development with remarkable accuracy',
        verse: 'We created man from an extract of clay. Then We made him a sperm-drop in a firm lodging. Then We made the sperm-drop into a clinging clot, and We made the clot into a lump of flesh, and We made the lump bones, and We covered the bones with flesh.',
        reference: 'Surah Al-Mu\'minun (23:12-14)',
        scientificFact: 'Modern embryology confirms these stages mirror the actual developmental process of a human embryo.',
        gradient: 'from-purple-600/20 to-pink-600/20',
        bgColor: 'bg-purple-900/10'
    },
    {
        id: 'cosmology',
        icon: <Atom size={32} />,
        title: 'Big Bang',
        subtitle: 'Universe Expansion',
        description: 'The Quran mentions the expanding universe 1400 years before modern science',
        verse: 'And the heaven We constructed with strength, and indeed, We are [its] expander.',
        reference: 'Surah Adh-Dhariyat (51:47)',
        scientificFact: 'In 1929, Edwin Hubble discovered that the universe is expanding, confirming what the Quran stated centuries ago.',
        gradient: 'from-blue-600/20 to-cyan-600/20',
        bgColor: 'bg-blue-900/10'
    },
    {
        id: 'oceanography',
        icon: <Waves size={32} />,
        title: 'Two Seas',
        subtitle: 'Ocean Barriers',
        description: 'The Quran describes the barrier between two bodies of water',
        verse: 'He released the two seas, meeting [side by side]; Between them is a barrier [so] neither of them transgresses.',
        reference: 'Surah Ar-Rahman (55:19-20)',
        scientificFact: 'Modern oceanography has discovered that where two seas meet, there exists a barrier that maintains the distinct properties of each body of water.',
        gradient: 'from-teal-600/20 to-emerald-600/20',
        bgColor: 'bg-teal-900/10'
    },
    {
        id: 'mountains',
        icon: <Mountain size={32} />,
        title: 'Mountains',
        subtitle: 'Earth\'s Stability',
        description: 'The Quran describes mountains as pegs that stabilize the earth',
        verse: 'Have We not made the earth a resting place? And the mountains as stakes?',
        reference: 'Surah An-Naba (78:6-7)',
        scientificFact: 'Geology reveals mountains have deep roots beneath the surface, and they play a role in stabilizing the earth\'s crust, functioning like pegs.',
        gradient: 'from-amber-600/20 to-orange-600/20',
        bgColor: 'bg-amber-900/10'
    },
    {
        id: 'water-cycle',
        icon: <Droplets size={32} />,
        title: 'Water Cycle',
        subtitle: 'Rain & Clouds',
        description: 'The Quran accurately describes the water cycle process',
        verse: 'We send the winds as fertilizers, and We send down water from the sky, providing you with drink, and you are not the ones who store it.',
        reference: 'Surah Al-Hijr (15:22)',
        scientificFact: 'The water cycle involving evaporation, cloud formation, and precipitation was only understood scientifically in recent centuries.',
        gradient: 'from-sky-600/20 to-blue-600/20',
        bgColor: 'bg-sky-900/10'
    },
    {
        id: 'astronomy',
        icon: <Sun size={32} />,
        title: 'Sun & Moon',
        subtitle: 'Celestial Orbits',
        description: 'The Quran mentions that celestial bodies move in calculated orbits',
        verse: 'It is He who created the night and the day, and the sun and the moon; all [celestial bodies] swim along, each in its rounded course.',
        reference: 'Surah Al-Anbiya (21:33)',
        scientificFact: 'Modern astronomy confirms that the sun, moon, and planets all move in precise orbital paths.',
        gradient: 'from-yellow-600/20 to-orange-600/20',
        bgColor: 'bg-yellow-900/10'
    }
];

export default function QuranSciencePage() {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    return (
        <main className="quran-science-page">
            {/* Cosmic Background */}
            <div className="cosmic-background">
                <div className="stars-layer"></div>
                <div className="nebula-layer"></div>
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="floating-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${20 + Math.random() * 30}s`
                        }}
                    />
                ))}
            </div>

            {/* Hero Section */}
            <section className="science-hero">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-content"
                >
                    <div className="hero-icon-wrapper">
                        <Microscope className="hero-icon" size={64} />
                        <div className="icon-glow"></div>
                    </div>

                    <h1 className="hero-title">
                        <span className="gradient-text">Quran</span>
                        <span className="text-white"> & </span>
                        <span className="gradient-text-alt">Science</span>
                    </h1>

                    <p className="hero-subtitle">
                        Discover the remarkable scientific insights mentioned in the Holy Quran
                        <span className="highlight-text"> 1400 years ago</span>,
                        now confirmed by modern science
                    </p>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <Sparkles size={20} />
                            <span className="stat-number">100+</span>
                            <span className="stat-label">Scientific Facts</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <BookOpen size={20} />
                            <span className="stat-number">6</span>
                            <span className="stat-label">Major Categories</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <Globe size={20} />
                            <span className="stat-number">14</span>
                            <span className="stat-label">Centuries Old</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Topics Grid */}
            <section className="topics-section">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="section-header"
                >
                    <h2 className="section-title">
                        Explore Scientific <span className="gradient-text">Miracles</span>
                    </h2>
                    <p className="section-description">
                        Journey through the Quran's profound insights into the natural world
                    </p>
                </motion.div>

                <div className="topics-grid">
                    {scientificTopics.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                            className={`topic-card ${expandedCard === topic.id ? 'expanded' : ''}`}
                            onClick={() => setExpandedCard(expandedCard === topic.id ? null : topic.id)}
                        >
                            <div className={`card-gradient ${topic.gradient}`}></div>
                            <div className={`card-background ${topic.bgColor}`}></div>

                            <div className="card-header">
                                <div className="icon-container">
                                    {topic.icon}
                                    <div className="icon-ring"></div>
                                </div>
                                <div className="card-title-section">
                                    <h3 className="card-title">{topic.title}</h3>
                                    <p className="card-subtitle">{topic.subtitle}</p>
                                </div>
                                <ChevronRight
                                    className={`expand-icon ${expandedCard === topic.id ? 'rotated' : ''}`}
                                    size={24}
                                />
                            </div>

                            <p className="card-description">{topic.description}</p>

                            {expandedCard === topic.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="card-expanded-content"
                                >
                                    <div className="verse-section">
                                        <div className="verse-label">
                                            <BookOpen size={16} />
                                            <span>Quranic Verse</span>
                                        </div>
                                        <p className="verse-text">"{topic.verse}"</p>
                                        <p className="verse-reference">{topic.reference}</p>
                                    </div>

                                    <div className="science-section">
                                        <div className="science-label">
                                            <Atom size={16} />
                                            <span>Scientific Discovery</span>
                                        </div>
                                        <p className="science-text">{topic.scientificFact}</p>
                                    </div>

                                    <Link
                                        href={topic.id === 'embryology' ? '/quran-science/embryology' : '#'}
                                        className="explore-btn"
                                    >
                                        Explore in Detail
                                        <ArrowRight size={18} />
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="cta-card"
                >
                    <div className="cta-glow"></div>
                    <h2 className="cta-title">
                        Deepen Your Understanding
                    </h2>
                    <p className="cta-text">
                        Continue your journey and explore the Quran's timeless wisdom
                    </p>
                    <div className="cta-buttons">
                        <Link href="/read-quran" className="cta-btn primary">
                            <BookOpen size={20} />
                            Read the Quran
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/learn-quran" className="cta-btn secondary">
                            <Sparkles size={20} />
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
