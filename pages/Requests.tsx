
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Input, Select, Button, Badge, Dialog } from '../components/ui/UIComponents';
import { BLOOD_TYPES, INITIAL_REQUESTS, HOSPITALS, HOSPITAL_DETAILS } from '../constants';
import { Request, UrgencyLevel } from '../types';
import { Clock, MapPin, AlertCircle, CheckCircle2, Radio, Send as SendIcon, Phone, Navigation, Building2, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for Leaflet default icon issues
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const markerIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const sourceIcon = L.divIcon({
  className: 'custom-source-icon',
  html: `<div style="background-color: #16a34a; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// --- Helper: Map Updater to Fly to Location ---
const MapUpdater = ({ center, zoom }: { center: [number, number], zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 16, { duration: 1.5 });
    }
  }, [center, map, zoom]);
  return null;
};

// --- Helper: Calculate Distance (Haversine) ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- Send Request Page ---
export const SendRequest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hospitalName: '',
    location: '',
    bloodType: 'A+',
    quantity: 1,
    urgency: 'Moderate' as UrgencyLevel,
    radius: '5km',
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0330, 73.0297]); // Default center

  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const details = HOSPITAL_DETAILS[name];
    
    if (details) {
      setFormData(prev => ({
        ...prev,
        hospitalName: name,
        location: details.address
      }));
      setMapCenter([details.lat, details.lng]);
    } else {
      setFormData(prev => ({
        ...prev,
        hospitalName: name,
        location: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      hospitalName: formData.hospitalName,
      location: formData.location,
      bloodType: formData.bloodType as any,
      quantity: formData.quantity,
      urgency: formData.urgency,
      radius: formData.radius as any,
      postedAt: new Date().toISOString(),
      status: 'Active'
    };

    // Save to local storage to simulate backend persistence
    const existingData = localStorage.getItem('bloodBridge_requests');
    const requests = existingData ? JSON.parse(existingData) : INITIAL_REQUESTS;
    const updatedRequests = [newRequest, ...requests];
    localStorage.setItem('bloodBridge_requests', JSON.stringify(updatedRequests));

    navigate('/view-alerts');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Broadcast Urgent Request</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Initiate a high-priority alert to the nearest blood banks and donor network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form */}
        <Card className="lg:col-span-2 shadow-2xl border-t-4 border-t-primary-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Hospital Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                   <Building2 className="h-5 w-5" />
                   <h3 className="text-sm font-bold uppercase tracking-wider">Hospital Identity</h3>
                </div>
                
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                   </div>
                   <Select 
                    label="Select Hospital Facility" 
                    options={[
                      { value: '', label: 'Select a Registered Hospital...' },
                      ...HOSPITALS.map(h => ({ value: h, label: h }))
                    ]}
                    required 
                    value={formData.hospitalName}
                    onChange={handleHospitalChange}
                    className="pl-10 h-14 text-lg font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white transition-colors border-slate-200 shadow-sm"
                  />
                </div>

                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                   </div>
                   <Input 
                    label="Verified Location (Auto-detected)" 
                    placeholder="Location will appear here automatically"
                    required 
                    readOnly
                    value={formData.location}
                    className="pl-10 h-12 bg-slate-100/50 text-slate-600 cursor-not-allowed font-medium"
                  />
                  <div className="absolute right-3 top-9">
                    {formData.location && <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in" />}
                  </div>
                </div>
              </div>
              
              {/* Requirements Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                   <AlertCircle className="h-5 w-5" />
                   <h3 className="text-sm font-bold uppercase tracking-wider">Critical Requirements</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                     <Select 
                      label="Blood Type" 
                      options={BLOOD_TYPES.map(t => ({ value: t, label: t }))}
                      value={formData.bloodType}
                      onChange={e => setFormData({...formData, bloodType: e.target.value})}
                      className="h-12 font-bold text-xl text-center tracking-widest"
                    />
                  </div>
                  <div className="relative">
                    <Input 
                      label="Quantity (Units)" 
                      type="number" 
                      min="1" 
                      max="50"
                      required 
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      className="h-12 font-bold text-lg"
                    />
                  </div>
                  <div className="relative">
                    <Select 
                      label="Urgency Level" 
                      options={[
                        { value: 'Moderate', label: 'Moderate' },
                        { value: 'High', label: 'High Priority' },
                        { value: 'Critical', label: 'Critical / Stat' }
                      ]}
                      value={formData.urgency}
                      onChange={e => setFormData({...formData, urgency: e.target.value as UrgencyLevel})}
                      className={`h-12 font-bold ${
                        formData.urgency === 'Critical' ? 'text-red-600 bg-red-50 border-red-200' : 
                        formData.urgency === 'High' ? 'text-orange-600 bg-orange-50 border-orange-200' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Broadcast Section */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                   <Radio className="h-5 w-5" />
                   <h3 className="text-sm font-bold uppercase tracking-wider">Broadcast Range</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div 
                     onClick={() => setFormData({...formData, radius: '5km'})}
                     className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${formData.radius === '5km' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
                   >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.radius === '5km' ? 'border-primary-600' : 'border-slate-300'}`}>
                         {formData.radius === '5km' && <div className="h-3 w-3 rounded-full bg-primary-600" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">5 km Radius</div>
                        <div className="text-xs text-slate-500">Immediate Vicinity</div>
                      </div>
                   </div>
                   <div 
                     onClick={() => setFormData({...formData, radius: '10km'})}
                     className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${formData.radius === '10km' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
                   >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.radius === '10km' ? 'border-primary-600' : 'border-slate-300'}`}>
                         {formData.radius === '10km' && <div className="h-3 w-3 rounded-full bg-primary-600" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">10 km Radius</div>
                        <div className="text-xs text-slate-500">Regional Network</div>
                      </div>
                   </div>
                 </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-16 text-xl font-bold rounded-xl shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-1 transition-all bg-gradient-to-r from-red-600 to-red-700" 
                disabled={!formData.hospitalName}
              >
                <SendIcon className="mr-3 h-6 w-6" /> Broadcast Alert Now
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Map Preview */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="overflow-hidden border-0 shadow-2xl bg-slate-900 ring-1 ring-slate-800">
              <CardHeader className="bg-slate-950 text-white border-b border-slate-800 py-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <LocateFixed className="h-5 w-5 text-blue-400" />
                     <CardTitle className="text-base">Satellite Target</CardTitle>
                   </div>
                   {formData.hospitalName && <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/50">Locked</Badge>}
                 </div>
              </CardHeader>
              <div className="h-[400px] w-full relative group">
                  <MapContainer 
                    center={mapCenter} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    className="z-0"
                  >
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <MapUpdater center={mapCenter} />
                    {formData.hospitalName && (
                      <Marker position={mapCenter} icon={markerIcon}>
                          <Popup className="custom-popup">
                            <div className="font-bold text-sm">{formData.hospitalName}</div>
                          </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                  
                  {/* Overlay Grid Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 z-10"></div>
                  <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/30 z-20"></div>
                  
                  {!formData.hospitalName && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                       <div className="text-center p-6">
                          <LocateFixed className="h-12 w-12 text-white/50 mx-auto mb-2 animate-pulse" />
                          <p className="text-white/80 font-medium">Select a hospital to acquire target</p>
                       </div>
                    </div>
                  )}
              </div>
              <CardContent className="bg-slate-900 p-4 border-t border-slate-800">
                 <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>LAT: {mapCenter[0].toFixed(4)}</span>
                    <span>LNG: {mapCenter[1].toFixed(4)}</span>
                 </div>
              </CardContent>
           </Card>
           
           <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 flex gap-3">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full h-fit">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p>
                Broadcasting this request will immediately trigger push notifications to <strong>1,204</strong> active donors in the selected radius.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

// --- View Alerts Page ---
export const ActiveRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // New States for Filtered Donation Logic
  const [sourceHospital, setSourceHospital] = useState('');
  const [validSources, setValidSources] = useState<{name: string, distance: number}[]>([]);
  const [distance, setDistance] = useState<number | null>(null);

  // Load requests from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bloodBridge_requests');
    if (stored) {
      setRequests(JSON.parse(stored));
    } else {
      // Initialize with constants if empty
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem('bloodBridge_requests', JSON.stringify(INITIAL_REQUESTS));
    }
  }, []);

  // When a request is selected, calculate valid nearby hospitals
  useEffect(() => {
    if (selectedRequest && donateModalOpen) {
      const targetCoords = HOSPITAL_DETAILS[selectedRequest.hospitalName];
      if (!targetCoords) {
        setValidSources([]);
        return;
      }

      // Parse radius (e.g. "5km" -> 5)
      const radiusLimit = parseInt(selectedRequest.radius); 

      const validList = HOSPITALS
        .filter(h => h !== selectedRequest.hospitalName) // Cannot donate from same hospital
        .map(h => {
          const coords = HOSPITAL_DETAILS[h];
          if (!coords) return null;
          const dist = calculateDistance(targetCoords.lat, targetCoords.lng, coords.lat, coords.lng);
          return { name: h, distance: dist };
        })
        .filter((item): item is {name: string, distance: number} => item !== null && item.distance <= radiusLimit)
        .sort((a, b) => a.distance - b.distance);

      setValidSources(validList);
      setSourceHospital('');
      setDistance(null);
    }
  }, [selectedRequest, donateModalOpen]);

  // When source is selected, calculate final distance
  useEffect(() => {
    if (sourceHospital && selectedRequest) {
      const targetCoords = HOSPITAL_DETAILS[selectedRequest.hospitalName];
      const sourceCoords = HOSPITAL_DETAILS[sourceHospital];
      if (targetCoords && sourceCoords) {
        const d = calculateDistance(targetCoords.lat, targetCoords.lng, sourceCoords.lat, sourceCoords.lng);
        setDistance(d);
      }
    }
  }, [sourceHospital, selectedRequest]);

  const handleDonateClick = (req: Request) => {
    setSelectedRequest(req);
    setDonateModalOpen(true);
  };

  const confirmDonation = () => {
    if (selectedRequest) {
      // Update status to Fulfilled instead of deleting
      const updated = requests.map(r => 
        r.id === selectedRequest.id 
        ? { 
            ...r, 
            status: 'Fulfilled' as const, 
            fulfilledBy: sourceHospital ? `Transfer from ${sourceHospital}` : 'Volunteer Donor' 
          } 
        : r
      );
      
      setRequests(updated);
      localStorage.setItem('bloodBridge_requests', JSON.stringify(updated));
      setDonateModalOpen(false);
      setSelectedRequest(null);
      setSourceHospital('');
    }
  };

  const handleGetDirections = () => {
    if (selectedRequest) {
        const query = encodeURIComponent(`${selectedRequest.hospitalName}, ${selectedRequest.location}`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
    }
  };

  // Filter to only show Active requests in this view
  const activeRequestsList = requests.filter(r => r.status === 'Active');

  // Map coordinates helpers for the modal
  const reqCoords = selectedRequest ? HOSPITAL_DETAILS[selectedRequest.hospitalName] : null;
  const srcCoords = sourceHospital ? HOSPITAL_DETAILS[sourceHospital] : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-xl shadow-lg">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">Live Alerts</h2>
           <p className="text-slate-400 text-sm">Real-time feed of urgent requirements.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
           <span className="font-medium">{activeRequestsList.length} Active Cases</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeRequestsList.map(req => (
          <Card key={req.id} className={`group border-t-4 shadow-md hover:shadow-xl transition-all duration-300 ${req.urgency === 'Critical' ? 'border-t-red-600' : 'border-t-orange-500'}`}>
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start mb-4">
                 <Badge variant={req.urgency === 'Critical' ? 'destructive' : 'warning'}>
                    {req.urgency} Urgency
                 </Badge>
                 <div className="flex items-center text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                   <Clock className="h-3 w-3 mr-1" />
                   Just now
                 </div>
              </div>
              
              <div className="mb-6">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate" title={req.hospitalName}>{req.hospitalName}</h3>
                 <div className="flex items-center text-sm text-slate-500 mt-1">
                   <MapPin className="h-4 w-4 mr-1 text-slate-400 shrink-0" />
                   <span className="truncate" title={req.location}>{req.location}</span>
                 </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Type</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{req.bloodType}</div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Needed</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{req.quantity} <span className="text-xs font-medium text-slate-400">Units</span></div>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={() => handleDonateClick(req)}>
                <CheckCircle2 className="h-4 w-4" /> Accept & Donate
              </Button>
            </CardContent>
          </Card>
        ))}
        {activeRequestsList.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-xl font-semibold text-slate-700">All Clear!</p>
            <p className="mt-2">There are no active urgent requests at this moment.</p>
          </div>
        )}
      </div>

      <Dialog open={donateModalOpen} onOpenChange={setDonateModalOpen} title="Confirm Donation Intent" className="max-w-2xl">
        <div className="space-y-6 pt-2">
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">Requiring Hospital</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xl">{selectedRequest?.hospitalName}</h4>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {selectedRequest?.location}
                </div>
              </div>
              <Badge variant="outline" className="bg-white dark:bg-slate-900">{selectedRequest?.radius} Range</Badge>
            </div>
            
            <div className="mt-4 flex gap-3">
              <Button size="sm" variant="outline" className="h-9 text-xs flex-1" onClick={() => window.location.href = `tel:911`}>
                <Phone className="h-3.5 w-3.5 mr-2" /> Call Hospital
              </Button>
              <Button size="sm" variant="outline" className="h-9 text-xs flex-1" onClick={handleGetDirections}>
                <Navigation className="h-3.5 w-3.5 mr-2" /> Get Directions
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Source Hospital / Blood Bank</label>
            <Select 
               options={[
                 { value: '', label: 'Select nearby facility...' },
                 ...validSources.map(s => ({ value: s.name, label: `${s.name} (${s.distance.toFixed(1)} km)` }))
               ]}
               value={sourceHospital}
               onChange={(e) => setSourceHospital(e.target.value)}
            />
            {validSources.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No other registered hospitals found within the {selectedRequest?.radius} radius.</p>
            )}
          </div>

          {sourceHospital && reqCoords && srcCoords && (
             <div className="rounded-xl overflow-hidden border border-slate-200 h-64 relative">
                <MapContainer 
                    center={[reqCoords.lat, reqCoords.lng]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer 
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <Marker position={[reqCoords.lat, reqCoords.lng]} icon={markerIcon}>
                       <Popup>Request: {selectedRequest?.hospitalName}</Popup>
                    </Marker>
                    <Marker position={[srcCoords.lat, srcCoords.lng]} icon={sourceIcon}>
                       <Popup>Source: {sourceHospital}</Popup>
                    </Marker>
                    <Polyline 
                      positions={[[reqCoords.lat, reqCoords.lng], [srcCoords.lat, srcCoords.lng]]}
                      pathOptions={{ color: '#3b82f6', dashArray: '5, 10', weight: 3 }}
                    />
                    <MapUpdater center={[reqCoords.lat, reqCoords.lng]} zoom={12} />
                </MapContainer>
                
                {/* Overlay Text for better satellite readability */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-700 text-sm font-bold text-white z-[400] flex items-center gap-2">
                   <Navigation className="h-4 w-4 text-blue-400" />
                   Distance: {distance?.toFixed(2)} km
                </div>
             </div>
          )}

          <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900 flex items-start gap-3">
             <div className="bg-green-100 rounded-full p-1 mt-0.5"><CheckCircle2 className="h-4 w-4 text-green-700" /></div>
             <div className="text-sm text-green-800 dark:text-green-300">
               Confirming will notify <strong>{selectedRequest?.hospitalName}</strong> of the incoming transfer from <strong>{sourceHospital || 'Selection'}</strong>.
             </div>
          </div>

          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg" 
            onClick={confirmDonation}
            disabled={!sourceHospital}
          >
            Confirm & Dispatch Logistics
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
