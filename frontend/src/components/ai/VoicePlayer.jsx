'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function VoicePlayer({ audioUrl, autoPlay = true }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!audioUrl || !audioRef.current) return;

        const audio = audioRef.current;
        audio.src = audioUrl;

        if (autoPlay) {
            audio.play().catch(() => { /* autoplay blocked */ });
        }

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => { setIsPlaying(false); setProgress(0); };
        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [audioUrl, autoPlay]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => { /* handle error */ });
        }
    };

    if (!audioUrl) return null;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <audio ref={audioRef} preload="auto" />

            <button
                onClick={togglePlayPause}
                className="p-1 hover:bg-white/10 rounded-full text-cyan-400 transition-colors"
            >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Progress Bar */}
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-cyan-400/60 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
