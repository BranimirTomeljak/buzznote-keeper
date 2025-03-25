
// Replace the existing file with the updated translations

const translations = {
  // Common
  appName: 'BuzzNotes',
  cancel: 'Odustani',
  save: 'Spremi',
  delete: 'Obriši',
  create: 'Kreiraj',
  edit: 'Uredi',
  name: 'Naziv',
  loading: 'Učitavanje...',
  error: 'Greška',
  search: 'Pretraži',
  noData: 'Nema podataka',
  from: 'iz',
  
  // Authentication
  username: 'Korisničko ime',
  password: 'Lozinka',
  email: 'Email',
  login: 'Prijava',
  signup: 'Registracija',
  logout: 'Odjava',
  forgotPassword: 'Zaboravili ste lozinku?',
  alreadyHaveAccount: 'Već imate račun?',
  dontHaveAccount: 'Nemate račun?',
  resetPassword: 'Resetiraj lozinku',
  invalidCredentials: 'Nevažeći podaci za prijavu',
  signupSuccess: 'Uspješna registracija. Provjerite email za potvrdu.',
  passwordResetSent: 'Upute za resetiranje lozinke poslane su na vaš email.',
  signInWithEmail: 'Prijava putem emaila',
  signUpWithEmail: 'Registracija putem emaila',
  orContinueWith: 'ili nastavite s',
  
  // Navigation
  locations: 'Lokacije',
  recent: 'Nedavno',
  priority: 'Prioriteti',
  settings: 'Postavke',
  
  // Locations
  location: 'Lokacija',
  newLocation: 'Nova lokacija',
  editLocation: 'Uredi lokaciju',
  deleteLocation: 'Obriši lokaciju',
  deleteLocationConfirm: 'Jeste li sigurni da želite obrisati ovu lokaciju? Ovo će također obrisati sve košnice i snimke na ovoj lokaciji.',
  locationCreated: 'Lokacija kreirana',
  locationUpdated: 'Lokacija ažurirana',
  locationDeleted: 'Lokacija obrisana',
  noLocations: 'Nema lokacija',
  selectLocation: 'Odaberi lokaciju',
  
  // Beehives
  beehive: 'Košnica',
  beehives: 'Košnice',
  newBeehive: 'Nova košnica',
  editBeehive: 'Uredi košnicu',
  deleteBeehive: 'Obriši košnicu',
  deleteBeehiveConfirm: 'Jeste li sigurni da želite obrisati ovu košnicu? Ovo će također obrisati sve snimke za ovu košnicu.',
  beehiveCreated: 'Košnica kreirana',
  beehiveUpdated: 'Košnica ažurirana',
  beehiveDeleted: 'Košnica obrisana',
  noBeehives: 'Nema košnica',
  selectBeehive: 'Odaberi košnicu',
  searchBeehives: 'Pretraži košnice',
  
  // Recordings
  recording: 'Snimka',
  recordings: 'Snimke',
  recordNew: 'Nova bilješka',
  deleteRecording: 'Obriši snimku',
  deleteRecordingConfirm: 'Jeste li sigurni da želite obrisati ovu snimku?',
  recordingCreated: 'Snimka kreirana',
  recordingDeleted: 'Snimka obrisana',
  noRecordings: 'Nema snimki',
  recentRecordings: 'Nedavne',
  priorityRecordings: 'Prioriteti',
  
  // Voice Recorder
  recording: 'Snimanje...',
  recordingFor: 'Snimanje za',
  selectPriority: 'Odaberi prioritet',
  
  // Priorities
  priorityHigh: 'Visoki',
  priorityMedium: 'Srednji',
  priorityLow: 'Niski',
  prioritySolved: 'Riješeno',
  priorityUpdated: 'Prioritet ažuriran',
  
  // Sync
  sync: 'Sinkroniziraj',
  syncSuccess: 'Sinkronizacija uspješna',
  syncError: 'Greška pri sinkronizaciji',
  lastSynced: 'Zadnja sinkronizacija',
  
  // Sorting
  sort: 'Sortiraj',
  nameAscending: 'Po imenu (A-Ž)',
  nameDescending: 'Po imenu (Ž-A)',
  
  // Validation
  nameExists: 'Naziv već postoji',
  errorOccurred: 'Došlo je do greške',
  
  // Authentication
  signOut: 'Odjava',
  signedOut: 'Odjavljeni ste',
  signedOutMessage: 'Uspješno ste se odjavili iz aplikacije',
};

export const t = (key: keyof typeof translations): string => {
  return translations[key] || key;
};
