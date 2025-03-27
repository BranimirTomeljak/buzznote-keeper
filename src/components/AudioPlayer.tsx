
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { t } from '@/utils/translations';

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Convert base64 to blob URL if needed
  useEffect(() => {
    if (!audioUrl) return;
    
    // Check if the URL starts with "data:" or "blob:" to determine if it's a base64 string or already a blob URL
    if (audioUrl.startsWith('data:')) {
      // It's already a data URL, use it directly
      setLocalAudioUrl(audioUrl);
    } else if (audioUrl.startsWith('blob:')) {
      // It's already a blob URL, use it directly
      setLocalAudioUrl(audioUrl);
    } else {
      // Assume it's a base64 string without the data URL prefix
      try {
        const dataUrl = `data:audio/wav;base64,${audioUrl}`;
        setLocalAudioUrl(dataUrl);
      } catch (error) {
        console.error('Error creating audio URL:', error);
        setLocalAudioUrl(null);
      }
    }
    
    return () => {
      // Clean up blob URL if we created one
      if (localAudioUrl && localAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localAudioUrl);
      }
    };
  }, [audioUrl]);
  
  // Reset audio when URL changes
  useEffect(() => {
    if (!localAudioUrl) return;
    
    const setupAudio = () => {
      // Clean up previous audio instance
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
      }
      
      // Create a new audio instance
      const audio = new Audio();
      
      // Set up event listeners before setting the source
      audio.addEventListener('loadedmetadata', () => {
        setIsLoaded(true);
        if (isFinite(audio.duration)) {
          setDuration(audio.duration);
        } else {
          setDuration(0);
          console.warn('Invalid audio duration detected');
        }
      });
      
      audio.addEventListener('timeupdate', () => {
        if (isFinite(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
        } else {
          setCurrentTime(0);
        }
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsLoaded(false);
        setDuration(0);
      });
      
      // Set the source
      audio.src = localAudioUrl;
      // Preload the audio
      audio.preload = 'auto';
      
      // Store the audio instance
      audioRef.current = audio;
    };
    
    setupAudio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [localAudioUrl]);
  
  const togglePlayPause = () => {
    if (!audioRef.current || !isLoaded) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Force reload if at the beginning
      if (currentTime === 0) {
        audioRef.current.load();
      }
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current || !isLoaded) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const formatTime = (time: number): string => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          aria-label={isPlaying ? t('pause') : t('play')}
          disabled={!localAudioUrl || !isLoaded}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSliderChange}
            className="cursor-pointer"
            disabled={!localAudioUrl || !isLoaded}
          />
        </div>
        
        <div className="text-xs text-muted-foreground min-w-16 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
