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
  addRecording: (audioData: string, beehiveId: string, locationId: string, priority: PriorityLevel) => Promise<Recording>;
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
  
  useEffect(() => {
    const autoSync = async () => {
      if (user) {
        await syncData(false);
      }
    };
    
    if (user) {
      autoSync();
    }
  }, [user]);
  
  useEffect(() => {
    localStorage.setItem('buzznotes_locations', JSON.stringify(locations));
  }, [locations]);
  
  useEffect(() => {
    localStorage.setItem('buzznotes_beehives', JSON.stringify(beehives));
  }, [beehives]);
  
  useEffect(() => {
    localStorage.setItem('buzznotes_recordings', JSON.stringify(recordings));
  }, [recordings]);
  
  const syncData = async (manual: boolean = true) => {
    if (!user) return;
    
    setSyncStatus(prev => ({ ...prev, inProgress: true, error: null }));
    
    try {
      const { synced: syncedLocations, error: locationsError } = await syncLocations(
        locations,
        user.id,
        manual
      );
      
      if (locationsError) {
        throw new Error(locationsError);
      }
      
      const { synced: syncedBeehives, error: beehivesError } = await syncBeehives(
        beehives,
        user.id,
        manual
      );
      
      if (beehivesError) {
        throw new Error(beehivesError);
      }
      
      const { synced: syncedRecordings, error: recordingsError } = await syncRecordings(
        recordings,
        user.id,
        manual
      );
      
      if (recordingsError) {
        throw new Error(recordingsError);
      }
      
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
      
      if (manual || error) {
        toast.error(t('syncError') + ': ' + error.message);
      }
    }
  };
  
  const addLocation = async (name: string): Promise<Location> => {
    const newLocation: Location = {
      id: generateId(),
      name
    };
    
    setLocations(prev => [...prev, newLocation]);
    
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
    const beehiveIds = beehives
      .filter(beehive => beehive.locationId === id)
      .map(beehive => beehive.id);
    
    setRecordings(prev => 
      prev.filter(recording => !beehiveIds.includes(recording.beehiveId))
    );
    
    setBeehives(prev => prev.filter(beehive => beehive.locationId !== id));
    
    setLocations(prev => prev.filter(location => location.id !== id));
    
    if (user) {
      try {
        await deleteFromRemote('location', id, user.id);
      } catch (error) {
        console.error('Error deleting location from Supabase:', error);
      }
    }
    
    toast(t('locationDeleted'), { duration: 1500 });
  };
  
  const addBeehive = async (name: string, locationId: string): Promise<Beehive> => {
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
    
    const newLocationId = locationId || beehive.locationId;
    
    if (!isBeehiveNameUnique(beehives, name, newLocationId, id)) {
      toast.error(t('nameExists'), { duration: 1500 });
      throw new Error(t('nameExists'));
    }
    
    setBeehives(prev => 
      prev.map(beehive => 
        beehive.id === id ? { ...beehive, name, locationId: newLocationId } : beehive
      )
    );
    
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
    const beehiveIds = beehives
      .filter(beehive => beehive.locationId === id)
      .map(beehive => beehive.id);
    
    setRecordings(prev => 
      prev.filter(recording => !beehiveIds.includes(recording.beehiveId))
    );
    
    setBeehives(prev => prev.filter(beehive => beehive.id !== id));
    
    if (user) {
      try {
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
  
  const addRecording = async (
    audioData: string, 
    beehiveId: string, 
    locationId: string, 
    priority: PriorityLevel
  ): Promise<Recording> => {
    const newRecording: Recording = {
      id: generateId(),
      date: getFormattedDate(),
      audioUrl: audioData,
      priority,
      beehiveId,
      locationId,
      createdAt: Date.now()
    };
    
    setRecordings(prev => [...prev, newRecording]);
    
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
    setRecordings(prev => prev.filter(recording => recording.id !== id));
    
    if (user) {
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
    
    if (user) {
      try {
        const updatedRecordings = recordings.map(recording => 
          recording.id === id ? { ...recording, priority } : recording
        );
        
        await syncRecordings(updatedRecordings, user.id);
        toast(t('priorityUpdated'), { duration: 1500 });
      } catch (error) {
        console.error('Error syncing updated recording:', error);
      }
    } else {
      toast(t('priorityUpdated'), { duration: 1500 });
    }
  };
  
  const getLocationById = (id: string): Location | undefined => {
    return locations.find(location => location.id === id);
  };
  
  const getBeehiveById = (id: string): Beehive | undefined => {
    return beehives.find(beehive => beehive.id === id);
  };
  
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
    locations,
    beehives,
    recordings,
    activeTab,
    syncStatus,
    searchTerm,
    sortOrder,
    
    addLocation,
    updateLocation,
    deleteLocation,
    
    addBeehive,
    updateBeehive,
    deleteBeehive,
    getBeehivesByLocation,
    
    addRecording,
    deleteRecording,
    updateRecordingPriority,
    
    setActiveTab,
    
    getLocationById,
    getBeehiveById,
    
    setSearchTerm,
    setSortOrder,
    
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
