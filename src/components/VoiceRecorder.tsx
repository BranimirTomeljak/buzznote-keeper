
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PriorityLevel } from '@/types';
import { t } from '@/utils/translations';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string, priority: PriorityLevel) => void;
  onCancel: () => void;
  beehiveName: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  onCancel,
  beehiveName
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('medium');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Request microphone permission and set up recorder
  useEffect(() => {
    const setupRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
          audioChunksRef.current = [];
        };
        
        // Auto-start recording
        startRecording();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    setupRecorder();
    
    return () => {
      // Cleanup
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = () => {
    if (mediaRecorderRef.current && !isRecording) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const handleSave = () => {
    if (audioUrl) {
      onRecordingComplete(audioUrl, selectedPriority);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-center mb-1">
            {isRecording ? t('recording') : t('recordingFor')}
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            {beehiveName}
          </p>
          
          {isRecording ? (
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-red-500/50 animate-pulse"></div>
                <Mic className="w-8 h-8 text-red-600 z-10" />
              </div>
              <div className="text-xl font-mono">{formatTime(recordingTime)}</div>
              <Button 
                onClick={stopRecording} 
                variant="outline" 
                className="rounded-full h-12 w-12 p-0"
              >
                <Square className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <>
              {audioUrl && (
                <div className="mb-6">
                  <audio 
                    src={audioUrl} 
                    controls 
                    className="w-full h-12 mb-4"
                  />
                  
                  <div className="space-y-4">
                    <p className="text-sm font-medium">{t('selectPriority')}</p>
                    <RadioGroup 
                      value={selectedPriority} 
                      onValueChange={(value) => setSelectedPriority(value as PriorityLevel)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" className="text-priority-high" />
                        <Label htmlFor="high" className="font-normal">
                          {t('priorityHigh')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" className="text-priority-medium" />
                        <Label htmlFor="medium" className="font-normal">
                          {t('priorityMedium')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" className="text-priority-low" />
                        <Label htmlFor="low" className="font-normal">
                          {t('priorityLow')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solved" id="solved" className="text-priority-solved" />
                        <Label htmlFor="solved" className="font-normal">
                          {t('prioritySolved')}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={onCancel}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSave}
                  disabled={!audioUrl}
                >
                  {t('save')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
