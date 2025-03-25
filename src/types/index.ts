
export type PriorityLevel = 'high' | 'medium' | 'low' | 'solved';

export interface Recording {
  id: string;
  date: string; // Format: dd.mm.yyyy
  audioUrl: string;
  priority: PriorityLevel;
  beehiveId: string;
  locationId: string;
  createdAt: number; // timestamp
}

export interface Beehive {
  id: string;
  name: string;
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
}

// Helper for Croatian translations
export interface Translations {
  [key: string]: string;
}
