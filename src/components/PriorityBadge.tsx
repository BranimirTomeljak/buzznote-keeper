
import React from 'react';
import { PriorityLevel } from '@/types';
import { getPriorityBadgeStyles } from '@/utils/helpers';
import { t } from '@/utils/translations';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
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
    <span className={`${getPriorityBadgeStyles(priority)} ${className}`}>
      {getPriorityText(priority)}
    </span>
  );
};

export default PriorityBadge;
