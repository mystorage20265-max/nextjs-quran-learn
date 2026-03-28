'use client';
import { useState, useEffect } from 'react';

export function YouTubeModal({ youtubeId, title, onClose }: { youtubeId: string; title: string; onClose: () => void }) {
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const posterUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

    return (
        <div
            className="vg-modal-overlay"
            onClick={onClose}
        >
            <div
                className="vg-modal-content"
                onClick={e => e.stopPropagation()}
            >
                {!isIframeLoaded && (
                    <div className="vg-modal-loader">
                        <img 
                            src={posterUrl} 
                            alt="" 
                            className="vg-modal-facade"
                        />
                        <div className="vg-loader-spinner">
                            <div className="vg-spinner-inner"></div>
                            <p className="vg-loader-text">Loading Sacred Knowledge...</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="vg-modal-close"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ opacity: isIframeLoaded ? 1 : 0 }}
                    onLoad={() => setIsIframeLoaded(true)}
                />
            </div>

            <style jsx>{`
                .vg-modal-overlay {
                    position: fixed; 
                    inset: 0; 
                    z-index: 10001;
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.95); /* Deeper background */
                    backdrop-filter: blur(8px);
                    animation: vg-fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    padding: 20px;
                }
                .vg-modal-content {
                    position: relative; 
                    width: 100%;
                    max-width: 860px; /* Reduced size for more professional feel */
                    aspect-ratio: 16 / 9;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: #000;
                    animation: vg-modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @media (max-width: 768px) {
                    .vg-modal-content {
                        width: 100%;
                        border-radius: 12px;
                    }
                }
                .vg-modal-loader {
                    position: absolute; inset: 0; z-index: 1; 
                    display: flex; align-items: center; justify-content: center;
                }
                .vg-modal-facade {
                    position: absolute; inset: 0; width: 100%; height: 100%; 
                    object-fit: cover; filter: blur(5px) brightness(0.4);
                }
                .vg-loader-spinner {
                    position: relative; z-index: 2;
                    display: flex; flex-direction: column; align-items: center;
                }
                .vg-spinner-inner {
                    width: 42px; height: 42px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: #f59e0b;
                    border-radius: 50%;
                    animation: vg-spin 1s infinite linear;
                }
                .vg-loader-text {
                    color: white; margin-top: 15px; font-size: 13px; 
                    opacity: 0.7; font-family: 'Lexend', sans-serif;
                    letter-spacing: 0.5px;
                }
                .vg-modal-close {
                    position: absolute; 
                    top: 16px; 
                    right: 16px; 
                    z-index: 20;
                    background: rgba(0, 0, 0, 0.5); 
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%; 
                    width: 36px; 
                    height: 36px;
                    color: white; 
                    cursor: pointer;
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                }
                .vg-modal-close:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.1);
                }
                .vg-modal-close .material-symbols-outlined {
                    font-size: 20px;
                }
                @keyframes vg-modalIn {
                    from { opacity: 0; transform: translateY(30px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes vg-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes vg-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
