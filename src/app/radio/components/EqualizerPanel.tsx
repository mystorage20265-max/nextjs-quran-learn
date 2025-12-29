'use client';

/**
 * Equalizer Panel Component
 * 10-band graphic equalizer with presets
 */

import React, { useState, useEffect } from 'react';

export interface EqualizerSettings {
    bands: number[]; // 10 bands, -12 to +12 dB
    preset: string;
}

interface EqualizerPanelProps {
    settings: EqualizerSettings;
    onSettingsChange: (settings: EqualizerSettings) => void;
    isOpen: boolean;
    onClose: () => void;
    equalizerNodes?: BiquadFilterNode[];
}

const FREQUENCY_LABELS = ['31', '62', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

const PRESETS: Record<string, number[]> = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'bass-boost': [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
    treble: [0, 0, 0, 0, 0, 2, 4, 6, 8, 10],
    voice: [-2, -1, 2, 4, 4, 3, 2, 1, -1, -2],
    vocal: [-2, -2, -1, 1, 3, 3, 2, 1, -1, -2],
    rock: [6, 4, 2, -1, -2, 0, 2, 4, 5, 6],
    pop: [-1, 2, 4, 4, 2, 0, -1, -1, 2, 3],
    classical: [4, 3, 2, 0, 0, 0, 1, 2, 3, 4],
    jazz: [3, 2, 1, 1, -1, -1, 0, 1, 2, 3],
    electronic: [6, 4, 1, 0, -2, 2, 1, 2, 6, 8],
};

export default function EqualizerPanel({
    settings,
    onSettingsChange,
    isOpen,
    onClose,
    equalizerNodes,
}: EqualizerPanelProps) {
    const [localBands, setLocalBands] = useState(settings.bands);

    useEffect(() => {
        setLocalBands(settings.bands);
    }, [settings.bands]);

    const handleBandChange = (index: number, value: number) => {
        const newBands = [...localBands];
        newBands[index] = value;
        setLocalBands(newBands);

        // Apply to audio nodes immediately
        if (equalizerNodes && equalizerNodes[index]) {
            equalizerNodes[index].gain.value = value;
        }

        onSettingsChange({
            bands: newBands,
            preset: 'custom',
        });
    };

    const applyPreset = (presetName: string) => {
        const presetBands = PRESETS[presetName] || PRESETS.flat;
        setLocalBands(presetBands);

        // Apply to audio nodes
        if (equalizerNodes) {
            presetBands.forEach((value, index) => {
                if (equalizerNodes[index]) {
                    equalizerNodes[index].gain.value = value;
                }
            });
        }

        onSettingsChange({
            bands: presetBands,
            preset: presetName,
        });
    };

    const resetEqualizer = () => {
        applyPreset('flat');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a73e8] to-[#1557b0] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <h2 className="text-xl font-bold text-white">Equalizer</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Presets */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">Presets</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(PRESETS).map(presetName => (
                                <button
                                    key={presetName}
                                    onClick={() => applyPreset(presetName)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${settings.preset === presetName
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {presetName.charAt(0).toUpperCase() + presetName.slice(1).replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Frequency Bands */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">Frequency Bands (Hz)</h3>
                            <button
                                onClick={resetEqualizer}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Reset to Flat
                            </button>
                        </div>

                        {/* Visual EQ Display */}
                        <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-end justify-between gap-2 h-48">
                                {localBands.map((value, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        {/* Slider */}
                                        <input
                                            type="range"
                                            min="-12"
                                            max="12"
                                            step="1"
                                            value={value}
                                            onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                                            className="h-32 slider-vertical"
                                            style={{
                                                writingMode: 'bt-lr',
                                                WebkitAppearance: 'slider-vertical',
                                                width: '8px',
                                            }}
                                        />

                                        {/* Value Display */}
                                        <div className="text-xs font-semibold text-gray-700 min-w-[32px] text-center">
                                            {value > 0 ? '+' : ''}{value}
                                        </div>

                                        {/* Frequency Label */}
                                        <div className="text-xs text-gray-500 font-medium">
                                            {FREQUENCY_LABELS[index]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Frequency Response Curve Visualization */}
                        <div className="bg-gray-900 rounded-xl p-4 h-24 relative overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                {/* Grid lines */}
                                <line x1="0" y1="50" x2="1000" y2="50" stroke="#374151" strokeWidth="1" strokeDasharray="5,5" />

                                {/* Response curve */}
                                <polyline
                                    points={localBands.map((value, i) => {
                                        const x = (i / (localBands.length - 1)) * 1000;
                                        const y = 50 - (value / 12) * 40;
                                        return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Labels */}
                            <div className="absolute top-2 left-2 text-xs text-gray-400">+12dB</div>
                            <div className="absolute bottom-2 left-2 text-xs text-gray-400">-12dB</div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-blue-800">
                                Adjust frequency bands to shape the sound. Use presets for quick adjustments or create your custom sound profile.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        input[type="range"].slider-vertical {
          transform: rotate(-90deg);
          transform-origin: center;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a73e8, #1557b0);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a73e8, #1557b0);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-track {
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
        }
      `}</style>
        </div>
    );
}
