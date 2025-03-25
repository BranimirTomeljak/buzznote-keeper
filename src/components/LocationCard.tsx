
import React, { useState } from 'react';
import { Edit, Trash, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Location } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/utils/translations';

interface LocationCardProps {
  location: Location;
  onSelect: (locationId: string) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onSelect }) => {
  const { updateLocation, deleteLocation, getBeehivesByLocation } = useApp();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [name, setName] = useState(location.name);
  
  const beehiveCount = getBeehivesByLocation(location.id).length;
  
  const handleSave = async () => {
    if (name.trim()) {
      await updateLocation(location.id, name.trim());
      setOpenEdit(false);
    }
  };
  
  const handleDelete = async () => {
    await deleteLocation(location.id);
    setOpenDelete(false);
  };
  
  return (
    <>
      <Card className="animate-fade-in card-hover">
        <CardContent className="p-4">
          <div onClick={() => onSelect(location.id)} className="flex justify-between items-center cursor-pointer">
            <div>
              <h3 className="font-medium text-lg">{location.name}</h3>
              <p className="text-sm text-muted-foreground">
                {beehiveCount} {beehiveCount === 1 ? t('beehive') : t('beehives')}
              </p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
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
            <DialogTitle>{t('editLocation')}</DialogTitle>
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
            <AlertDialogTitle>{t('deleteLocation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteLocationConfirm')}
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

export default LocationCard;
