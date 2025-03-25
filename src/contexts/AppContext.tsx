import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  Recording, 
  Beehive, 
  Location, 
  PriorityLevel 
} from '@/types';
import { 
  generateId, 
  getFormattedDate, 
  isBeehiveNameUnique,
  sortByName
} from '@/utils/helpers';
import { t } from '@/utils/translations';
import { useSupabase } from './SupabaseContext';
import { 
  syncLocations,
  syncBeehives,
  syncRecordings,
  deleteFromRemote,
  SyncStatus
} from '@/services/SyncService';

interface AppContextType {
  // State
  locations: Location[];
  beehives: Beehive[];
  recordings: Recording[];
  activeTab: string;
  syncStatus: SyncStatus;
  searchTerm: string;
  sortOrder: 'name-asc' | 'name-desc' | 'priority' | 'date';
  
  // Location actions
  addLocation: (name: string) => Promise<Location>;
  updateLocation: (id: string, name: string) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  
  // Beehive actions
  addBeehive: (name: string, locationId: string) => Promise<Beehive>;
  updateBeehive: (id: string, name: string, locationId?: string) => Promise<void>;
  deleteBeehive: (id: string) => Promise<void>;
  getBeehivesByLocation: (locationId: string) => Beehive[];
  
  // Recording actions
  addRecording: (audioUrl: string, beehiveId: string, locationId: string, priority: PriorityLevel) => Promise<Recording>;
  deleteRecording: (id: string) => Promise<void>;
  updateRecordingPriority: (id: string, priority: PriorityLevel) => Promise<void>;
  
  // Navigation
  setActiveTab: (tab: string) => void;
  
  // Helpers
  getLocationById: (id: string) => Location | undefined;
  getBeehiveById: (id: string) => Beehive | undefined;
  
  // Search and sorting
  setSearchTerm: (term: string) => void;
  setSortOrder: (order: 'name-asc' | 'name-desc' | 'priority' | 'date') => void;
  
  // Sync
  syncData: (manual?: boolean) => Promise<void>;
  getFilteredBeehives: (locationId: string) => Beehive[];
  getRecordingsForLocation: (locationId: string) => Recording[];
  getRecordingsForBeehive: (beehiveId: string) => Recording[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state
  const [locations, setLocations] = useState<Location[]>([]);
  const [beehives, setBeehives] = useState<Beehive[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeTab, setActiveTab] = useState('locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc' | 'priority' | 'date'>('name-asc');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    inProgress: false,
    lastSynced: null,
    error: null
  });
  
  const { user } = useSupabase();
  
  // Load data from localStorage on init
  useEffect(() => {
    const loadData = () => {
      try {
        const storedLocations = localStorage.getItem('buzznotes_locations');
        const storedBeehives = localStorage.getItem('buzznotes_beehives');
        const storedRecordings = localStorage.getItem('buzznotes_recordings');
        
        if (storedLocations) setLocations(JSON.parse(storedLocations));
        if (storedBeehives) setBeehives(JSON.parse(storedBeehives));
        if (storedRecordings) setRecordings(JSON.parse(storedRecordings));
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Auto-sync when user is logged in
  useEffect(() => {
    const autoSync = async () => {
      if (user) {
        await syncData(false); // Auto sync (not manual)
      }
    };
    
    if (user) {
      autoSync();
    }
  }, [user]);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('buzznotes_locations', JSON.stringify(locations));
  }, [locations]);
  
  useEffect(() => {
    localStorage.setItem('buzznotes_beehives', JSON.stringify(beehives));
  }, [beehives]);
  
  useEffect(() => {
    localStorage.setItem('buzznotes_recordings', JSON.stringify(recordings));
  }, [recordings]);
  
  // Sync data with Supabase
  const syncData = async (manual: boolean = true) => {
    if (!user) return;
    
    setSyncStatus(prev => ({ ...prev, inProgress: true, error: null }));
    
    try {
      // Sync locations
      const { synced: syncedLocations, error: locationsError } = await syncLocations(
        locations,
        user.id,
        manual
      );
      
      if (locationsError) {
        throw new Error(locationsError);
      }
      
      // Sync beehives
      const { synced: syncedBeehives, error: beehivesError } = await syncBeehives(
        beehives,
        user.id,
        manual
      );
      
      if (beehivesError) {
        throw new Error(beehivesError);
      }
      
      // Sync recordings
      const { synced: syncedRecordings, error: recordingsError } = await syncRecordings(
        recordings,
        user.id,
        manual
      );
      
      if (recordingsError) {
        throw new Error(recordingsError);
      }
      
      // Update local state with synced data
      setLocations(syncedLocations);
      setBeehives(syncedBeehives);
      setRecordings(syncedRecordings);
      
      setSyncStatus({
        inProgress: false,
        lastSynced: new Date(),
        error: null
      });
      
      if (manual) {
        toast.success(t('syncSuccess'));
      }
    } catch (error: any) {
      setSyncStatus({
        inProgress: false,
        lastSynced: syncStatus.lastSynced,
        error: error.message
      });
      
      // Only show toast for manual sync or errors
      if (manual || error) {
        toast.error(t('syncError') + ': ' + error.message);
      }
    }
  };
  
  // Location actions
  const addLocation = async (name: string): Promise<Location> => {
    const newLocation: Location = {
      id: generateId(),
      name
    };
    
    setLocations(prev => [...prev, newLocation]);
    
    // Sync with Supabase if user is logged in
    if (user) {
      try {
        await syncLocations([...locations, newLocation], user.id);
      } catch (error) {
        console.error('Error syncing new location:', error);
      }
    }
    
    toast(t('locationCreated'), { duration: 1500 });
    return newLocation;
  };
  
  const updateLocation = async (id: string, name: string): Promise<void> => {
    setLocations(prev => 
      prev.map(location => 
        location.id === id ? { ...location, name } : location
      )
    );
    
    // Sync with Supabase if user is logged in
    if (user) {
      const updatedLocations = locations.map(location => 
        location.id === id ? { ...location, name } : location
      );
      
      try {
        await syncLocations(updatedLocations, user.id);
      } catch (error) {
        console.error('Error syncing updated location:', error);
      }
    }
    
    toast(t('locationUpdated'), { duration: 1500 });
  };
  
  const deleteLocation = async (id: string): Promise<void> => {
    // Delete all beehives in this location
    const beehiveIds = beehives
      .filter(beehive => beehive.locationId === id)
      .map(beehive => beehive.id);
    
    // Delete all recordings for these beehives
    setRecordings(prev => 
      prev.filter(recording => !beehiveIds.includes(recording.beehiveId))
    );
    
    // Delete beehives
    setBeehives(prev => prev.filter(beehive => beehive.locationId !== id));
    
    // Delete location
    setLocations(prev => prev.filter(location => location.id !== id));
    
    // Delete from Supabase if user is logged in
    if (user) {
      try {
        // Delete the location from remote, cascading to beehives and recordings
        await deleteFromRemote('location', id, user.id);
      } catch (error) {
        console.error('Error deleting location from Supabase:', error);
      }
    }
    
    toast(t('locationDeleted'), { duration: 1500 });
  };
  
  // Beehive actions
  const addBeehive = async (name: string, locationId: string): Promise<Beehive> => {
    // Check if name is unique within location
    if (!isBeehiveNameUnique(beehives, name, locationId)) {
      toast.error(t('nameExists'), { duration: 1500 });
      throw new Error(t('nameExists'));
    }
    
    const newBeehive: Beehive = {
      id: generateId(),
      name,
      locationId
    };
    
    setBeehives(prev => [...prev, newBeehive]);
    
    // Sync with Supabase if user is logged in
    if (user) {
      try {
        await syncBeehives([...beehives, newBeehive], user.id);
      } catch (error) {
        console.error('Error syncing new beehive:', error);
      }
    }
    
    toast(t('beehiveCreated'), { duration: 1500 });
    return newBeehive;
  };
  
  const updateBeehive = async (id: string, name: string, locationId?: string): Promise<void> => {
    const beehive = beehives.find(b => b.id === id);
    
    if (!beehive) {
      toast.error(t('errorOccurred'), { duration: 1500 });
      throw new Error('Beehive not found');
    }
    
    // Use the provided locationId or keep the existing one
    const newLocationId = locationId || beehive.locationId;
    
    // Check if name is unique within location
    if (!isBeehiveNameUnique(beehives, name, newLocationId, id)) {
      toast.error(t('nameExists'), { duration: 1500 });
      throw new Error(t('nameExists'));
    }
    
    setBeehives(prev => 
      prev.map(beehive => 
        beehive.id === id ? { ...beehive, name, locationId: newLocationId } : beehive
      )
    );
    
    // Sync with Supabase if user is logged in
    if (user) {
      const updatedBeehives = beehives.map(beehive => 
        beehive.id === id ? { ...beehive, name, locationId: newLocationId } : beehive
      );
      
      try {
        await syncBeehives(updatedBeehives, user.id);
      } catch (error) {
        console.error('Error syncing updated beehive:', error);
      }
    }
    
    toast(t('beehiveUpdated'), { duration: 1500 });
  };
  
  const deleteBeehive = async (id: string): Promise<void> => {
    // Delete all recordings for this beehive
    setRecordings(prev => 
      prev.filter(recording => recording.beehiveId !== id)
    );
    
    // Delete beehive
    setBeehives(prev => prev.filter(beehive => beehive.id !== id));
    
    // Delete from Supabase if user is logged in
    if (user) {
      try {
        // Delete the beehive from remote, cascading to recordings
        await deleteFromRemote('beehive', id, user.id);
      } catch (error) {
        console.error('Error deleting beehive from Supabase:', error);
      }
    }
    
    toast(t('beehiveDeleted'), { duration: 1500 });
  };
  
  const getBeehivesByLocation = (locationId: string): Beehive[] => {
    return beehives.filter(beehive => beehive.locationId === locationId);
  };
  
  // Recording actions
  const addRecording = async (
    audioUrl: string, 
    beehiveId: string, 
    locationId: string, 
    priority: PriorityLevel
  ): Promise<Recording> => {
    const newRecording: Recording = {
      id: generateId(),
      date: getFormattedDate(),
      audioUrl,
      priority,
      beehiveId,
      locationId,
      createdAt: Date.now()
    };
    
    setRecordings(prev => [...prev, newRecording]);
    
    // Sync with Supabase if user is logged in
    if (user) {
      try {
        await syncRecordings([...recordings, newRecording], user.id);
      } catch (error) {
        console.error('Error syncing new recording:', error);
      }
    }
    
    toast(t('recordingCreated'), { duration: 1500 });
    return newRecording;
  };
  
  const deleteRecording = async (id: string): Promise<void> => {
    // Get the recording to delete its audio blob
    const recording = recordings.find(r => r.id === id);
    if (recording) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(recording.audioUrl);
    }
    
    setRecordings(prev => prev.filter(recording => recording.id !== id));
    
    // Delete from Supabase if user is logged in
    if (user && recording) {
      try {
        await deleteFromRemote('recording', id, user.id);
      } catch (error) {
        console.error('Error deleting recording from Supabase:', error);
      }
    }
    
    toast(t('recordingDeleted'), { duration: 1500 });
  };
  
  const updateRecordingPriority = async (id: string, priority: PriorityLevel): Promise<void> => {
    setRecordings(prev => 
      prev.map(recording => 
        recording.id === id ? { ...recording, priority } : recording
      )
    );
    
    // Sync with Supabase if user is logged in
    if (user) {
      const updatedRecordings = recordings.map(recording => 
        recording.id === id ? { ...recording, priority } : recording
      );
      
      try {
        await syncRecordings(updatedRecordings, user.id);
      } catch (error) {
        console.error('Error syncing updated recording:', error);
      }
    }
    
    toast(t('priorityUpdated'), { duration: 1500 });
  };
  
  // Helper functions
  const getLocationById = (id: string): Location | undefined => {
    return locations.find(location => location.id === id);
  };
  
  const getBeehiveById = (id: string): Beehive | undefined => {
    return beehives.find(beehive => beehive.id === id);
  };
  
  // Filtered and sorted data
  const getFilteredBeehives = (locationId: string): Beehive[] => {
    const filteredBeehives = beehives.filter(beehive => 
      beehive.locationId === locationId &&
      beehive.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (sortOrder === 'name-asc') {
      return sortByName(filteredBeehives, 'asc');
    } else if (sortOrder === 'name-desc') {
      return sortByName(filteredBeehives, 'desc');
    }
    
    return filteredBeehives;
  };
  
  const getRecordingsForLocation = (locationId: string): Recording[] => {
    const beehiveIds = beehives
      .filter(beehive => beehive.locationId === locationId)
      .map(beehive => beehive.id);
    
    return recordings.filter(recording => beehiveIds.includes(recording.beehiveId));
  };
  
  const getRecordingsForBeehive = (beehiveId: string): Recording[] => {
    return recordings.filter(recording => recording.beehiveId === beehiveId);
  };
  
  const contextValue: AppContextType = {
    // State
    locations,
    beehives,
    recordings,
    activeTab,
    syncStatus,
    searchTerm,
    sortOrder,
    
    // Location actions
    addLocation,
    updateLocation,
    deleteLocation,
    
    // Beehive actions
    addBeehive,
    updateBeehive,
    deleteBeehive,
    getBeehivesByLocation,
    
    // Recording actions
    addRecording,
    deleteRecording,
    updateRecordingPriority,
    
    // Navigation
    setActiveTab,
    
    // Helpers
    getLocationById,
    getBeehiveById,
    
    // Search and sorting
    setSearchTerm,
    setSortOrder,
    
    // Sync
    syncData,
    getFilteredBeehives,
    getRecordingsForLocation,
    getRecordingsForBeehive
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
