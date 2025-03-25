
import { PriorityLevel, Recording, Beehive, Location } from '@/types';

// Get formatted date: dd.mm.yyyy
export const getFormattedDate = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

// Generate unique ID with timestamp
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Sort recordings by date (newest first)
export const sortByDateDesc = (recordings: Recording[]): Recording[] => {
  return [...recordings].sort((a, b) => b.createdAt - a.createdAt);
};

// Sort recordings by priority and then by date (oldest first for same priority)
export const sortByPriorityAndDate = (recordings: Recording[]): Recording[] => {
  const priorityWeight: Record<PriorityLevel, number> = {
    high: 4,
    medium: 3,
    low: 2,
    solved: 1
  };
  
  return [...recordings].sort((a, b) => {
    // First sort by priority (high to low)
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by date (oldest first)
    return a.createdAt - b.createdAt;
  });
};

// Check if beehive name is unique within a location
export const isBeehiveNameUnique = (
  beehives: Beehive[],
  name: string,
  locationId: string,
  excludeId?: string
): boolean => {
  return !beehives.some(
    beehive => 
      beehive.locationId === locationId && 
      beehive.name.toLowerCase() === name.toLowerCase() && 
      beehive.id !== excludeId
  );
};

// Get priority class name
export const getPriorityClass = (priority: PriorityLevel): string => {
  return `priority-${priority}`;
};

// Get priority badge styles
export const getPriorityBadgeStyles = (priority: PriorityLevel): string => {
  return `bg-priority-${priority} ${priority === 'low' ? 'text-black' : 'text-white'} px-2 py-1 rounded-full text-xs font-medium`;
};
