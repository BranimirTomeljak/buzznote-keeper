
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUp, Info, ArrowDown, Check } from 'lucide-react';
import { PriorityLevel } from '@/types';
import { t } from '@/utils/translations';

interface PrioritySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPriorityChange: (priority: PriorityLevel) => void;
  currentPriority?: PriorityLevel;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  open,
  onOpenChange,
  onPriorityChange,
  currentPriority
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('selectPriority')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-3">
          <button 
            onClick={() => onPriorityChange('high')}
            className="w-full flex items-center gap-3 bg-red-100 text-red-800 p-4 rounded-lg"
          >
            <ArrowUp className="text-red-600" size={20} />
            <span className="text-left font-medium">{t('priorityHigh')}</span>
            {currentPriority === 'high' && <Check className="ml-auto text-red-600" size={18} />}
          </button>
          
          <button 
            onClick={() => onPriorityChange('medium')}
            className="w-full flex items-center gap-3 bg-yellow-50 text-yellow-800 p-4 rounded-lg"
          >
            <Info className="text-yellow-600" size={20} />
            <span className="text-left font-medium">{t('priorityMedium')}</span>
            {currentPriority === 'medium' && <Check className="ml-auto text-yellow-600" size={18} />}
          </button>
          
          <button 
            onClick={() => onPriorityChange('low')}
            className="w-full flex items-center gap-3 bg-green-100 text-green-800 p-4 rounded-lg"
          >
            <ArrowDown className="text-green-600" size={20} />
            <span className="text-left font-medium">{t('priorityLow')}</span>
            {currentPriority === 'low' && <Check className="ml-auto text-green-600" size={18} />}
          </button>
          
          <button 
            onClick={() => onPriorityChange('solved')}
            className="w-full flex items-center gap-3 bg-blue-100 text-blue-800 p-4 rounded-lg"
          >
            <Check className="text-blue-600" size={20} />
            <span className="text-left font-medium">{t('prioritySolved')}</span>
            {currentPriority === 'solved' && <Check className="ml-auto text-blue-600" size={18} />}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrioritySelector;
