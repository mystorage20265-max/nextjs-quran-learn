import { getScholarById, getScholarVideos } from '../../videoData';
import ScholarDetailClient from './ScholarDetailClient';
import { Metadata } from 'next';
import '../../detail-page.css';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const scholar = getScholarById(id);
    if (!scholar) return { title: 'Scholar Not Found' };
    
    return {
        title: `${scholar.name} - Islamic Lectures | LearnQuran+`,
        description: `Experience the latest lectures and sessions by ${scholar.name}. Deepen your Islamic knowledge with our curated video collection.`,
        openGraph: {
            title: `${scholar.name} - Islamic Lectures`,
            description: `Watch lectures and sessions by ${scholar.name}.`,
            images: [scholar.poster],
        }
    };
}

export default async function ScholarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const scholar = getScholarById(id);
    const videos = getScholarVideos(id);

    if (!scholar) {
        return (
            <div className="vg-detail-page">
                <div className="vd-container">
                    <Link href="/video-gallery" className="vd-back">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Gallery
                    </Link>
                    <h1>Scholar not found</h1>
                </div>
            </div>
        );
    }

    return <ScholarDetailClient scholar={scholar} videos={videos} />;
}
