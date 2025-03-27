
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Recording, PriorityLevel } from '@/types';
import { useApp } from '@/contexts/AppContext';
import AudioPlayer from './AudioPlayer';
import PriorityBadge from './PriorityBadge';
import { t } from '@/utils/translations';
import PrioritySelector from './PrioritySelector';

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
    <Card className="animate-fade-in card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-medium">{recording.date}</div>
            {showBeehive && beehive && (
              <div className="text-sm text-muted-foreground">
                {beehive.name} {location && <span>{t('from')} {location.name}</span>}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <PriorityBadge 
              priority={recording.priority} 
              onClick={() => setShowPriorityDialog(true)}
              interactive={true}
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted">
                <MoreHorizontal size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <button 
                  onClick={() => setShowDeleteDialog(true)} 
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center hover:bg-accent focus:bg-accent outline-none text-destructive"
                >
                  <Trash size={16} className="mr-2" />
                  {t('delete')}
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <AudioPlayer audioUrl={recording.audioUrl} />
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteRecording')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteRecordingConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
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
