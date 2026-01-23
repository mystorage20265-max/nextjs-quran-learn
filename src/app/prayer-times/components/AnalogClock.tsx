'use client';

import { useEffect, useState } from 'react';

export default function AnalogClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();

    // Calculate rotation angles
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;

    // Hour positions for clock numbers
    const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    return (
        <div className="analog-clock">
            {/* Hour markers and numbers */}
            {hourNumbers.map((num, index) => {
                const angle = (index * 30) * Math.PI / 180;
                const radius = 42; // percentage from center for numbers
                const x = 50 + radius * Math.sin(angle);
                const y = 50 - radius * Math.cos(angle);

                return (
                    <div
                        key={num}
                        style={{
                            position: 'absolute',
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#cbd5e1',
                            zIndex: 1,
                        }}
                    >
                        {num}
                    </div>
                );
            })}

            {/* Hour markers (tick marks) */}
            {[...Array(12)].map((_, i) => {
                const angle = (i * 30) * Math.PI / 180;
                const innerRadius = 85; // percentage from center
                const outerRadius = 92;
                const x1 = 50 + innerRadius * 0.5 * Math.sin(angle);
                const y1 = 50 - innerRadius * 0.5 * Math.cos(angle);
                const x2 = 50 + outerRadius * 0.5 * Math.sin(angle);
                const y2 = 50 - outerRadius * 0.5 * Math.cos(angle);

                return (
                    <div
                        key={`marker-${i}`}
                        style={{
                            position: 'absolute',
                            left: `${x1}%`,
                            top: `${y1}%`,
                            width: '2px',
                            height: `${Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))}%`,
                            background: i % 3 === 0 ? '#cbd5e1' : '#64748b',
                            transformOrigin: 'top center',
                            transform: `translate(-50%, 0) rotate(${i * 30}deg)`,
                        }}
                    />
                );
            })}

            {/* Clock center dot */}
            <div style={{
                position: 'absolute',
                width: '18px',
                height: '18px',
                background: '#f59e0b',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)'
            }} />

            {/* Hour hand */}
            <div style={{
                position: 'absolute',
                bottom: '50%',
                left: '50%',
                width: '10px',
                height: '28%',
                background: '#f59e0b',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${hourAngle}deg)`,
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                zIndex: 3,
            }} />

            {/* Minute hand */}
            <div style={{
                position: 'absolute',
                bottom: '50%',
                left: '50%',
                width: '6px',
                height: '38%',
                background: '#cbd5e1',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
                borderRadius: '6px',
                boxShadow: '0 6px 16px rgba(203, 213, 225, 0.4)',
                zIndex: 4,
            }} />
        </div>
    );
}
