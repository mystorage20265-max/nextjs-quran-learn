'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface EqualizerSettings {
    bands: number[];
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

const PRESETS: Record<string, { bands: number[]; icon: string }> = {
    flat:       { bands: [0,0,0,0,0,0,0,0,0,0],            icon: '〰' },
    'bass-boost':{ bands: [8,6,4,2,0,0,0,0,0,0],           icon: '🔊' },
    treble:     { bands: [0,0,0,0,0,2,4,6,8,10],           icon: '✨' },
    voice:      { bands: [-2,-1,2,4,4,3,2,1,-1,-2],        icon: '🎙' },
    rock:       { bands: [6,4,2,-1,-2,0,2,4,5,6],          icon: '🎸' },
    pop:        { bands: [-1,2,4,4,2,0,-1,-1,2,3],         icon: '🎵' },
    classical:  { bands: [4,3,2,0,0,0,1,2,3,4],            icon: '🎻' },
    jazz:       { bands: [3,2,1,1,-1,-1,0,1,2,3],          icon: '🎷' },
    electronic: { bands: [6,4,1,0,-2,2,1,2,6,8],           icon: '🎛' },
};

export default function EqualizerPanel({
    settings,
    onSettingsChange,
    isOpen,
    onClose,
    equalizerNodes,
}: EqualizerPanelProps) {
    const [localBands, setLocalBands] = useState(settings.bands);

    useEffect(() => { setLocalBands(settings.bands); }, [settings.bands]);

    const handleBandChange = useCallback((index: number, value: number) => {
        const newBands = [...localBands];
        newBands[index] = value;
        setLocalBands(newBands);
        if (equalizerNodes?.[index]) equalizerNodes[index].gain.value = value;
        onSettingsChange({ bands: newBands, preset: 'custom' });
    }, [localBands, equalizerNodes, onSettingsChange]);

    const applyPreset = useCallback((name: string) => {
        const bands = PRESETS[name]?.bands ?? PRESETS.flat.bands;
        setLocalBands(bands);
        equalizerNodes?.forEach((node, i) => { node.gain.value = bands[i] ?? 0; });
        onSettingsChange({ bands, preset: name });
    }, [equalizerNodes, onSettingsChange]);

    // Build SVG path for curve
    const curvePath = (() => {
        const W = 1000, H = 100, mid = H / 2;
        const pts = localBands.map((v, i) => {
            const x = (i / (localBands.length - 1)) * W;
            const y = mid - (v / 12) * (mid * 0.85);
            return [x, y] as [number, number];
        });
        if (pts.length === 0) return '';
        let d = `M ${pts[0][0]},${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) {
            const [px, py] = pts[i - 1];
            const [cx, cy] = pts[i];
            const cpx = (px + cx) / 2;
            d += ` C ${cpx},${py} ${cpx},${cy} ${cx},${cy}`;
        }
        return d;
    })();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 10050,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(6px)',
                }}
            />

            {/* Panel */}
            <div className="eq-panel" style={{
                position: 'fixed', zIndex: 10051,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(96vw, 680px)',
                maxHeight: '92dvh',
                overflowY: 'auto',
                borderRadius: 28,
                background: 'linear-gradient(145deg, #1a0e00 0%, #0f0800 60%, #1c1000 100%)',
                border: '1px solid rgba(245,158,11,0.2)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>

                {/* Header */}
                <div className="eq-panel-header" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid rgba(245,158,11,0.12)',
                    background: 'linear-gradient(90deg, rgba(245,158,11,0.08) 0%, transparent 100%)',
                    borderRadius: '28px 28px 0 0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 14,
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
                            flexShrink: 0,
                        }}>
                            <span className="material-icons-round" style={{ color: 'white', fontSize: 22 }}>equalizer</span>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: '-0.01em' }}>Equalizer</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(245,158,11,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {settings.preset === 'custom' ? 'Custom' : settings.preset.replace('-', ' ')}
                            </p>
                        </div>
                    </div>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.7)', transition: 'all 0.18s', flexShrink: 0,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
                        aria-label="Close equalizer"
                    >
                        <span className="material-icons-round" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="eq-panel-body" style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Presets */}
                    <div>
                        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Presets</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {Object.entries(PRESETS).map(([name, { icon }]) => {
                                const active = settings.preset === name;
                                return (
                                    <button
                                        key={name}
                                        onClick={() => applyPreset(name)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '7px 14px', borderRadius: 9999,
                                            border: active ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                            background: active
                                                ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.15))'
                                                : 'rgba(255,255,255,0.04)',
                                            color: active ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                                            fontSize: 12, fontWeight: active ? 700 : 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.18s',
                                            boxShadow: active ? '0 0 16px rgba(245,158,11,0.25)' : 'none',
                                        }}
                                    >
                                        <span style={{ fontSize: 14 }}>{icon}</span>
                                        {name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Frequency Curve */}
                    <div style={{
                        background: 'rgba(0,0,0,0.4)', borderRadius: 16,
                        border: '1px solid rgba(245,158,11,0.1)',
                        padding: '14px 16px 10px', position: 'relative', overflow: 'hidden',
                    }}>
                        <svg width="100%" viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ display: 'block', height: 60 }}>
                            <defs>
                                <linearGradient id="eq-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f59e0b" />
                                    <stop offset="50%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="#d97706" />
                                </linearGradient>
                                <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Zero line */}
                            <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="6,4" />
                            {/* Fill area */}
                            {curvePath && (
                                <path d={`${curvePath} L 1000,100 L 0,100 Z`} fill="url(#eq-fill)" />
                            )}
                            {/* Curve line */}
                            {curvePath && (
                                <path d={curvePath} fill="none" stroke="url(#eq-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            )}
                        </svg>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            {FREQUENCY_LABELS.map(l => (
                                <span key={l} style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textAlign: 'center', flex: 1 }}>{l}</span>
                            ))}
                        </div>
                    </div>

                    {/* Sliders */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: 20,
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '20px 16px 16px',
                    }}>
                        {/* dB labels */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
                            <span style={{ fontSize: 9, color: 'rgba(245,158,11,0.6)', fontWeight: 700 }}>+12dB</span>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>0dB</span>
                            <span style={{ fontSize: 9, color: 'rgba(245,158,11,0.6)', fontWeight: 700 }}>−12dB</span>
                        </div>

                        <div className="eq-sliders-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                            {localBands.map((value, index) => (
                                <div key={index} className="eq-slider-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                                    {/* Slider wrapper keeps vertical range consistent */}
                                    <div className="eq-slider-wrap" style={{ position: 'relative', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <input
                                            type="range"
                                            min="-12"
                                            max="12"
                                            step="1"
                                            value={value}
                                            onChange={e => handleBandChange(index, Number(e.target.value))}
                                            className="eq-slider"
                                        />
                                    </div>
                                    {/* Value pill */}
                                    <div className="eq-value-pill" style={{
                                        fontSize: 10, fontWeight: 700, minWidth: 28, textAlign: 'center',
                                        padding: '2px 5px', borderRadius: 6,
                                        background: value !== 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                                        color: value !== 0 ? '#fbbf24' : 'rgba(255,255,255,0.35)',
                                        border: value !== 0 ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                                        transition: 'all 0.15s',
                                    }}>
                                        {value > 0 ? `+${value}` : value}
                                    </div>
                                    {/* Freq label */}
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                        {FREQUENCY_LABELS[index]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="eq-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', flex: 1 }}>
                            Drag sliders to sculpt the sound.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => applyPreset('flat')}
                                style={{
                                    padding: '9px 18px', borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Reset
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '9px 22px', borderRadius: 12,
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    border: 'none', color: 'white', fontSize: 13, fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .eq-slider {
                    writing-mode: vertical-lr;
                    direction: rtl;
                    -webkit-appearance: slider-vertical;
                    appearance: auto;
                    width: 6px;
                    height: 110px;
                    cursor: pointer;
                    background: transparent;
                    accent-color: #f59e0b;
                    outline: none;
                    border: none;
                    padding: 0;
                }
                .eq-slider::-webkit-slider-runnable-track {
                    width: 4px;
                    background: linear-gradient(to bottom, rgba(245,158,11,0.15), rgba(245,158,11,0.15));
                    border-radius: 9999px;
                }
                .eq-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    border: 2px solid rgba(255,255,255,0.9);
                    box-shadow: 0 2px 10px rgba(245,158,11,0.6);
                    cursor: grab;
                    margin-left: -7px;
                }
                .eq-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.15); }
                .eq-slider::-moz-range-track {
                    width: 4px;
                    background: rgba(245,158,11,0.15);
                    border-radius: 9999px;
                }
                .eq-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    border: 2px solid rgba(255,255,255,0.9);
                    box-shadow: 0 2px 10px rgba(245,158,11,0.6);
                    cursor: grab;
                }
                @media (max-width: 520px) {
                    .eq-panel { border-radius: 20px !important; }
                    .eq-panel-header { padding: 14px 16px 12px !important; border-radius: 20px 20px 0 0 !important; }
                    .eq-panel-body { padding: 14px 12px 16px !important; gap: 14px !important; }
                    .eq-sliders-row { gap: 2px !important; }
                    .eq-slider-col { gap: 5px !important; }
                    .eq-slider-wrap { height: 80px !important; }
                    .eq-slider { height: 70px; }
                    .eq-value-pill { min-width: 20px !important; font-size: 9px !important; padding: 1px 3px !important; }
                    .eq-footer { gap: 8px !important; }
                    .eq-footer p { font-size: 10px !important; }
                }
                @media (max-width: 380px) {
                    .eq-panel-header { padding: 12px 12px 10px !important; }
                    .eq-panel-body { padding: 10px 8px 14px !important; }
                    .eq-sliders-row { gap: 1px !important; }
                    .eq-slider { height: 60px; }
                    .eq-slider-wrap { height: 68px !important; }
                    .eq-value-pill { min-width: 16px !important; font-size: 8px !important; }
                }
            `}</style>
        </>
    );
}

