
export type PriorityLevel = 'high' | 'medium' | 'low' | 'solved';

export type Language = 'hr' | 'en';

export interface Recording {
  id: string;
  date: string; // Format: dd.mm.yyyy
  audioUrl: string; // Can be a base64 string or a blob URL
  priority: PriorityLevel;
  beehiveId: string;
  locationId: string;
  createdAt: number; // timestamp
  lastListened?: number; // timestamp of when the recording was last listened to
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

// Helper for translations
export interface Translations {
  [key: string]: string;
}
