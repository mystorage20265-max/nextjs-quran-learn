'use client';

/**
 * Enhanced Audio Visualizer
 * Real-time FFT-based visualizations with 4 modes
 */

import React, { useRef, useEffect } from 'react';

export type VisualizationMode = 'bars' | 'waveform' | 'circle' | 'spectrum';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    mode?: VisualizationMode;
    color?: string;
    height?: number;
    isPlaying?: boolean;
}

export default function AudioVisualizer({
    analyser,
    mode = 'bars',
    color = '#1a73e8',
    height = 100,
    isPlaying = false,
}: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        if (!canvasRef.current || !analyser || !isPlaying) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            switch (mode) {
                case 'bars':
                    drawBars(ctx, dataArray, canvas.offsetWidth, canvas.offsetHeight, color);
                    break;
                case 'waveform':
                    drawWaveform(ctx, dataArray, canvas.offsetWidth, canvas.offsetHeight, color);
                    break;
                case 'circle':
                    drawCircle(ctx, dataArray, canvas.offsetWidth, canvas.offsetHeight, color);
                    break;
                case 'spectrum':
                    drawSpectrum(ctx, dataArray, canvas.offsetWidth, canvas.offsetHeight, color);
                    break;
            }
        };

        draw();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [analyser, mode, color, isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full"
            style={{ height: `${height}px` }}
        />
    );
}

/**
 * Draw bars visualization
 */
function drawBars(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string
) {
    const barCount = 64;
    const barWidth = width / barCount;
    const step = Math.floor(dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = (value / 255) * height * 0.9;
        const x = i * barWidth;
        const y = height - barHeight;

        // Gradient
        const gradient = ctx.createLinearGradient(0, height, 0, y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}80`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        ctx.shadowBlur = 0;
    }
}

/**
 * Draw waveform visualization
 */
function drawWaveform(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string
) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;

    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 255;
        const y = v * height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
}

/**
 * Draw circular visualization
 */
function drawCircle(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string
) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    const barCount = 128;
    const step = Math.floor(dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = (value / 255) * radius * 0.8;
        const angle = (i / barCount) * Math.PI * 2;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Gradient
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `${color}40`);
        gradient.addColorStop(1, color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = `${color}40`;
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Draw spectrum analyzer
 */
function drawSpectrum(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string
) {
    const barCount = 128;
    const barWidth = width / barCount;
    const step = Math.floor(dataArray.length / barCount);

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = (value / 255) * height * 0.9;
        const x = i * barWidth;
        const y = height - barHeight;

        if (i === 0) {
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}20`);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line on top
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = (value / 255) * height * 0.9;
        const x = i * barWidth;
        const y = height - barHeight;
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;
}
