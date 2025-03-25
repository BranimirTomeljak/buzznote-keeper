
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Plus, ArrowLeft, Search, RefreshCw, LogOut, MapPin, FileText } from 'lucide-react';
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
    getRecordingsForBeehive
  } = useApp();
  
  const { user, signOut, loading: authLoading } = useSupabase();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedBeehiveId, setSelectedBeehiveId] = useState<string | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddBeehive, setShowAddBeehive] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newBeehiveName, setNewBeehiveName] = useState('');
  const [selectedLocationForBeehive, setSelectedLocationForBeehive] = useState<string>('');
  const [selectedBeehiveForRecording, setSelectedBeehiveForRecording] = useState<string>('');
  const [selectedLocationForRecording, setSelectedLocationForRecording] = useState<string>('');
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
  
  // Get recordings for selected beehive
  const beehiveRecordings = selectedBeehiveId
    ? getRecordingsForBeehive(selectedBeehiveId)
    : [];
  const recentBeehiveRecordings = sortByDateDesc(beehiveRecordings);
  const priorityBeehiveRecordings = sortByPriorityAndDate(beehiveRecordings);
    
  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    setSelectedBeehiveId(null);
  };
  
  // Handle beehive selection
  const handleBeehiveSelect = (beehiveId: string) => {
    setSelectedBeehiveId(beehiveId);
  };
  
  // Handle back button
  const handleBack = () => {
    if (selectedBeehiveId) {
      setSelectedBeehiveId(null);
    } else {
      setSelectedLocationId(null);
    }
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
  
  // Handle recording completion
  const handleRecordingComplete = async (audioUrl: string, priority: PriorityLevel) => {
    await addRecording(audioUrl, selectedBeehiveForRecording, selectedLocationForRecording, priority);
    setShowRecorder(false);
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
  
  // Action buttons handlers
  const handleAddLocationClick = () => {
    setShowAddLocation(true);
  };
  
  const handleAddBeehiveClick = () => {
    if (locations.length === 0) {
      setShowAddLocation(true);
    } else {
      setSelectedLocationForBeehive(locations[0].id);
      setShowAddBeehive(true);
    }
  };
  
  const handleAddRecordingClick = () => {
    if (beehives.length === 0) {
      if (locations.length === 0) {
        setShowAddLocation(true);
      } else {
        setSelectedLocationForBeehive(locations[0].id);
        setShowAddBeehive(true);
      }
      return;
    }
    
    // If user is viewing a beehive, use that beehive
    if (selectedBeehiveId) {
      const beehive = getBeehiveById(selectedBeehiveId);
      if (beehive) {
        handleOpenRecorder(beehive.id, beehive.locationId);
      }
      return;
    }
    
    // If user is viewing a location, use the first beehive from that location
    if (selectedLocationId && beehivesInLocation.length > 0) {
      handleOpenRecorder(beehivesInLocation[0].id, selectedLocationId);
      return;
    }
    
    // Otherwise use the first beehive
    if (beehives.length > 0) {
      const beehive = beehives[0];
      handleOpenRecorder(beehive.id, beehive.locationId);
    }
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
          <p className="text-muted-foreground mb-4">{t('noLocations')}</p>
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
              <SelectItem value="name-asc">{t('nameAscending')}</SelectItem>
              <SelectItem value="name-desc">{t('nameDescending')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {beehivesInLocation.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('noBeehives')}</p>
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
                onBeehiveSelect={handleBeehiveSelect}
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
      </div>
    );
  };
  
  // Render recordings for a selected beehive
  const renderBeehiveDetail = () => {
    const beehive = getBeehiveById(selectedBeehiveId!);
    const location = beehive ? getLocationById(beehive.locationId) : null;
    
    if (!beehive) return null;
    
    return (
      <div>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{beehive.name}</h2>
            {location && <p className="text-sm text-muted-foreground">{location.name}</p>}
          </div>
        </div>
        
        <div className="mt-4">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="recent">{t('recentRecordings')}</TabsTrigger>
              <TabsTrigger value="priority">{t('priorityRecordings')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="mt-0">
              {renderRecordings(recentBeehiveRecordings)}
            </TabsContent>
            
            <TabsContent value="priority" className="mt-0">
              {renderRecordings(priorityBeehiveRecordings)}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => handleOpenRecorder(beehive.id, beehive.locationId)}
            className="record-button px-6 py-2"
          >
            <Mic size={18} className="mr-2" />
            {t('recordNew')}
          </Button>
        </div>
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
            showBeehive={!selectedBeehiveId}
          />
        ))}
      </div>
    );
  };
  
  if (authLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-honey"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will be redirected by useEffect
  }
  
  return (
    <div className="page-container">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-bee-brown">{t('appName')}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={syncing || syncStatus.inProgress}
            className="text-bee-brown border-bee-brown hover:bg-bee-brown/10"
          >
            <RefreshCw size={16} className={`mr-2 ${(syncing || syncStatus.inProgress) ? 'animate-spin' : ''}`} />
            {t('sync')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-bee-brown hover:bg-bee-brown/10"
          >
            <LogOut size={16} className="mr-2" />
            {t('signOut')}
          </Button>
        </div>
      </header>
      
      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button 
          className="action-button" 
          onClick={handleAddLocationClick}
        >
          <MapPin size={18} />
          <span>{t('newLocation')}</span>
        </button>
        <button 
          className="action-button" 
          onClick={handleAddBeehiveClick}
        >
          <FileText size={18} />
          <span>{t('newBeehive')}</span>
        </button>
        <button 
          className="action-button" 
          onClick={handleAddRecordingClick}
        >
          <Mic size={18} />
          <span>{t('recordNew')}</span>
        </button>
      </div>
      
      {selectedBeehiveId ? (
        renderBeehiveDetail()
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-hive-light">
            <TabsTrigger value="locations" className="data-[state=active]:bg-honey data-[state=active]:text-bee-black">{t('locations')}</TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-honey data-[state=active]:text-bee-black">{t('recent')}</TabsTrigger>
            <TabsTrigger value="priority" className="data-[state=active]:bg-honey data-[state=active]:text-bee-black">{t('priority')}</TabsTrigger>
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
      )}
      
      {/* Action Buttons at bottom-right */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end">
        <Button
          className="rounded-full w-12 h-12 shadow-lg"
          onClick={handleAddLocationClick}
          variant="outline"
        >
          <MapPin size={18} />
          <span className="sr-only">{t('newLocation')}</span>
        </Button>
        
        <Button
          className="rounded-full w-12 h-12 shadow-lg"
          onClick={handleAddBeehiveClick}
          variant="outline"
        >
          <FileText size={18} />
          <span className="sr-only">{t('newBeehive')}</span>
        </Button>
        
        <Button
          className="rounded-full w-14 h-14 record-button shadow-lg"
          onClick={handleAddRecordingClick}
        >
          <Mic size={20} />
          <span className="sr-only">{t('recordNew')}</span>
        </Button>
      </div>
      
      {/* Add Location Dialog */}
      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent className="bg-white border-honey/30">
          <DialogHeader>
            <DialogTitle className="text-bee-brown">{t('newLocation')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="locationName" className="text-bee-brown">{t('name')}</Label>
              <Input
                id="locationName"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="mt-2 border-honey/30 focus-visible:ring-honey"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddLocation} className="bg-honey hover:bg-honey-dark text-bee-black">{t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Beehive Dialog */}
      <Dialog open={showAddBeehive} onOpenChange={setShowAddBeehive}>
        <DialogContent className="bg-white border-honey/30">
          <DialogHeader>
            <DialogTitle className="text-bee-brown">{t('newBeehive')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="locationSelect" className="text-bee-brown">{t('location')}</Label>
              <Select
                value={selectedLocationForBeehive}
                onValueChange={setSelectedLocationForBeehive}
              >
                <SelectTrigger id="locationSelect" className="mt-2 border-honey/30 focus:ring-honey">
                  <SelectValue placeholder={t('selectLocation')} />
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
              <Label htmlFor="beehiveName" className="text-bee-brown">{t('name')}</Label>
              <Input
                id="beehiveName"
                value={newBeehiveName}
                onChange={(e) => setNewBeehiveName(e.target.value)}
                className="mt-2 border-honey/30 focus-visible:ring-honey"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddBeehive}
              disabled={!selectedLocationForBeehive || !newBeehiveName.trim()}
              className="bg-honey hover:bg-honey-dark text-bee-black"
            >
              {t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recording Interface */}
      {showRecorder && (
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={() => setShowRecorder(false)}
          beehiveName={getBeehiveById(selectedBeehiveForRecording)?.name || ''}
        />
      )}
    </div>
  );
};

export default Dashboard;
