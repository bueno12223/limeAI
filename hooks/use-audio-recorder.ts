import { useState, useRef, useCallback } from "react";

/**
 * Interface defining the return values of the useAudioRecorder hook.
 */
interface UseAudioRecorderReturn {
    /** Indicates if the recorder is currently active (recording or paused). */
    isRecording: boolean;
    /** Indicates if the recording is currently paused. */
    isPaused: boolean;
    /** The current duration of the recording in seconds. */
    recordingTime: number;
    /** Function to initiate the recording session. Requests microphone access. */
    startRecording: () => Promise<void>;
    /** Function to stop the recording session and finalize the audio blob. */
    stopRecording: () => void;
    /** Function to toggle the recording state between paused and active. */
    togglePauseResume: () => void;
    /** The resulting audio Blob after recording stops. Null if no recording exists. */
    audioBlob: Blob | null;
    /** Function to clear the recorded audio and reset the state. */
    clearAudio: () => void;
}

/**
 * Custom hook for managing audio recording via the MediaRecorder API.
 * 
 * Provides methods to start, stop, pause, and resume recording, as well as 
 * tracks the recording duration. formatting the output as an audio/mp3 Blob.
 *
 * @returns {UseAudioRecorderReturn} An object containing the state and handlers for audio recording.
 */
export const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback(() => {
        timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/mp3" });
                setAudioBlob(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            startTimer();
        } catch (error) {
            console.error(error);
        }
    }, [startTimer]);

    const togglePauseResume = useCallback(() => {
        if (mediaRecorderRef.current) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
                startTimer();
                return;
            }
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            stopTimer();
        }
    }, [isPaused, startTimer, stopTimer]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            stopTimer();
        }
    }, [isRecording, stopTimer]);

    const clearAudio = useCallback(() => {
        setAudioBlob(null);
        setRecordingTime(0);
    }, []);

    return {
        isRecording,
        isPaused,
        recordingTime,
        startRecording,
        stopRecording,
        togglePauseResume,
        audioBlob,
        clearAudio,
    };
};
