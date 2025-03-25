
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
  isBeehiveNameUnique 
} from '@/utils/helpers';
import { t } from '@/utils/translations';

interface AppContextType {
  // State
  locations: Location[];
  beehives: Beehive[];
  recordings: Recording[];
  activeTab: string;
  
  // Location actions
  addLocation: (name: string) => Promise<Location>;
  updateLocation: (id: string, name: string) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  
  // Beehive actions
  addBeehive: (name: string, locationId: string) => Promise<Beehive>;
  updateBeehive: (id: string, name: string) => Promise<void>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state
  const [locations, setLocations] = useState<Location[]>([]);
  const [beehives, setBeehives] = useState<Beehive[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeTab, setActiveTab] = useState('locations');
  
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
  
  // Location actions
  const addLocation = async (name: string): Promise<Location> => {
    const newLocation: Location = {
      id: generateId(),
      name
    };
    
    setLocations(prev => [...prev, newLocation]);
    toast(t('locationCreated'), { duration: 1500 });
    return newLocation;
  };
  
  const updateLocation = async (id: string, name: string): Promise<void> => {
    setLocations(prev => 
      prev.map(location => 
        location.id === id ? { ...location, name } : location
      )
    );
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
    toast(t('beehiveCreated'), { duration: 1500 });
    return newBeehive;
  };
  
  const updateBeehive = async (id: string, name: string): Promise<void> => {
    const beehive = beehives.find(b => b.id === id);
    
    if (!beehive) {
      toast.error(t('errorOccurred'), { duration: 1500 });
      throw new Error('Beehive not found');
    }
    
    // Check if name is unique within location
    if (!isBeehiveNameUnique(beehives, name, beehive.locationId, id)) {
      toast.error(t('nameExists'), { duration: 1500 });
      throw new Error(t('nameExists'));
    }
    
    setBeehives(prev => 
      prev.map(beehive => 
        beehive.id === id ? { ...beehive, name } : beehive
      )
    );
    
    toast(t('beehiveUpdated'), { duration: 1500 });
  };
  
  const deleteBeehive = async (id: string): Promise<void> => {
    // Delete all recordings for this beehive
    setRecordings(prev => 
      prev.filter(recording => recording.beehiveId !== id)
    );
    
    // Delete beehive
    setBeehives(prev => prev.filter(beehive => beehive.id !== id));
    
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
    toast(t('recordingDeleted'), { duration: 1500 });
  };
  
  const updateRecordingPriority = async (id: string, priority: PriorityLevel): Promise<void> => {
    setRecordings(prev => 
      prev.map(recording => 
        recording.id === id ? { ...recording, priority } : recording
      )
    );
    
    toast(t('priorityUpdated'), { duration: 1500 });
  };
  
  // Helper functions
  const getLocationById = (id: string): Location | undefined => {
    return locations.find(location => location.id === id);
  };
  
  const getBeehiveById = (id: string): Beehive | undefined => {
    return beehives.find(beehive => beehive.id === id);
  };
  
  const contextValue: AppContextType = {
    // State
    locations,
    beehives,
    recordings,
    activeTab,
    
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
    getBeehiveById
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
