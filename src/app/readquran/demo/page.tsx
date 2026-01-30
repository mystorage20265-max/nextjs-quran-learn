'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import from standalone UI
const StandaloneDemo = dynamic(
    () => import('../../standalone-quran-ui/page'),
    { ssr: false }
);

export default function ReadQuranDemoPage() {
    return (
        <div>
            {/* Breadcrumb */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: 'rgba(26, 26, 26, 0.98)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1rem',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#b0b0b0', fontSize: '0.875rem' }}>
                    <Link href="/readquran" style={{ color: '#4a90e2', textDecoration: 'none' }}>ReadQuran</Link>
                    <span>/</span>
                    <span>Verse Demo</span>
                </div>
            </div>

            <StandaloneDemo />
        </div>
    );
}
