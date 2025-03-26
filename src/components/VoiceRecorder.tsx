
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, CheckSquare, ArrowUp, Info, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityLevel } from '@/types';
import { t } from '@/utils/translations';
import { useApp } from '@/contexts/AppContext';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string, priority: PriorityLevel, beehiveId: string, locationId: string) => void;
  onCancel: () => void;
  beehiveName?: string;
  beehiveId?: string;
  locationId?: string;
  showBeehiveSelect?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  onCancel,
  beehiveName,
  beehiveId,
  locationId,
  showBeehiveSelect = false
}) => {
  const { beehives, locations, getBeehivesByLocation } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('medium');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationId || (locations.length > 0 ? locations[0].id : ''));
  const [selectedBeehiveId, setSelectedBeehiveId] = useState<string>(beehiveId || '');
  const [step, setStep] = useState<'select' | 'record' | 'priority'>(beehiveId ? 'record' : 'select');
  
  const beehivesInLocation = selectedLocationId ? getBeehivesByLocation(selectedLocationId) : [];
  
  // Set initial beehive if location changed and we have beehives
  useEffect(() => {
    if (selectedLocationId && beehivesInLocation.length > 0 && !selectedBeehiveId) {
      setSelectedBeehiveId(beehivesInLocation[0].id);
    }
  }, [selectedLocationId, beehivesInLocation, selectedBeehiveId]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Setup recorder only when in recording step
  useEffect(() => {
    if (step !== 'record') return;
    
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
          setStep('priority');
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
  }, [step]);
  
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
      // Use provided beehiveId/locationId or the selected ones
      const finalBeehiveId = beehiveId || selectedBeehiveId;
      const finalLocationId = locationId || selectedLocationId;
      
      if (!finalBeehiveId || !finalLocationId) {
        console.error('No beehive or location selected');
        return;
      }
      
      onRecordingComplete(audioUrl, selectedPriority, finalBeehiveId, finalLocationId);
    }
  };
  
  const handleStartRecording = () => {
    setStep('record');
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const renderBeehiveSelection = () => {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center mb-6">{t('selectBeehiveToRecord')}</h2>
        
        <div className="mt-4 mb-6 space-y-4">
          <div>
            <Label htmlFor="locationSelect">{t('location')}</Label>
            <Select
              value={selectedLocationId}
              onValueChange={setSelectedLocationId}
            >
              <SelectTrigger id="locationSelect" className="mt-2">
                <SelectValue placeholder={t('selectLocation')} />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="beehiveSelect">{t('beehive')}</Label>
            <Select
              value={selectedBeehiveId}
              onValueChange={setSelectedBeehiveId}
              disabled={beehivesInLocation.length === 0}
            >
              <SelectTrigger id="beehiveSelect" className="mt-2">
                <SelectValue placeholder={t('selectBeehive')} />
              </SelectTrigger>
              <SelectContent>
                {beehivesInLocation.map(beehive => (
                  <SelectItem key={beehive.id} value={beehive.id}>
                    {beehive.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
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
            onClick={handleStartRecording}
            disabled={!selectedBeehiveId || !selectedLocationId}
          >
            {t('startRecording')}
          </Button>
        </div>
      </div>
    );
  };
  
  const renderRecording = () => {
    const selectedBeehive = beehives.find(b => b.id === (beehiveId || selectedBeehiveId));
    
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center mb-1">
          {isRecording ? t('recordingStatus') : t('recordingFor')}
        </h2>
        
        <p className="text-center text-muted-foreground mb-6">
          {selectedBeehive?.name || beehiveName}
        </p>
        
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
      </div>
    );
  };
  
  const renderPrioritySelection = () => {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center mb-6">{t('selectPriority')}</h2>
        
        <div className="mb-6">
          <audio 
            src={audioUrl} 
            controls 
            className="w-full h-12 mb-6"
          />
          
          <div className="space-y-4">
            <div className="space-y-3">
              <button 
                onClick={() => setSelectedPriority('high')}
                className={`w-full flex items-center gap-3 bg-red-100 text-red-800 p-4 rounded-lg ${selectedPriority === 'high' ? 'ring-2 ring-red-500' : ''}`}
              >
                <ArrowUp className="text-red-600" size={20} />
                <span className="text-left font-medium">{t('priorityHigh')}</span>
                {selectedPriority === 'high' && <Check className="ml-auto text-red-600" size={18} />}
              </button>
              
              <button 
                onClick={() => setSelectedPriority('medium')}
                className={`w-full flex items-center gap-3 bg-yellow-100 text-yellow-800 p-4 rounded-lg ${selectedPriority === 'medium' ? 'ring-2 ring-yellow-500' : ''}`}
              >
                <Info className="text-yellow-600" size={20} />
                <span className="text-left font-medium">{t('priorityMedium')}</span>
                {selectedPriority === 'medium' && <Check className="ml-auto text-yellow-600" size={18} />}
              </button>
              
              <button 
                onClick={() => setSelectedPriority('low')}
                className={`w-full flex items-center gap-3 bg-green-100 text-green-800 p-4 rounded-lg ${selectedPriority === 'low' ? 'ring-2 ring-green-500' : ''}`}
              >
                <ArrowDown className="text-green-600" size={20} />
                <span className="text-left font-medium">{t('priorityLow')}</span>
                {selectedPriority === 'low' && <Check className="ml-auto text-green-600" size={18} />}
              </button>
              
              <button 
                onClick={() => setSelectedPriority('solved')}
                className={`w-full flex items-center gap-3 bg-blue-100 text-blue-800 p-4 rounded-lg ${selectedPriority === 'solved' ? 'ring-2 ring-blue-500' : ''}`}
              >
                <Check className="text-blue-600" size={20} />
                <span className="text-left font-medium">{t('prioritySolved')}</span>
                {selectedPriority === 'solved' && <Check className="ml-auto text-blue-600" size={18} />}
              </button>
            </div>
          </div>
        </div>
        
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
          >
            {t('save')}
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {step === 'select' && renderBeehiveSelection()}
        {step === 'record' && renderRecording()}
        {step === 'priority' && renderPrioritySelection()}
      </div>
    </div>
  );
};

export default VoiceRecorder;
