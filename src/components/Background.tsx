import React, { useEffect, useRef } from 'react';
import { useVideo } from '../context/VideoContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  showVideo?: boolean;
}

export const Background = ({ showVideo = false }: Props) => {
  const { isPlaying, setIsPlaying } = useVideo();
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isUnmountingRef = useRef(false);
  const playAttemptRef = useRef<number>();
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
      
      const playVideo = async () => {
        if (isUnmountingRef.current || !videoRef.current || !showVideo) return;

        try {
          await videoRef.current.play();
        } catch (error) {
          // Only retry if component is still mounted and error is not user-initiated
          if (!isUnmountingRef.current && error.name !== 'AbortError') {
            console.error('Video playback error:', error);
            // Retry playback after a short delay
            playAttemptRef.current = window.setTimeout(playVideo, 1000);
          }
        }
      };

      if (showVideo && !isPlaying) {
        if (playAttemptRef.current) {
          clearTimeout(playAttemptRef.current);
        }
        videoRef.current.pause();
      } else {
        playVideo();
      }
      
      const handleEnded = () => {
        if (isUnmountingRef.current) return;
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      };
      
      videoRef.current.addEventListener('ended', handleEnded);
      return () => {
        isUnmountingRef.current = true;
        if (playAttemptRef.current) {
          clearTimeout(playAttemptRef.current);
        }
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current = null;
        }
        videoRef.current?.removeEventListener('ended', handleEnded);
      };
    }
  }, [isPlaying, showVideo, setIsPlaying]);

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/80 to-white dark:from-[#1a2628] dark:to-[#2C3B3E]" />

        {/* Video overlay (only shown when showVideo=true) */}
        {showVideo && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover opacity-30 dark:opacity-50 transition-opacity duration-300"
            style={{ 
              filter: 'hue-rotate(45deg) brightness(1.4) contrast(1.2) saturate(1.4)'
            }}
          >
            <source 
              src="https://shqxzdmypssxkqmvsegt.supabase.co/storage/v1/object/sign/Media%20(Headzpace)/Headzpace-bg-vd-1.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJNZWRpYSAoSGVhZHpwYWNlKS9IZWFkenBhY2UtYmctdmQtMS5tcDQiLCJpYXQiOjE3NDExODk5MDMsImV4cCI6MjA1NjU0OTkwM30.t3_52fN604SI8to9BPg9OtYC1D4N-b1THqRTRviS8gk"
              type="video/mp4" 
            />
          </video>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent dark:to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent dark:from-cyan-500/10" />
      </div>
    </div>
  );
};