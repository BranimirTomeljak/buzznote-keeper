
import React, { useState } from 'react';
import { Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Beehive } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/utils/translations';

interface BeehiveCardProps {
  beehive: Beehive;
  onOpenRecorder: (beehiveId: string, locationId: string) => void;
  onBeehiveSelect?: (beehiveId: string) => void;
}

const BeehiveCard: React.FC<BeehiveCardProps> = ({ 
  beehive, 
  onOpenRecorder,
  onBeehiveSelect
}) => {
  const { updateBeehive, deleteBeehive, recordings, locations } = useApp();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [name, setName] = useState(beehive.name);
  const [selectedLocationId, setSelectedLocationId] = useState(beehive.locationId);
  
  const recordingCount = recordings.filter(rec => rec.beehiveId === beehive.id).length;
  
  const handleSave = async () => {
    if (name.trim()) {
      try {
        await updateBeehive(beehive.id, name.trim(), selectedLocationId);
        setOpenEdit(false);
      } catch (error) {
        // Error is already handled in the context
      }
    }
  };
  
  const handleDelete = async () => {
    await deleteBeehive(beehive.id);
    setOpenDelete(false);
  };

  const handleCardClick = () => {
    if (onBeehiveSelect) {
      onBeehiveSelect(beehive.id);
    }
  };
  
  const handleRecordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenRecorder(beehive.id, beehive.locationId);
  };
  
  return (
    <>
      <Card className="animate-fade-in card-hover">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div 
              className={onBeehiveSelect ? "cursor-pointer flex-1" : "flex-1"} 
              onClick={handleCardClick}
            >
              <h3 className="font-medium text-lg">{beehive.name}</h3>
              <p className="text-sm text-muted-foreground">
                {recordingCount} {recordingCount === 1 ? t('recording') : t('recordings')}
              </p>
            </div>
            <Button 
              onClick={handleRecordClick}
              className="rounded-full w-10 h-10 p-0 record-button"
            >
              <span className="sr-only">{t('recordNew')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-muted/30 flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setOpenEdit(true); }} 
            className="h-8"
          >
            <Edit size={16} className="mr-1" /> {t('edit')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setOpenDelete(true); }} 
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash size={16} className="mr-1" /> {t('delete')}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editBeehive')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('name')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">{t('location')}</Label>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
              >
                <SelectTrigger id="location">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteBeehive')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteBeehiveConfirm')}
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
    </>
  );
};

export default BeehiveCard;
