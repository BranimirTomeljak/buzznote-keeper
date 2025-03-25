
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Plus, ArrowLeft, Search, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { PriorityLevel } from '@/types';
import LocationCard from './LocationCard';
import BeehiveCard from './BeehiveCard';
import RecordingCard from './RecordingCard';
import VoiceRecorder from './VoiceRecorder';
import { sortByDateDesc, sortByPriorityAndDate } from '@/utils/helpers';
import { t } from '@/utils/translations';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const Dashboard: React.FC = () => {
  const { 
    locations, 
    beehives, 
    recordings, 
    activeTab, 
    setActiveTab,
    addLocation,
    addBeehive,
    addRecording,
    getLocationById,
    getBeehiveById,
    syncData,
    syncStatus,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    getFilteredBeehives,
    getRecordingsForLocation
  } = useApp();
  
  const { user, signOut, loading: authLoading } = useSupabase();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddBeehive, setShowAddBeehive] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newBeehiveName, setNewBeehiveName] = useState('');
  const [selectedBeehiveId, setSelectedBeehiveId] = useState<string>('');
  const [selectedLocationForBeehive, setSelectedLocationForBeehive] = useState<string>('');
  const [selectedBeehiveForRecording, setSelectedBeehiveForRecording] = useState<string>('');
  const [selectedLocationForRecording, setSelectedLocationForRecording] = useState<string>('');
  const [recordingStep, setRecordingStep] = useState<'select' | 'record'>('select');
  const [syncing, setSyncing] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  
  // Recent and Priority views
  const recentRecordings = sortByDateDesc(recordings);
  const priorityRecordings = sortByPriorityAndDate(recordings);
  
  // Get beehives for selected location
  const beehivesInLocation = selectedLocationId
    ? getFilteredBeehives(selectedLocationId)
    : [];
  
  // Get recordings for selected location in tabs
  const locationRecordings = selectedLocationId
    ? getRecordingsForLocation(selectedLocationId)
    : [];
  const recentLocationRecordings = sortByDateDesc(locationRecordings);
  const priorityLocationRecordings = sortByPriorityAndDate(locationRecordings);
    
  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
  };
  
  // Handle back button
  const handleBack = () => {
    setSelectedLocationId(null);
  };
  
  // Handle add location
  const handleAddLocation = async () => {
    if (newLocationName.trim()) {
      await addLocation(newLocationName.trim());
      setNewLocationName('');
      setShowAddLocation(false);
    }
  };
  
  // Handle add beehive
  const handleAddBeehive = async () => {
    if (newBeehiveName.trim() && selectedLocationForBeehive) {
      try {
        await addBeehive(newBeehiveName.trim(), selectedLocationForBeehive);
        setNewBeehiveName('');
        setShowAddBeehive(false);
      } catch (error) {
        // Error is already handled in the context
      }
    }
  };
  
  // Handle recording flow start
  const handleOpenRecorder = (beehiveId: string, locationId: string) => {
    setSelectedBeehiveForRecording(beehiveId);
    setSelectedLocationForRecording(locationId);
    setShowRecorder(true);
  };
  
  // Handle recording selection step
  const handleStartRecordingFlow = () => {
    setRecordingStep('select');
    setSelectedBeehiveId('');
    
    // If there are no beehives, show add beehive dialog directly
    if (beehives.length === 0) {
      if (locations.length === 0) {
        setShowAddLocation(true);
      } else {
        setSelectedLocationForBeehive(locations[0].id);
        setShowAddBeehive(true);
      }
      return;
    }
    
    // If user is viewing a location, set default beehive from that location
    if (selectedLocationId && beehivesInLocation.length > 0) {
      setSelectedBeehiveId(beehivesInLocation[0].id);
      setSelectedLocationForBeehive(selectedLocationId);
    } else if (beehives.length > 0) {
      // Otherwise set the first beehive as default
      setSelectedBeehiveId(beehives[0].id);
      setSelectedLocationForBeehive(beehives[0].locationId);
    }
    
    setShowRecorder(true);
  };
  
  // Handle recording completion
  const handleRecordingComplete = async (audioUrl: string, priority: PriorityLevel) => {
    await addRecording(audioUrl, selectedBeehiveForRecording, selectedLocationForRecording, priority);
    setShowRecorder(false);
    setRecordingStep('select');
  };
  
  // Handle beehive selection for recording
  const handleBeehiveSelect = () => {
    if (selectedBeehiveId) {
      const beehive = getBeehiveById(selectedBeehiveId);
      if (beehive) {
        setSelectedBeehiveForRecording(beehive.id);
        setSelectedLocationForRecording(beehive.locationId);
        setRecordingStep('record');
      }
    }
  };
  
  // Handle manual sync
  const handleSync = async () => {
    setSyncing(true);
    await syncData(true);
    setSyncing(false);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t('signedOut'),
      description: t('signedOutMessage'),
    });
    navigate('/auth');
  };
  
  // Render locations list
  const renderLocations = () => {
    if (authLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }
    
    if (locations.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{t('noData')}</p>
          <Button onClick={() => setShowAddLocation(true)} className="glass-panel">
            <Plus size={16} className="mr-2" /> {t('newLocation')}
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {locations.map(location => (
          <LocationCard 
            key={location.id} 
            location={location}
            onSelect={handleLocationSelect}
          />
        ))}
        <Button 
          onClick={() => setShowAddLocation(true)} 
          variant="outline" 
          className="w-full justify-center py-6 border-dashed"
        >
          <Plus size={16} className="mr-2" /> {t('newLocation')}
        </Button>
      </div>
    );
  };
  
  // Render beehives for a selected location
  const renderBeehives = () => {
    const location = getLocationById(selectedLocationId!);
    
    if (authLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ArrowLeft size={16} />
          </Button>
          <h2 className="text-xl font-semibold">{location?.name}</h2>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchBeehives')}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={sortOrder}
            onValueChange={(value: any) => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px] ml-2">
              <SelectValue placeholder={t('sort')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{t('nameAsc')}</SelectItem>
              <SelectItem value="name-desc">{t('nameDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {beehivesInLocation.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('noData')}</p>
            <Button onClick={() => { setSelectedLocationForBeehive(selectedLocationId!); setShowAddBeehive(true); }}>
              <Plus size={16} className="mr-2" /> {t('newBeehive')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {beehivesInLocation.map(beehive => (
              <BeehiveCard 
                key={beehive.id} 
                beehive={beehive}
                onOpenRecorder={handleOpenRecorder}
              />
            ))}
            <Button 
              onClick={() => { setSelectedLocationForBeehive(selectedLocationId!); setShowAddBeehive(true); }} 
              variant="outline" 
              className="w-full justify-center py-6 border-dashed"
            >
              <Plus size={16} className="mr-2" /> {t('newBeehive')}
            </Button>
          </div>
        )}
        
        {/* Location Recordings Tabs */}
        {beehivesInLocation.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">{t('recordings')}</h3>
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="recent">{t('recentNotesTab')}</TabsTrigger>
                <TabsTrigger value="priority">{t('priorityNotesTab')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent" className="mt-0">
                {renderRecordings(recentLocationRecordings)}
              </TabsContent>
              
              <TabsContent value="priority" className="mt-0">
                {renderRecordings(priorityLocationRecordings)}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    );
  };
  
  // Render recordings based on filter
  const renderRecordings = (filteredRecordings: typeof recordings) => {
    if (authLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }
    
    if (filteredRecordings.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('noRecordings')}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredRecordings.map(recording => (
          <RecordingCard 
            key={recording.id} 
            recording={recording}
            showBeehive={true}
          />
        ))}
      </div>
    );
  };
  
  if (authLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will be redirected by useEffect
  }
  
  return (
    <div className="page-container">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('appName')}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={syncing || syncStatus.inProgress}
          >
            <RefreshCw size={16} className={`mr-2 ${(syncing || syncStatus.inProgress) ? 'animate-spin' : ''}`} />
            {t('sync')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" />
            {t('signOut')}
          </Button>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="locations">{t('locationsTab')}</TabsTrigger>
          <TabsTrigger value="recent">{t('recentNotesTab')}</TabsTrigger>
          <TabsTrigger value="priority">{t('priorityNotesTab')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="locations" className="mt-0">
          {selectedLocationId ? renderBeehives() : renderLocations()}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          {renderRecordings(recentRecordings)}
        </TabsContent>
        
        <TabsContent value="priority" className="mt-0">
          {renderRecordings(priorityRecordings)}
        </TabsContent>
      </Tabs>
      
      {/* Floating Record Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 record-button"
        onClick={handleStartRecordingFlow}
      >
        <Mic size={20} />
      </Button>
      
      {/* Add Location Dialog */}
      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('newLocation')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="locationName">{t('name')}</Label>
              <Input
                id="locationName"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddLocation}>{t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Beehive Dialog */}
      <Dialog open={showAddBeehive} onOpenChange={setShowAddBeehive}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('newBeehive')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="locationSelect">{t('location')}</Label>
              <Select
                value={selectedLocationForBeehive}
                onValueChange={setSelectedLocationForBeehive}
              >
                <SelectTrigger id="locationSelect" className="mt-2">
                  <SelectValue placeholder={t('selectBeehive')} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="beehiveName">{t('name')}</Label>
              <Input
                id="beehiveName"
                value={newBeehiveName}
                onChange={(e) => setNewBeehiveName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddBeehive}
              disabled={!selectedLocationForBeehive || !newBeehiveName.trim()}
            >
              {t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recording Flow */}
      {showRecorder && (
        recordingStep === 'select' ? (
          <Dialog open={showRecorder} onOpenChange={setShowRecorder}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('selectBeehive')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="beehiveSelect">{t('beehive')}</Label>
                  <Select
                    value={selectedBeehiveId}
                    onValueChange={setSelectedBeehiveId}
                  >
                    <SelectTrigger id="beehiveSelect" className="mt-2">
                      <SelectValue placeholder={t('selectBeehive')} />
                    </SelectTrigger>
                    <SelectContent>
                      {beehives.map(beehive => (
                        <SelectItem key={beehive.id} value={beehive.id}>
                          {beehive.name} ({getLocationById(beehive.locationId)?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (locations.length === 0) {
                        setShowRecorder(false);
                        setShowAddLocation(true);
                      } else {
                        setSelectedLocationForBeehive(locations[0].id);
                        setShowRecorder(false);
                        setShowAddBeehive(true);
                      }
                    }}
                    className="text-sm"
                  >
                    <Plus size={14} className="mr-1" /> {t('newBeehive')}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleBeehiveSelect}
                  disabled={!selectedBeehiveId}
                >
                  {t('recordNew')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          // Recording interface
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => setShowRecorder(false)}
            beehiveName={getBeehiveById(selectedBeehiveForRecording)?.name || ''}
          />
        )
      )}
    </div>
  );
};

export default Dashboard;
