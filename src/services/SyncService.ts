import { supabase } from '@/integrations/supabase/client';
import { Recording, Beehive, Location, PriorityLevel } from '@/types';
import { generateId } from '@/utils/helpers';

// Interface for sync status
export interface SyncStatus {
  inProgress: boolean;
  lastSynced: Date | null;
  error: string | null;
}

// Function to sync locations
export const syncLocations = async (
  localLocations: Location[],
  userId: string,
  isManualSync: boolean = false
): Promise<{ synced: Location[]; error: string | null }> => {
  try {
    // Fetch remote locations
    const { data: remoteLocations, error: fetchError } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw new Error(fetchError.message);

    // Create a map of remote locations by ID for easy lookup
    const remoteLocationMap = new Map(
      remoteLocations?.map(location => [location.id, location]) || []
    );

    // Identify locations to add, update, or keep as is
    const locationsToAdd: any[] = [];
    const locationsToUpdate: any[] = [];
    
    for (const localLocation of localLocations) {
      const remoteLocation = remoteLocationMap.get(localLocation.id);
      
      if (!remoteLocation) {
        // Location doesn't exist remotely, check if there's a duplicate ID conflict
        const { count, error: countError } = await supabase
          .from('locations')
          .select('*', { count: 'exact', head: true })
          .eq('id', localLocation.id);
          
        if (countError) {
          console.error('Error checking for duplicate location:', countError);
        }
        
        // If count > 0, there's a conflict, generate a new ID
        if (count && count > 0) {
          const newLocation = {
            ...localLocation,
            id: generateId(),
            user_id: userId
          };
          locationsToAdd.push({
            id: newLocation.id,
            name: newLocation.name,
            user_id: userId,
          });
          // Update the localLocation ID to match the new ID for the merged result later
          localLocation.id = newLocation.id;
        } else {
          // No conflict, add it with the original ID
          locationsToAdd.push({
            id: localLocation.id,
            name: localLocation.name,
            user_id: userId,
          });
        }
      } else if (remoteLocation.name !== localLocation.name) {
        // Location exists but has been updated locally
        locationsToUpdate.push({
          id: localLocation.id,
          name: localLocation.name,
          user_id: userId,
        });
      }
      
      // Remove from map so we can identify remote-only locations
      remoteLocationMap.delete(localLocation.id);
    }
    
    // Any locations still in the map only exist remotely
    const remoteOnlyLocations = Array.from(remoteLocationMap.values());
    
    // Perform database operations
    let error: string | null = null;
    
    // Add new locations
    if (locationsToAdd.length > 0) {
      for (const location of locationsToAdd) {
        const { error: addError } = await supabase
          .from('locations')
          .insert([location])
          .select();
          
        if (addError) {
          console.error('Error adding location:', addError);
          error = addError.message;
          break;
        }
      }
    }
    
    // Update modified locations
    if (locationsToUpdate.length > 0 && !error) {
      for (const location of locationsToUpdate) {
        const { error: updateError } = await supabase
          .from('locations')
          .update({ name: location.name })
          .eq('id', location.id)
          .eq('user_id', userId);
          
        if (updateError) {
          error = updateError.message;
          break;
        }
      }
    }
    
    // Merge remote and local locations
    const mergedLocations = [...localLocations];
    
    // Add remote-only locations to the local collection
    for (const remoteLocation of remoteOnlyLocations) {
      mergedLocations.push({
        id: remoteLocation.id,
        name: remoteLocation.name,
      });
    }
    
    return { synced: mergedLocations, error };
  } catch (err: any) {
    return { synced: localLocations, error: err.message };
  }
};

// Function to sync beehives
export const syncBeehives = async (
  localBeehives: Beehive[],
  userId: string,
  isManualSync: boolean = false
): Promise<{ synced: Beehive[]; error: string | null }> => {
  try {
    // Fetch remote beehives
    const { data: remoteBeehives, error: fetchError } = await supabase
      .from('beehives')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw new Error(fetchError.message);

    // Create a map of remote beehives by ID for easy lookup
    const remoteBeehiveMap = new Map(
      remoteBeehives?.map(beehive => [beehive.id, beehive]) || []
    );

    // Identify beehives to add, update, or keep as is
    const beehivesToAdd: any[] = [];
    const beehivesToUpdate: any[] = [];
    
    for (const localBeehive of localBeehives) {
      const remoteBeehive = remoteBeehiveMap.get(localBeehive.id);
      
      if (!remoteBeehive) {
        // Beehive doesn't exist remotely, check for duplicate ID conflict
        const { count, error: countError } = await supabase
          .from('beehives')
          .select('*', { count: 'exact', head: true })
          .eq('id', localBeehive.id);
          
        if (countError) {
          console.error('Error checking for duplicate beehive:', countError);
        }
        
        // If count > 0, there's a conflict, generate a new ID
        if (count && count > 0) {
          const newBeehive = {
            ...localBeehive,
            id: generateId(),
          };
          beehivesToAdd.push({
            id: newBeehive.id,
            name: newBeehive.name,
            location_id: newBeehive.locationId,
            user_id: userId,
          });
          // Update the localBeehive ID to match the new ID for the merged result later
          localBeehive.id = newBeehive.id;
        } else {
          // No conflict, add it with the original ID
          beehivesToAdd.push({
            id: localBeehive.id,
            name: localBeehive.name,
            location_id: localBeehive.locationId,
            user_id: userId,
          });
        }
      } else if (
        remoteBeehive.name !== localBeehive.name ||
        remoteBeehive.location_id !== localBeehive.locationId
      ) {
        // Beehive exists but has been updated locally
        beehivesToUpdate.push({
          id: localBeehive.id,
          name: localBeehive.name,
          location_id: localBeehive.locationId,
          user_id: userId,
        });
      }
      
      // Remove from map so we can identify remote-only beehives
      remoteBeehiveMap.delete(localBeehive.id);
    }
    
    // Any beehives still in the map only exist remotely
    const remoteOnlyBeehives = Array.from(remoteBeehiveMap.values());
    
    // Perform database operations
    let error: string | null = null;
    
    // Add new beehives
    if (beehivesToAdd.length > 0) {
      for (const beehive of beehivesToAdd) {
        const { error: addError } = await supabase
          .from('beehives')
          .insert([beehive])
          .select();
          
        if (addError) {
          console.error('Error adding beehive:', addError);
          error = addError.message;
          break;
        }
      }
    }
    
    // Update modified beehives
    if (beehivesToUpdate.length > 0 && !error) {
      for (const beehive of beehivesToUpdate) {
        const { error: updateError } = await supabase
          .from('beehives')
          .update({ 
            name: beehive.name,
            location_id: beehive.location_id
          })
          .eq('id', beehive.id)
          .eq('user_id', userId);
          
        if (updateError) {
          error = updateError.message;
          break;
        }
      }
    }
    
    // Merge remote and local beehives
    const mergedBeehives = [...localBeehives];
    
    // Add remote-only beehives to the local collection
    for (const remoteBeehive of remoteOnlyBeehives) {
      mergedBeehives.push({
        id: remoteBeehive.id,
        name: remoteBeehive.name,
        locationId: remoteBeehive.location_id,
      });
    }
    
    return { synced: mergedBeehives, error };
  } catch (err: any) {
    return { synced: localBeehives, error: err.message };
  }
};

// Function to sync recordings
export const syncRecordings = async (
  localRecordings: Recording[],
  userId: string,
  isManualSync: boolean = false
): Promise<{ synced: Recording[]; error: string | null }> => {
  try {
    // Fetch remote recordings
    const { data: remoteRecordings, error: fetchError } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw new Error(fetchError.message);

    // Create a map of remote recordings by ID for easy lookup
    const remoteRecordingMap = new Map(
      remoteRecordings?.map(recording => [recording.id, recording]) || []
    );

    // Identify recordings to add, update, or keep as is
    const recordingsToAdd: any[] = [];
    const recordingsToUpdate: any[] = [];
    
    for (const localRecording of localRecordings) {
      const remoteRecording = remoteRecordingMap.get(localRecording.id);
      
      if (!remoteRecording) {
        // Check for duplicate ID conflict
        const { count, error: countError } = await supabase
          .from('recordings')
          .select('*', { count: 'exact', head: true })
          .eq('id', localRecording.id);
          
        if (countError) {
          console.error('Error checking for duplicate recording:', countError);
        }
        
        // If count > 0, there's a conflict, generate a new ID
        if (count && count > 0) {
          const newRecording = {
            ...localRecording,
            id: generateId(),
          };
          recordingsToAdd.push({
            id: newRecording.id,
            date: newRecording.date,
            audio_url: newRecording.audioUrl,
            priority: newRecording.priority,
            beehive_id: newRecording.beehiveId,
            location_id: newRecording.locationId,
            user_id: userId,
            created_at: newRecording.createdAt,
          });
          // Update the localRecording ID to match the new ID for the merged result later
          localRecording.id = newRecording.id;
        } else {
          // No conflict, add it with the original ID
          recordingsToAdd.push({
            id: localRecording.id,
            date: localRecording.date,
            audio_url: localRecording.audioUrl,
            priority: localRecording.priority,
            beehive_id: localRecording.beehiveId,
            location_id: localRecording.locationId,
            user_id: userId,
            created_at: localRecording.createdAt,
          });
        }
      } else if (remoteRecording.priority !== localRecording.priority) {
        // Only updating the priority for now
        recordingsToUpdate.push({
          id: localRecording.id,
          priority: localRecording.priority,
        });
      }
      
      // Remove from map so we can identify remote-only recordings
      remoteRecordingMap.delete(localRecording.id);
    }
    
    // Any recordings still in the map only exist remotely
    const remoteOnlyRecordings = Array.from(remoteRecordingMap.values());
    
    // Perform database operations
    let error: string | null = null;
    
    // Add new recordings
    if (recordingsToAdd.length > 0) {
      for (const recording of recordingsToAdd) {
        const { error: addError } = await supabase
          .from('recordings')
          .insert([recording])
          .select();
          
        if (addError) {
          console.error('Error adding recording:', addError);
          error = addError.message;
          break;
        }
      }
    }
    
    // Update modified recordings
    if (recordingsToUpdate.length > 0 && !error) {
      for (const recording of recordingsToUpdate) {
        const { error: updateError } = await supabase
          .from('recordings')
          .update({ priority: recording.priority })
          .eq('id', recording.id)
          .eq('user_id', userId);
          
        if (updateError) {
          error = updateError.message;
          break;
        }
      }
    }
    
    // Merge remote and local recordings
    const mergedRecordings = [...localRecordings];
    
    // Add remote-only recordings to the local collection
    for (const remoteRecording of remoteOnlyRecordings) {
      mergedRecordings.push({
        id: remoteRecording.id,
        date: remoteRecording.date,
        audioUrl: remoteRecording.audio_url,
        priority: remoteRecording.priority as PriorityLevel,
        beehiveId: remoteRecording.beehive_id,
        locationId: remoteRecording.location_id,
        createdAt: remoteRecording.created_at,
      });
    }
    
    return { synced: mergedRecordings, error };
  } catch (err: any) {
    return { synced: localRecordings, error: err.message };
  }
};

// Function to delete data from remote
export const deleteFromRemote = async (
  type: 'location' | 'beehive' | 'recording',
  id: string,
  userId: string
): Promise<string | null> => {
  try {
    const table = type === 'location' ? 'locations' : type === 'beehive' ? 'beehives' : 'recordings';
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    return error ? error.message : null;
  } catch (err: any) {
    return err.message;
  }
};

// Function to download file from URL and convert to Blob
export const downloadFile = async (url: string): Promise<Blob | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');
    return await response.blob();
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
};

// Function to upload blob to Supabase Storage
export const uploadAudioToStorage = async (
  blob: Blob, 
  userId: string, 
  recordingId: string
): Promise<string | null> => {
  try {
    const filePath = `${userId}/${recordingId}.webm`;
    const { error } = await supabase.storage
      .from('audio_recordings')
      .upload(filePath, blob, {
        contentType: 'audio/webm',
        upsert: true,
      });
      
    if (error) throw error;
    
    const { data } = supabase.storage
      .from('audio_recordings')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading audio:', error);
    return null;
  }
};
