
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash, MoreHorizontal, ArrowUp, Info, ArrowDown, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
            <PriorityBadge priority={recording.priority} />
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted">
                <MoreHorizontal size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <button 
                  onClick={() => setShowPriorityDialog(true)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center hover:bg-accent focus:bg-accent outline-none"
                >
                  {t('changePriority')}
                </button>
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
      <Dialog open={showPriorityDialog} onOpenChange={setShowPriorityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('selectPriority')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <button 
              onClick={() => handlePriorityChange('high')}
              className="w-full flex items-center gap-3 bg-red-100 text-red-800 p-4 rounded-lg"
            >
              <ArrowUp className="text-red-600" size={20} />
              <span className="text-left font-medium">{t('priorityHigh')}</span>
            </button>
            
            <button 
              onClick={() => handlePriorityChange('medium')}
              className="w-full flex items-center gap-3 bg-amber-500 text-white p-4 rounded-lg"
            >
              <Info className="text-white" size={20} />
              <span className="text-left font-medium">{t('priorityMedium')}</span>
            </button>
            
            <button 
              onClick={() => handlePriorityChange('low')}
              className="w-full flex items-center gap-3 bg-green-100 text-green-800 p-4 rounded-lg"
            >
              <ArrowDown className="text-green-600" size={20} />
              <span className="text-left font-medium">{t('priorityLow')}</span>
            </button>
            
            <button 
              onClick={() => handlePriorityChange('solved')}
              className="w-full flex items-center gap-3 bg-blue-100 text-blue-800 p-4 rounded-lg"
            >
              <Check className="text-blue-600" size={20} />
              <span className="text-left font-medium">{t('prioritySolved')}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecordingCard;
