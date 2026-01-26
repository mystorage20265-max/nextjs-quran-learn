import MushafPage from '@/components/Quran/MushafPage';
import Link from 'next/link';

export default function MushafDemoPage() {
    return (
        <div className="min-h-screen" style={{ paddingTop: '80px' }}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--rq-text)' }}>
                        🕌 Mushaf Glyph Viewer
                    </h1>
                    <p className="text-lg mb-4" style={{ color: 'var(--rq-text-secondary)' }}>
                        Authentic Quran rendering using Quran Complex glyph fonts
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/read-quran"
                            className="px-6 py-2 rounded-full border"
                            style={{
                                background: 'var(--rq-bg-card)',
                                borderColor: 'var(--rq-border)',
                                color: 'var(--rq-text)'
                            }}
                        >
                            ← Back to Quran
                        </Link>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-lg" style={{ background: 'var(--rq-bg-card)', border: '1px solid var(--rq-border)' }}>
                        <div className="text-2xl mb-2">📖</div>
                        <h3 className="font-bold mb-1" style={{ color: 'var(--rq-text)' }}>Page-Based Fonts</h3>
                        <p className="text-sm" style={{ color: 'var(--rq-text-muted)' }}>
                            604 custom fonts, one per Mushaf page
                        </p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ background: 'var(--rq-bg-card)', border: '1px solid var(--rq-border)' }}>
                        <div className="text-2xl mb-2">✨</div>
                        <h3 className="font-bold mb-1" style={{ color: 'var(--rq-text)' }}>Glyph Rendering</h3>
                        <p className="text-sm" style={{ color: 'var(--rq-text-muted)' }}>
                            Each word as a single visual glyph
                        </p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ background: 'var(--rq-bg-card)', border: '1px solid var(--rq-border)' }}>
                        <div className="text-2xl mb-2">🖱️</div>
                        <h3 className="font-bold mb-1" style={{ color: 'var(--rq-text)' }}>Interactive</h3>
                        <p className="text-sm" style={{ color: 'var(--rq-text-muted)' }}>
                            Click words for tooltip translations
                        </p>
                    </div>
                </div>

                {/* Mushaf Viewer */}
                <div>
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--rq-text)' }}>
                            سُورَةُ الْفَاتِحَة
                        </h2>
                        <p style={{ color: 'var(--rq-text-secondary)' }}>
                            Surah Al-Fatihah (The Opener) - Page 1
                        </p>
                    </div>

                    <MushafPage pageNumber={1} mode="page" />
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center text-sm" style={{ color: 'var(--rq-text-muted)' }}>
                    <p>Fonts provided by King Fahd Glorious Quran Printing Complex</p>
                    <p className="mt-2">API powered by Quran.com</p>
                </div>
            </div>
        </div>
    );
}
