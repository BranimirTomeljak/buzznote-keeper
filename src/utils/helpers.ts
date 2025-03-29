
import { Recording, Beehive, Location, PriorityLevel } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique ID
export const generateId = (): string => uuidv4();

// Format the current date as dd.mm.yyyy
export const getFormattedDate = (): string => {
  const date = new Date();
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear()
  ].join('.');
};

// Check if beehive name is unique within a location
export const isBeehiveNameUnique = (
  beehives: Beehive[],
  name: string,
  locationId: string,
  excludeId?: string
): boolean => !beehives.some(
  beehive => 
    beehive.locationId === locationId && 
    beehive.name.toLowerCase() === name.toLowerCase() &&
    beehive.id !== excludeId
);

// Sort recordings by date (newest first)
export const sortByDateDesc = (recordings: Recording[]): Recording[] => 
  [...recordings].sort((a, b) => b.createdAt - a.createdAt);

// Sort recordings by priority and then by date
export const sortByPriorityAndDate = (recordings: Recording[]): Recording[] => {
  const priorityOrder: Record<PriorityLevel, number> = {
    high: 1,
    medium: 2,
    low: 3,
    solved: 4
  };
  
  return [...recordings].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    // If priorities are the same, sort by date (newest first)
    return priorityDiff === 0 ? b.createdAt - a.createdAt : priorityDiff;
  });
};

// Sort items by name
export const sortByName = <T extends { name: string }>(
  items: T[],
  direction: 'asc' | 'desc' = 'asc'
): T[] => [...items].sort((a, b) => {
  const comparison = a.name.localeCompare(b.name);
  return direction === 'asc' ? comparison : -comparison;
});

// Check if the device is online
export const isOnline = (): boolean => navigator.onLine;

// Get CSS classes for priority badges
export const getPriorityBadgeStyles = (priority: PriorityLevel): string => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  switch (priority) {
    case 'high':
      return `bg-red-100 text-red-800 ${baseClasses}`;
    case 'medium':
      return `bg-yellow-100 text-yellow-800 ${baseClasses}`;
    case 'low':
      return `bg-blue-100 text-blue-800 ${baseClasses}`;
    case 'solved':
      return `bg-green-100 text-green-800 ${baseClasses}`;
    default:
      return `bg-gray-100 text-gray-800 ${baseClasses}`;
  }
};
