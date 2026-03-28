import { getReciterById, getReciterVideos } from '../../videoData';
import ReciterDetailClient from './ReciterDetailClient';
import { Metadata } from 'next';
import '../../detail-page.css';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const reciter = getReciterById(id);
    if (!reciter) return { title: 'Reciter Not Found' };
    
    return {
        title: `${reciter.name} - Quran Recitations | LearnQuran+`,
        description: `Listen to beautiful Quran recitations by ${reciter.name}. Explore a curated collection of videos and lectures.`,
        openGraph: {
            title: `${reciter.name} - Quran Recitations`,
            description: `Listen to beautiful Quran recitations by ${reciter.name}.`,
            images: [reciter.poster],
        }
    };
}

export default async function ReciterDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const reciter = getReciterById(id);
    const videos = getReciterVideos(id);

    if (!reciter) {
        return (
            <div className="vg-detail-page">
                <div className="vd-container">
                    <Link href="/video-gallery" className="vd-back">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Gallery
                    </Link>
                    <h1>Reciter not found</h1>
                </div>
            </div>
        );
    }

    return <ReciterDetailClient reciter={reciter} videos={videos} />;
}
