
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Recording, PriorityLevel } from '@/types';
import { useApp } from '@/contexts/AppContext';
import AudioPlayer from './AudioPlayer';
import PriorityBadge from './PriorityBadge';
import { t } from '@/utils/translations';

interface RecordingCardProps {
  recording: Recording;
  showBeehive?: boolean;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording, showBeehive = false }) => {
  const { deleteRecording, updateRecordingPriority, getBeehiveById, getLocationById } = useApp();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const beehive = getBeehiveById(recording.beehiveId);
  const location = getLocationById(recording.locationId);
  
  const handlePriorityChange = (priority: PriorityLevel) => {
    updateRecordingPriority(recording.id, priority);
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
            <PriorityBadge priority={recording.priority} />
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted">
                <MoreHorizontal size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                  {t('priorityHigh')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                  {t('priorityMedium')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                  {t('priorityLow')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('solved')}>
                  {t('prioritySolved')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                  <Trash size={16} className="mr-2" />
                  {t('delete')}
                </DropdownMenuItem>
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
    </Card>
  );
};

export default RecordingCard;
