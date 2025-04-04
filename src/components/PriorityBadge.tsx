
import React from 'react';
import { PriorityLevel } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowUp, Info, ArrowDown, Check } from 'lucide-react';
import { t } from '@/utils/translations';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  className = '',
  onClick,
  interactive = false
}) => {
  const getPriorityStyles = (priority: PriorityLevel): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-50 text-yellow-800'; // Changed to very light yellow
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'solved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="text-red-600" size={14} />;
      case 'medium':
        return <Info className="text-yellow-600" size={14} />;
      case 'low':
        return <ArrowDown className="text-green-600" size={14} />;
      case 'solved':
        return <Check className="text-blue-600" size={14} />;
      default:
        return null;
    }
  };

  const getPriorityText = (priority: PriorityLevel): string => {
    switch (priority) {
      case 'high': return t('priorityHigh');
      case 'medium': return t('priorityMedium');
      case 'low': return t('priorityLow');
      case 'solved': return t('prioritySolved');
      default: return '';
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        getPriorityStyles(priority),
        interactive && "cursor-pointer hover:opacity-90",
        className
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : undefined}
    >
      {getPriorityIcon(priority)}
      <span>{getPriorityText(priority)}</span>
    </div>
  );
};

export default PriorityBadge;
