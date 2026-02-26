/**
 * Audio Duration Utility
 *
 * Extracts or estimates the duration (in minutes) of an audio file.
 * Used for per-minute billing of STT and TTS.
 *
 * Strategy:
 *   1. WAV files → parse RIFF header (exact, zero-dependency)
 *   2. Other formats → estimate from file size using typical bitrate
 *
 * Returns duration in minutes (float), minimum 0.1 (6 seconds)
 * so every call costs at least 1 credit unit when rounded up (ceil).
 */

import fs from "fs";

// Minimum billable duration in minutes (~6 seconds)
const MIN_DURATION_MINUTES = 0.1;

/**
 * Reads the WAV RIFF header to extract exact duration.
 * WAV format: RIFF chunk → fmt subchunk → data subchunk
 *
 * @param {Buffer} buf - File buffer (first 44+ bytes is enough)
 * @returns {number|null} Duration in minutes, or null if not a valid WAV
 */
const parseWavDuration = (buf) => {
    try {
        // Validate RIFF signature
        if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
        if (buf.toString("ascii", 8, 12) !== "WAVE") return null;

        // fmt subchunk starts at offset 12
        // audioFormat (2), numChannels (2), sampleRate (4), byteRate (4),
        // blockAlign (2), bitsPerSample (2)
        const numChannels = buf.readUInt16LE(22);
        const sampleRate = buf.readUInt32LE(24);
        const bitsPerSample = buf.readUInt16LE(34);

        if (sampleRate === 0 || numChannels === 0 || bitsPerSample === 0) return null;

        const bytesPerSample = bitsPerSample / 8;
        const bytesPerSecond = sampleRate * numChannels * bytesPerSample;

        // Find the "data" subchunk (may not always be at offset 36 if extra chunks exist)
        let offset = 12;
        let dataSize = null;

        while (offset + 8 <= buf.length) {
            const chunkId = buf.toString("ascii", offset, offset + 4);
            const chunkSize = buf.readUInt32LE(offset + 4);

            if (chunkId === "data") {
                dataSize = chunkSize;
                break;
            }
            offset += 8 + chunkSize;
        }

        if (!dataSize) return null;

        const durationSeconds = dataSize / bytesPerSecond;
        return durationSeconds / 60;
    } catch {
        return null;
    }
};

/**
 * Estimates audio duration from file size.
 * Uses typical compressed audio bitrates as a reference.
 *
 * @param {number} fileSizeBytes
 * @param {string} ext - File extension e.g. ".mp3"
 * @returns {number} Estimated duration in minutes
 */
const estimateDurationFromSize = (fileSizeBytes, ext) => {
    // Typical average bitrates (kbps) for voice recordings
    const bitrates = {
        ".mp3": 64,    // voice-grade MP3
        ".m4a": 48,    // AAC voice
        ".ogg": 48,    // Vorbis voice
        ".flac": 300,  // lossless (conservative)
        ".aac": 48,
        ".webm": 32,   // browser microphone output
        ".wav": 256,   // 16-bit mono @ 16kHz — fallback if header parse fails
    };

    const kbps = bitrates[ext] || 64;
    const bitsPerSecond = kbps * 1000;
    const durationSeconds = (fileSizeBytes * 8) / bitsPerSecond;
    return durationSeconds / 60;
};

/**
 * Returns the duration of an audio file in minutes.
 * Uses WAV header parsing for WAV files; file-size estimation for others.
 * Always returns at least MIN_DURATION_MINUTES.
 *
 * @param {string} filePath - Absolute path to audio file
 * @returns {number} Duration in minutes (≥ 0.1)
 */
export const getAudioDurationMinutes = (filePath) => {
    try {
        const stat = fs.statSync(filePath);
        const ext = filePath.toLowerCase().match(/\.[^.]+$/)?.[0] || "";

        // Attempt exact WAV header parse
        if (ext === ".wav") {
            // Read only first 512 bytes — enough for the header
            const fd = fs.openSync(filePath, "r");
            const headerBuf = Buffer.alloc(512);
            fs.readSync(fd, headerBuf, 0, 512, 0);
            fs.closeSync(fd);

            const wavDuration = parseWavDuration(headerBuf);
            if (wavDuration !== null && wavDuration > 0) {
                return Math.max(MIN_DURATION_MINUTES, wavDuration);
            }
        }

        // Fallback: estimate from file size
        const estimated = estimateDurationFromSize(stat.size, ext);
        return Math.max(MIN_DURATION_MINUTES, estimated);
    } catch (err) {
        console.warn("[AudioDuration] Could not determine duration:", err.message);
        return MIN_DURATION_MINUTES; // bill minimum
    }
};

/**
 * Estimates the speaking duration (minutes) for a TTS text string.
 * Average speaking rate: ~150 words per minute.
 *
 * @param {string} text
 * @returns {number} Estimated duration in minutes (≥ 0.1)
 */
export const getTextSpeakingMinutes = (text) => {
    if (!text) return MIN_DURATION_MINUTES;
    const words = text.trim().split(/\s+/).length;
    const minutes = words / 150; // 150 wpm average speaking pace
    return Math.max(MIN_DURATION_MINUTES, minutes);
};