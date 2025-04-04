
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Recording, PriorityLevel } from '@/types';
import { useApp } from '@/contexts/AppContext';
import AudioPlayer from './AudioPlayer';
import PriorityBadge from './PriorityBadge';
import { t } from '@/utils/translations';
import PrioritySelector from './PrioritySelector';
import { Button } from './ui/button';
import { formatTimestamp } from '@/utils/helpers';

interface RecordingCardProps {
  recording: Recording;
  showBeehive?: boolean;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording, showBeehive = false }) => {
  const { deleteRecording, updateRecordingPriority, updateRecordingLastListened, getBeehiveById, getLocationById } = useApp();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPriorityDialog, setShowPriorityDialog] = useState(false);
  
  const beehive = getBeehiveById(recording.beehiveId);
  const location = getLocationById(recording.locationId);
  
  const handlePriorityChange = (priority: PriorityLevel) => {
    updateRecordingPriority(recording.id, priority);
    setShowPriorityDialog(false);
  };
  
  const handleDelete = async () => {
    await deleteRecording(recording.id);
    setShowDeleteDialog(false);
  };

  const handleAudioPlay = () => {
    updateRecordingLastListened(recording.id);
  };
  
  return (
    <Card className="animate-fade-in card-hover overflow-hidden text-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="font-medium text-xl">
              {recording.date}
            </div>
            {showBeehive && beehive && (
              <div className="text-lg text-muted-foreground">
                {beehive.name} {location && <span>{t('from')} {location.name}</span>}
              </div>
            )}
            {recording.lastListened && (
              <div className="text-base text-muted-foreground mt-2 font-medium">
                {t('lastListened')}: {formatTimestamp(recording.lastListened)}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <PriorityBadge 
              priority={recording.priority} 
              onClick={() => setShowPriorityDialog(true)}
              interactive={true}
            />
            <Button 
              onClick={() => setShowDeleteDialog(true)} 
              variant="destructive"
              size="icon"
              className="h-12 w-12"
            >
              <Trash size={24} />
            </Button>
          </div>
        </div>
        <AudioPlayer audioUrl={recording.audioUrl} onPlay={handleAudioPlay} />
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="text-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">{t('deleteRecording')}</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {t('deleteRecordingConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-lg py-3">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground text-lg py-3">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Priority Selection Dialog */}
      <PrioritySelector
        open={showPriorityDialog}
        onOpenChange={setShowPriorityDialog}
        onPriorityChange={handlePriorityChange}
        currentPriority={recording.priority}
      />
    </Card>
  );
};

export default RecordingCard;
