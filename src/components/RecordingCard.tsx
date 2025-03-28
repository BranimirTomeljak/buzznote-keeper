
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

interface RecordingCardProps {
  recording: Recording;
  showBeehive?: boolean;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording, showBeehive = false }) => {
  const { deleteRecording, updateRecordingPriority, getBeehiveById, getLocationById } = useApp();
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
  
  return (
    <Card className="animate-fade-in card-hover overflow-hidden text-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="font-medium text-xl">{recording.date}</div>
            {showBeehive && beehive && (
              <div className="text-base text-muted-foreground">
                {beehive.name} {location && <span>{t('from')} {location.name}</span>}
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
              className="h-10 w-10"
            >
              <Trash size={20} />
            </Button>
          </div>
        </div>
        <AudioPlayer audioUrl={recording.audioUrl} />
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="text-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">{t('deleteRecording')}</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {t('deleteRecordingConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground text-base">
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
