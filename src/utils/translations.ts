
import { Translations } from '@/types';

// Croatian translations for the app
export const translations: Translations = {
  // General
  appName: 'BuzzNotes',
  save: 'Spremi',
  cancel: 'Odustani',
  delete: 'Izbriši',
  edit: 'Uredi',
  play: 'Reproduciraj',
  pause: 'Pauziraj',
  done: 'Gotovo',
  name: 'Naziv',
  create: 'Stvori',
  recording: 'Snimanje',
  
  // Dashboard tabs
  locationsTab: 'Pčelinjaci',
  recentNotesTab: 'Nedavne bilješke',
  priorityNotesTab: 'Prioritetne bilješke',
  
  // Locations and beehives
  locations: 'Pčelinjaci',
  location: 'Pčelinjak',
  newLocation: 'Novi pčelinjak',
  editLocation: 'Uredi pčelinjak',
  deleteLocation: 'Izbriši pčelinjak',
  deleteLocationConfirm: 'Jeste li sigurni da želite izbrisati ovaj pčelinjak? Sve košnice i bilješke bit će izgubljene.',
  
  beehives: 'Košnice',
  beehive: 'Košnica',
  newBeehive: 'Nova košnica',
  editBeehive: 'Uredi košnicu',
  deleteBeehive: 'Izbriši košnicu',
  deleteBeehiveConfirm: 'Jeste li sigurni da želite izbrisati ovu košnicu? Sve bilješke bit će izgubljene.',
  
  // Recordings
  noRecordings: 'Nema snimljenih bilješki',
  recordNew: 'Snimi novu bilješku',
  recordingFor: 'Snimanje za',
  selectBeehive: 'Odaberi košnicu',
  selectPriority: 'Odaberi prioritet',
  deleteRecording: 'Izbriši snimku',
  deleteRecordingConfirm: 'Jeste li sigurni da želite izbrisati ovu snimku?',
  
  // Priorities
  priority: 'Prioritet',
  priorityHigh: 'Visok',
  priorityMedium: 'Srednji',
  priorityLow: 'Nizak',
  prioritySolved: 'Riješeno',
  
  // Notifications
  locationCreated: 'Pčelinjak stvoren',
  locationUpdated: 'Pčelinjak ažuriran',
  locationDeleted: 'Pčelinjak izbrisan',
  beehiveCreated: 'Košnica stvorena',
  beehiveUpdated: 'Košnica ažurirana',
  beehiveDeleted: 'Košnica izbrisana',
  recordingCreated: 'Bilješka snimljena',
  recordingDeleted: 'Bilješka izbrisana',
  priorityUpdated: 'Prioritet ažuriran',
  
  // Errors
  errorOccurred: 'Došlo je do pogreške',
  nameRequired: 'Naziv je obavezan',
  nameExists: 'Naziv već postoji',
  locationRequired: 'Odaberi pčelinjak',
  beehiveRequired: 'Odaberi košnicu',
  
  // Misc
  loading: 'Učitavanje...',
  noData: 'Nema podataka',
  from: 'iz',
};

export const t = (key: string): string => {
  return translations[key] || key;
};
