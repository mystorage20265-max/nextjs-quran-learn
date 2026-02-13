import { StatsRing } from '../StatsRing/StatsRing';
import { VerseOfTheDay } from '../VerseOfTheDay/VerseOfTheDay';
import { SurahGrid } from '../SurahGrid/SurahGrid';
import { ContinueFloatingButton } from '../ContinueFloatingButton/ContinueFloatingButton';
import './Dashboard.scss';

interface DashboardProps {
    chapters: any[];
    selectedChapterId: number;
    onSelectChapter: (id: number) => void;
    stats: {
        versesRead: number;
        daysRead: number;
        dayStreak: number;
        totalTime: string; // Formatted stats
    };
}

export const Dashboard: React.FC<DashboardProps> = ({
    chapters,
    selectedChapterId,
    onSelectChapter,
    stats,
}) => {
    return (
        <div className="rq-dashboard">
            {/* Header / Hero Section */}
            <div className="dashboard-hero">
                <div className="hero-top-bar">
                    <h1>Read Quran</h1>

                    {/* Daily Goal Ring - Top Right */}
                    <div className="daily-goal-ring">
                        <StatsRing
                            value="2 of 5"
                            maxValue={5}
                            label="Daily Goal"
                            subLabel="verses today"
                            color="#10b981"
                            size={140}
                            strokeWidth={6}
                        />
                    </div>
                </div>

                <div className="stats-rings-container">
                    <StatsRing
                        value={stats.versesRead}
                        maxValue={100} // Example max
                        label="Verses Read"
                        color="#84cc16" // Lime green
                        size={160}
                    />

                    <StatsRing
                        value={stats.dayStreak}
                        maxValue={30}
                        label="Day Streak"
                        subLabel={`${stats.daysRead} Days Read`}
                        color="#fbbf24" // Amber/Yellow
                        size={180} // Center one larger
                        icon={<span style={{ fontSize: '24px' }}>🔥</span>}
                    />

                    <StatsRing
                        value={stats.totalTime}
                        maxValue={60} // Just visual
                        label="Total Time"
                        color="#a78bfa" // Purple
                        size={160}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-content">
                {/* Left Column: Verse of Day */}
                <div className="dashboard-sidebar-left">
                    <div className="section-header">
                        <h3>Verse of the Day</h3>
                    </div>
                    <VerseOfTheDay />
                </div>

                {/* Right Column: Surah Grid */}
                <div className="dashboard-main-area">
                    <div className="section-header-flex">
                        <h3>Select Surah</h3>
                        <button className="playback-mode-btn">
                            🎵 Audio Playback
                        </button>
                    </div>

                    <SurahGrid
                        chapters={chapters}
                        selectedChapterId={selectedChapterId}
                        onSelectChapter={onSelectChapter}
                    />
                </div>
            </div>

            {/* Floating Continue Button */}
            <ContinueFloatingButton
                surahName="Surah Al-Asr" // Placeholder, should be dynamic
                verseNumber={2}
                onClick={() => console.log('Continue Reading')}
            />
        </div>
    );
};
