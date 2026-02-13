import React from 'react';
import './VerseOfTheDay.scss';

export const VerseOfTheDay = () => {
    return (
        <div className="verse-of-day-card">
            {/* Premium Glow Effects */}
            <div className="vod-glow-top"></div>
            <div className="vod-glow-bottom"></div>

            <div className="vod-header">
                <span className="vod-label">VERSE OF THE DAY</span>
            </div>

            <div className="vod-content">
                <div className="vod-arabic-art">
                    {/* Calligraphy Placeholder - using image or SVG preferred, text for now */}
                    <span className="calligraphy-placeholder">ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ</span>
                </div>

                <p className="vod-translation">
                    "Allah! There is no deity except Him, the Ever-Living, the Sustainer of [all] existence."
                </p>

                <div className="vod-reference">
                    Ayat al-Kursi [2:255]
                </div>
            </div>

            {/* Daily Goal Section */}
            <div className="vod-daily-goal">
                <div className="goal-info">
                    <span className="goal-label">DAILY GOAL</span>
                    <div className="goal-stats">
                        <span className="goal-current">2 of 5</span> verses today
                    </div>
                </div>
                <div className="goal-points">
                    +100pts
                </div>

                {/* Progress Bar */}
                <div className="goal-progress-bar">
                    <div className="goal-progress-fill" style={{ width: '40%' }}></div>
                </div>

                <div className="goal-status">
                    <span className="status-dot"></span>
                    <span className="status-text">+100pts Daily Goal</span>
                </div>
            </div>
        </div>
    );
};
