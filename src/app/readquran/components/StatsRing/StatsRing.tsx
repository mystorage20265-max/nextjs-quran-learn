import React from 'react';
import './StatsRing.scss';

interface StatsRingProps {
    value: number | string;
    maxValue?: number;
    label: string;
    subLabel?: string;
    color: string;
    icon?: React.ReactNode;
    size?: number;
    strokeWidth?: number;
}

export const StatsRing: React.FC<StatsRingProps> = ({
    value,
    maxValue = 100,
    label,
    subLabel,
    color,
    icon,
    size = 180,
    strokeWidth = 8,
}) => {
    // Parse value to number if string (handle "16m", "1.5h" etc for display vs progress)
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    const progress = Math.min(Math.max(numericValue / maxValue, 0), 1);

    const radius = (size - strokeWidth * 2) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;
    const gradientId = `gradient-${label.replace(/\s+/g, '-').toLowerCase()}`;

    // Determine colors based on label if generic 'color' prop is passed, or use prop
    // This allows us to map specific gradients to specific stats
    const getGradientStops = () => {
        if (label.includes('Verses')) return ['#84cc16', '#3b82f6']; // Green to Blue
        if (label.includes('Streak')) return ['#f59e0b', '#ef4444']; // Amber to Red
        if (label.includes('Time')) return ['#8b5cf6', '#d946ef'];   // Purple to Pink
        return [color, color];
    };

    const [startColor, endColor] = getGradientStops();

    return (
        <div className="stats-ring-container" style={{ width: size, height: size }}>
            {/* Ambient Glow behind the ring */}
            <div className="stats-ring-glow" style={{
                background: `radial-gradient(circle, ${startColor}33 0%, transparent 70%)`
            }}></div>

            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="stats-ring-svg"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={startColor} />
                        <stop offset="100%" stopColor={endColor} />
                    </linearGradient>
                    {/* Shadow filter for 3D effect */}
                    <filter id="glow-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Track Circle (Background) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth={strokeWidth}
                    className="stats-ring-track"
                />

                {/* Progress Circle with Gradient */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="stats-ring-progress"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    filter="url(#glow-shadow)"
                />

                {/* Optional: Cap marker if needed, but round linecap works well */}
            </svg>

            <div className="stats-content">
                <div className="stats-value" style={{
                    background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: `0 0 30px ${startColor}66` // Subtle text glow
                }}>
                    {value}
                </div>
                <div className="stats-label">{label}</div>
                {subLabel && <div className="stats-sublabel">{subLabel}</div>}
                {icon && <div className="stats-icon" style={{ color: endColor }}>{icon}</div>}
            </div>
        </div>
    );
};
