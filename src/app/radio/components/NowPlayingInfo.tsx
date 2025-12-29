'use client';

/**
 * Now Playing Info Component
 * Displays real-time metadata with lyrics and verse highlighting
 */

import React, { useState } from 'react';

interface NowPlayingInfoProps {
    reciterName: string;
    reciterImage?: string;
    surahName: string;
    surahNameArabic: string;
    surahNumber: number;
    currentVerse?: number;
    totalVerses: number;
    reciterBio?: string;
    isLive?: boolean;
}

export default function NowPlayingInfo({
    reciterName,
    reciterImage,
    surahName,
    surahNameArabic,
    surahNumber,
    currentVerse,
    totalVerses,
    reciterBio,
    isLive = false,
}: NowPlayingInfoProps) {
    const [showBio, setShowBio] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with gradient background */}
            <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 overflow-hidden">
                {/* Blur background */}
                {reciterImage && (
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `url(${reciterImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(20px)',
                        }}
                    />
                )}

                {/* Content */}
                <div className="relative h-full flex items-center justify-between px-8">
                    {/* Reciter Info */}
                    <div className="flex items-center gap-6">
                        {reciterImage && (
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                                <img
                                    src={reciterImage}
                                    alt={reciterName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                                {reciterName}
                            </h2>
                            {isLive && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        LIVE
                                    </div>
                                    <span className="text-white/90 text-sm">Broadcasting now</span>
                                </div>
                            )}
                            {reciterBio && (
                                <button
                                    onClick={() => setShowBio(!showBio)}
                                    className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    About the reciter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Surah Info */}
                    <div className="text-right text-white space-y-1">
                        <div className="text-4xl font-bold drop-shadow-lg" style={{ fontFamily: 'serif' }}>
                            {surahNameArabic}
                        </div>
                        <div className="text-xl font-semibold">
                            {surahName}
                        </div>
                        <div className="text-white/80 text-sm">
                            Surah {surahNumber}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio Section */}
            {showBio && reciterBio && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-gray-700 leading-relaxed">{reciterBio}</p>
                    </div>
                </div>
            )}

            {/* Verse Progress */}
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-gray-700">Ayah Progress</h3>
                        <div className="text-2xl font-bold text-gray-900">
                            {currentVerse || 1} / {totalVerses}
                        </div>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-20 h-20">
                        <svg className="transform -rotate-90 w-20 h-20">
                            <circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="#e5e7eb"
                                strokeWidth="6"
                                fill="none"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="url(#gradient)"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 32}`}
                                strokeDashoffset={`${2 * Math.PI * 32 * (1 - ((currentVerse || 1) / totalVerses))}`}
                                className="transition-all duration-300"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1a73e8" />
                                    <stop offset="100%" stopColor="#1557b0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-700">
                                {Math.round(((currentVerse || 1) / totalVerses) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 rounded-full"
                            style={{ width: `${((currentVerse || 1) / totalVerses) * 100}%` }}
                        />
                    </div>

                    {/* Verse markers */}
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Verse 1</span>
                        <span>Verse {totalVerses}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        Share Verse
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors text-sm font-medium text-white shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Bookmark
                    </button>
                </div>
            </div>
        </div>
    );
}
