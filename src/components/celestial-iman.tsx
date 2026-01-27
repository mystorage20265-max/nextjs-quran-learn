'use client';

import { useEffect, useRef } from 'react';
import styles from './celestial-iman.module.css';

interface Pillar {
    id: string;
    nameAr: string;
    nameEn: string;
    planetType: 'ringed' | 'striped' | 'cratered' | 'gaseous' | 'rocky';
    color: string;
    secondaryColor: string;
    size: number;
    orbitRadius: number;
    speed: number;
}

const PILLARS: Pillar[] = [
    {
        id: 'shahada',
        nameAr: 'الشهادة',
        nameEn: 'Shahada',
        planetType: 'ringed',
        color: '#f59e0b',      // Amber-500
        secondaryColor: '#d97706', // Amber-600
        size: 80,
        orbitRadius: 160,
        speed: 60
    },
    {
        id: 'salah',
        nameAr: 'الصلاة',
        nameEn: 'Salah',
        planetType: 'striped',
        color: '#fbbf24',      // Amber-400
        secondaryColor: '#f59e0b', // Amber-500
        size: 90,
        orbitRadius: 240,
        speed: 80
    },
    {
        id: 'zakat',
        nameAr: 'الزكاة',
        nameEn: 'Zakat',
        planetType: 'cratered',
        color: '#2dd4bf',      // Teal-400 (accent)
        secondaryColor: '#14b8a6', // Teal-500
        size: 75,
        orbitRadius: 320,
        speed: 100
    },
    {
        id: 'sawm',
        nameAr: 'الصوم',
        nameEn: 'Sawm',
        planetType: 'gaseous',
        color: '#b45309',      // Amber-700
        secondaryColor: '#92400e', // Amber-800
        size: 85,
        orbitRadius: 400,
        speed: 120
    },
    {
        id: 'hajj',
        nameAr: 'الحج',
        nameEn: 'Hajj',
        planetType: 'rocky',
        color: '#fcd34d',      // Amber-300
        secondaryColor: '#fbbf24', // Amber-400
        size: 95,
        orbitRadius: 480,
        speed: 140
    }
];

// Evenly spaced starting positions for each planet (72 degrees apart for optimal separation)
const PLANET_START_ANGLES = [0, 72, 144, 216, 288]; // Perfectly distributed positions

// Planet SVG Component
const PlanetSVG = ({ type, color, secondaryColor, size }: { type: string; color: string; secondaryColor: string; size: number }) => {
    const svgSize = size * 0.6;

    switch (type) {
        case 'ringed': // Saturn-like
            return (
                <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
                    <defs>
                        <radialGradient id={`planet-${type}`}>
                            <stop offset="0%" stopColor={color} />
                            <stop offset="70%" stopColor={secondaryColor} />
                            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.8" />
                        </radialGradient>
                    </defs>
                    {/* Ring behind */}
                    <ellipse cx="50" cy="50" rx="70" ry="15" fill="none" stroke={color} strokeWidth="3" opacity="0.4" />
                    {/* Planet body */}
                    <circle cx="50" cy="50" r="35" fill={`url(#planet-${type})`} />
                    {/* Ring in front */}
                    <ellipse cx="50" cy="50" rx="70" ry="15" fill="none" stroke={color} strokeWidth="3" opacity="0.6" />
                </svg>
            );

        case 'striped': // Jupiter-like
            return (
                <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
                    <defs>
                        <radialGradient id={`planet-${type}`}>
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={secondaryColor} />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill={`url(#planet-${type})`} />
                    {/* Horizontal stripes */}
                    <ellipse cx="50" cy="35" rx="40" ry="5" fill={secondaryColor} opacity="0.5" />
                    <ellipse cx="50" cy="50" rx="40" ry="6" fill={color} opacity="0.3" />
                    <ellipse cx="50" cy="65" rx="40" ry="5" fill={secondaryColor} opacity="0.5" />
                    {/* Great Red Spot */}
                    <ellipse cx="60" cy="55" rx="8" ry="6" fill={color} opacity="0.7" />
                </svg>
            );

        case 'cratered': // Moon-like
            return (
                <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
                    <defs>
                        <radialGradient id={`planet-${type}`}>
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={secondaryColor} />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill={`url(#planet-${type})`} />
                    {/* Craters */}
                    <circle cx="35" cy="35" r="6" fill={secondaryColor} opacity="0.6" />
                    <circle cx="60" cy="40" r="8" fill={secondaryColor} opacity="0.5" />
                    <circle cx="45" cy="60" r="5" fill={secondaryColor} opacity="0.7" />
                    <circle cx="65" cy="65" r="7" fill={secondaryColor} opacity="0.5" />
                    <circle cx="30" cy="55" r="4" fill={secondaryColor} opacity="0.6" />
                </svg>
            );

        case 'gaseous': // Neptune-like
            return (
                <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
                    <defs>
                        <radialGradient id={`planet-${type}`}>
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={secondaryColor} />
                        </radialGradient>
                        <filter id="blur">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
                        </filter>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill={`url(#planet-${type})`} />
                    {/* Swirling clouds */}
                    <path d="M 20 40 Q 35 35, 50 40 T 80 40" stroke={color} strokeWidth="3" fill="none" opacity="0.4" filter="url(#blur)" />
                    <path d="M 20 55 Q 35 50, 50 55 T 80 55" stroke={secondaryColor} strokeWidth="3" fill="none" opacity="0.4" filter="url(#blur)" />
                    <path d="M 25 65 Q 40 60, 55 65 T 75 65" stroke={color} strokeWidth="2" fill="none" opacity="0.3" filter="url(#blur)" />
                </svg>
            );

        case 'rocky': // Mars-like
            return (
                <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
                    <defs>
                        <radialGradient id={`planet-${type}`}>
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={secondaryColor} />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill={`url(#planet-${type})`} />
                    {/* Rocky terrain */}
                    <circle cx="30" cy="40" r="10" fill={secondaryColor} opacity="0.3" />
                    <circle cx="65" cy="35" r="12" fill={secondaryColor} opacity="0.4" />
                    <circle cx="45" cy="65" r="8" fill={secondaryColor} opacity="0.35" />
                    <circle cx="70" cy="60" r="9" fill={secondaryColor} opacity="0.3" />
                    {/* Polar ice cap */}
                    <ellipse cx="50" cy="20" rx="15" ry="8" fill="white" opacity="0.4" />
                </svg>
            );

        default:
            return null;
    }
};

export default function CelestialIman() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Stars background
        const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[] = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                opacity: Math.random(),
                twinkleSpeed: 0.01 + Math.random() * 0.02
            });
        }

        let animationFrame: number;
        let time = 0;

        const animate = () => {
            time += 0.01;

            // Clear canvas - warm dark brown background
            ctx.fillStyle = '#0f0d0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars with warm tinted twinkling
            stars.forEach(star => {
                star.opacity += star.twinkleSpeed;
                if (star.opacity > 1 || star.opacity < 0.2) {
                    star.twinkleSpeed *= -1;
                }
                // Stars with warm amber tint
                ctx.fillStyle = `rgba(255, 248, 230, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw nebula effect with warm amber tones
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 600);
            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.08)');   // Amber glow at center
            gradient.addColorStop(0.3, 'rgba(251, 191, 36, 0.05)'); // Amber-400
            gradient.addColorStop(0.6, 'rgba(45, 212, 191, 0.03)'); // Subtle teal accent
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <section className={styles.celestialImanSection}>
            <canvas ref={canvasRef} className={styles.celestialCanvas} />

            <div className={styles.celestialContainer}>
                {/* Central Iman Sun */}
                <div className={styles.imanSun}>
                    <div className={styles.sunCore}>
                        <div className={styles.sunGlow}></div>
                        <div className={styles.sunInnerGlow}></div>
                        <div className={styles.sunContent}>
                            <span className={styles.imanArabic}>إيمان</span>
                            <span className={styles.imanEnglish}>IMAN</span>
                        </div>
                    </div>
                    <div className={styles.sunRays}></div>
                </div>

                {/* Orbital Paths and Planets */}
                {PILLARS.map((pillar, index) => (
                    <div key={pillar.id}>
                        {/* Orbital Path */}
                        <div
                            className={styles.orbitalPath}
                            style={{
                                width: `${pillar.orbitRadius * 2}px`,
                                height: `${pillar.orbitRadius * 2}px`,
                                boxShadow: `0 0 2px ${pillar.color}40, inset 0 0 2px ${pillar.color}30`
                            }}
                        />

                        {/* Planet */}
                        <div
                            className={styles.planetOrbit}
                            style={{
                                width: `${pillar.orbitRadius * 2}px`,
                                height: `${pillar.orbitRadius * 2}px`,
                                animation: `${styles.orbit} ${pillar.speed}s linear infinite`,
                                animationDelay: `-${(PLANET_START_ANGLES[index] / 360) * pillar.speed}s`
                            }}
                        >
                            <div
                                className={styles.planet}
                                style={{
                                    width: `${pillar.size}px`,
                                    height: `${pillar.size}px`
                                }}
                            >
                                <PlanetSVG
                                    type={pillar.planetType}
                                    color={pillar.color}
                                    secondaryColor={pillar.secondaryColor}
                                    size={pillar.size}
                                />
                                <div className={styles.planetLabel}>
                                    <span className={styles.planetNameAr}>{pillar.nameAr}</span>
                                    <span className={styles.planetNameEn}>{pillar.nameEn}</span>
                                </div>

                                {/* Light trail */}
                                <div
                                    className={styles.lightTrail}
                                    style={{
                                        background: `radial-gradient(ellipse at center, ${pillar.color}60, transparent 70%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
