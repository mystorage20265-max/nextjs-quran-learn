'use client';
import { useState } from 'react';
import Link from 'next/link';
import { YouTubeModal } from '../../components/YouTubeModal';

interface Video {
    id: string;
    youtubeId?: string;
    title: string;
}

interface Reciter {
    id: string;
    name: string;
    label: string;
    poster: string;
}

export default function ReciterDetailClient({ reciter, videos }: { reciter: Reciter; videos: Video[] }) {
    const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

    return (
        <div className="vg-detail-page">
            <div className="vd-hero">
                <div className="vd-hero-bg">
                    <img src={reciter.poster} alt={reciter.name} />
                </div>
                <div className="vd-hero-content">
                    <span className="vd-badge">Quran Reciter</span>
                    <h1 className="vd-title">{reciter.name}</h1>
                    <p className="vd-label">{reciter.label} • {videos.length} Videos</p>
                </div>
            </div>

            <div className="vd-container">
                <Link href="/video-gallery" className="vd-back">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Gallery
                </Link>

                <div className="vd-section-header">
                    <h2 className="vd-section-title">All Recitations</h2>
                </div>

                <div className="vd-grid">
                    {videos.map((video) => (
                        <div 
                            key={video.id} 
                            className="vd-video-card"
                            onClick={() => setActiveVideo({ id: video.youtubeId!, title: video.title })}
                        >
                            <div className="vd-card-poster">
                                <img 
                                    src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} 
                                    alt={video.title} 
                                    loading="lazy"
                                />
                                <div className="vd-card-play">
                                    <div className="vd-play-icon">
                                        <span className="material-symbols-outlined">play_arrow</span>
                                    </div>
                                </div>
                            </div>
                            <div className="vd-card-body">
                                <h3 className="vd-card-title">{video.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {activeVideo && (
                <YouTubeModal 
                    youtubeId={activeVideo.id} 
                    title={activeVideo.title} 
                    onClose={() => setActiveVideo(null)} 
                />
            )}
        </div>
    );
}
