'use client';

/**
 * Live Station Card Component
 * Premium design for live radio stations with real-time indicators
 */

import React from 'react';
import { LiveStation } from '../lib/api/live-radio-api';

interface LiveStationCardProps {
    station: LiveStation;
    isPlaying: boolean;
    onPlay: (station: LiveStation) => void;
}

export default function LiveStationCard({ station, isPlaying, onPlay }: LiveStationCardProps) {
    return (
        <button
            onClick={() => onPlay(station)}
            className={`group relative text-left w-full bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 focus:outline-none ${isPlaying
                    ? 'border-blue-500/50 ring-2 ring-blue-500/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                {station.imageUrl && (
                    <img
                        src={station.imageUrl}
                        alt={station.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                )}

                {/* LIVE Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg shadow-red-500/25">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                </div>

                {/* Style Badge */}
                {station.style && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-medium border border-white/10">
                            {station.style}
                        </div>
                    </div>
                )}

                {/* Play Button Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isPlaying ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/50'
                    }`}>
                    <div className={`transform transition-all duration-300 ${isPlaying ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                        }`}>
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl">
                            {isPlaying ? (
                                <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Playing Indicator */}
                {isPlaying && (
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
                            <div className="flex items-center justify-between text-white text-xs">
                                <span className="font-medium">Now Playing</span>
                                <div className="flex gap-0.5 items-end h-4">
                                    <div className="w-1 bg-green-400 rounded-full animate-[music-bar_0.5s_ease-in-out_infinite]" style={{ height: '40%' }} />
                                    <div className="w-1 bg-green-400 rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.15s]" style={{ height: '80%' }} />
                                    <div className="w-1 bg-green-400 rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.3s]" style={{ height: '60%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                <h3 className="font-bold text-white line-clamp-1 text-base group-hover:text-blue-400 transition-colors">
                    {station.reciterName || station.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                    {station.description}
                </p>

                {/* Stream Info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                    {station.bitrate && (
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{station.bitrate}kbps</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium text-green-400">Active</span>
                    </div>
                </div>
            </div>

            {/* Keyframes */}
            <style jsx>{`
                @keyframes music-bar {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
            `}</style>
        </button>
    );
}

