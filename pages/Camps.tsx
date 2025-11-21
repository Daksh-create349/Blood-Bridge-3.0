
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import { INITIAL_CAMPS } from '../constants';
import { Card, CardContent, Button, Dialog, Input, Badge } from '../components/ui/UIComponents';
import { Calendar, Clock, MapPin, Camera, Download, User, Share2, Crosshair, Navigation, Layers, Globe, Maximize, Minimize } from 'lucide-react';
import L from 'leaflet';

// Fix for Leaflet default icon issues in Webpack/React environments
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

// --- Custom Icons ---
const campIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Google Maps Style User Dot
const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div class="relative flex h-4 w-4">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-lg"></span>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10]
});

// --- Helper: Map Updater to Fly to Location ---
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, map]);
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

// --- Webcam Component ---
const WebcamCapture = ({ onCapture }: { onCapture: (img: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    enableStream();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 320, 240);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative rounded-2xl overflow-hidden border-4 border-slate-200 bg-black shadow-inner">
         <video ref={videoRef} autoPlay playsInline muted width={320} height={240} className="object-cover" />
         <canvas ref={canvasRef} width={320} height={240} className="hidden" />
      </div>
      <div className="text-center space-y-2">
        <h4 className="font-medium">Align your face</h4>
        <p className="text-xs text-slate-500">Make sure you are in a well-lit environment.</p>
      </div>
      <Button onClick={capture} type="button" size="lg" className="rounded-full px-8">
        <Camera className="mr-2 h-4 w-4" /> Capture Photo
      </Button>
    </div>
  );
};

const Camps: React.FC = () => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCamp, setSelectedCamp] = useState<typeof INITIAL_CAMPS[0] | null>(null);
  const [userData, setUserData] = useState({ name: '', age: '', photo: '' });

  // Geolocation State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [campsList, setCampsList] = useState<Array<typeof INITIAL_CAMPS[0] & { distance?: number }>>(INITIAL_CAMPS);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const [isMaximized, setIsMaximized] = useState(false);

  // Default Center (New York for demo)
  const defaultCenter: [number, number] = [40.75, -73.98];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) setIsMaximized(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMaximized]);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        
        // Check distance to initial camps
        const distances = INITIAL_CAMPS.map(c => calculateDistance(latitude, longitude, c.lat, c.lng));
        const minDistance = Math.min(...distances);

        let displayCamps = [];

        // Smart Mocking: If user is > 100km away from default camps, generate local ones
        if (minDistance > 100) {
          const localCamps = [
            {
              id: 'loc_1',
              name: 'Local Community Drive',
              organizer: 'City Health Dept',
              locationName: 'Civic Center nearby',
              lat: latitude + 0.005 + (Math.random() * 0.01 - 0.005),
              lng: longitude + 0.005 + (Math.random() * 0.01 - 0.005),
              date: '2023-11-25',
              time: '09:00 AM - 02:00 PM',
            },
            {
              id: 'loc_2',
              name: 'Corporate Park Donation',
              organizer: 'Rotary Club',
              locationName: 'Tech Park Block A',
              lat: latitude - 0.008 + (Math.random() * 0.01 - 0.005),
              lng: longitude - 0.003 + (Math.random() * 0.01 - 0.005),
              date: '2023-11-28',
              time: '10:00 AM - 05:00 PM',
            },
            {
              id: 'loc_3',
              name: 'University Camp',
              organizer: 'NSS Unit',
              locationName: 'University Main Hall',
              lat: latitude + 0.002 + (Math.random() * 0.01 - 0.005),
              lng: longitude - 0.01 + (Math.random() * 0.01 - 0.005),
              date: '2023-12-01',
              time: '09:00 AM - 04:00 PM',
            }
          ];

          displayCamps = localCamps.map(camp => ({
            ...camp,
            distance: calculateDistance(latitude, longitude, camp.lat, camp.lng)
          })).sort((a, b) => a.distance - b.distance);

        } else {
           // User is close to default camps, just sort them
           displayCamps = INITIAL_CAMPS.map(camp => ({
            ...camp,
            distance: calculateDistance(latitude, longitude, camp.lat, camp.lng)
          })).sort((a, b) => a.distance - b.distance);
        }
        
        setCampsList(displayCamps);
        setLoadingLoc(false);
      },
      (error) => {
        console.error("Location error", error);
        setLoadingLoc(false);
        // alert("Unable to retrieve location. Showing all camps.");
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleRegisterClick = (camp: typeof INITIAL_CAMPS[0]) => {
    setSelectedCamp(camp);
    setRegisterOpen(true);
    setStep(1);
    setUserData({ name: '', age: '', photo: '' });
  };

  const handlePhotoCaptured = (photo: string) => {
    setUserData(prev => ({ ...prev, photo }));
    setStep(3); // Go to ticket
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Upcoming Donation Drives</h2>
           <p className="text-slate-500 mt-1">Find and register for blood donation camps near you.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={fetchLocation} isLoading={loadingLoc} className="hidden sm:flex bg-white dark:bg-slate-900">
             <Crosshair className="h-4 w-4 mr-2" /> Locate Me
           </Button>
        </div>
      </div>

      {/* --- Map Section --- */}
      <div className={`transition-all duration-300 ease-in-out shadow-2xl border border-white/20 bg-slate-100 dark:bg-slate-900 group overflow-hidden ${isMaximized ? 'fixed inset-0 z-[100] h-screen w-screen rounded-none' : 'relative h-[500px] w-full rounded-3xl z-0'}`}>
        
        {/* Custom Map Controls Overlay */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
           <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-1 flex flex-col">
              <button 
                onClick={() => setMapMode('street')}
                className={`p-2 rounded-md transition-all ${mapMode === 'street' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title="Street View"
              >
                <Layers className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setMapMode('satellite')}
                className={`p-2 rounded-md transition-all ${mapMode === 'satellite' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title="Satellite View"
              >
                <Globe className="h-5 w-5" />
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className={`p-2 rounded-md transition-all text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800`}
                title={isMaximized ? "Minimize Map" : "Maximize Map"}
              >
                {isMaximized ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
           </div>
        </div>

        <MapContainer 
          center={userLocation || defaultCenter} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={false} // We will add custom or rely on scroll
        >
          <MapUpdater center={userLocation || defaultCenter} />
          
          {/* 
             Esri World Street Map: Looks very close to Google Maps (Roads, Buildings).
             Esri World Imagery: Realistic Satellite view.
          */}
          {mapMode === 'street' ? (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
             <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
               <Popup className="custom-popup">
                 <div className="font-semibold text-sm">Your Location</div>
               </Popup>
            </Marker>
          )}

          {/* Camp Markers */}
          {campsList.map(camp => (
            <Marker key={camp.id} position={[camp.lat, camp.lng]} icon={campIcon}>
              <Popup>
                <div className="p-2 min-w-[180px] text-center font-sans">
                  <h3 className="font-bold text-sm mb-1 text-slate-900">{camp.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{camp.locationName}</p>
                  {camp.distance !== undefined && (
                    <div className="mb-2 inline-flex items-center justify-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <Navigation className="h-3 w-3 mr-1" /> {camp.distance.toFixed(1)} km away
                    </div>
                  )}
                  <Button size="sm" className="w-full text-xs h-8" onClick={() => handleRegisterClick(camp)}>Register</Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Floating Location Button */}
        <div className="absolute bottom-6 right-6 z-[400]">
           <button 
             onClick={fetchLocation}
             className="h-12 w-12 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-transform hover:scale-105 active:scale-95 border border-slate-100 dark:border-slate-700"
             title="Re-center Map"
           >
             <Crosshair className={`h-6 w-6 ${loadingLoc ? 'animate-spin' : ''}`} />
           </button>
        </div>

        {/* Glass Panel Info Overlay */}
        <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700 max-w-xs transition-all">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Nearby Camps</div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{campsList.length} Locations</div>
          <div className="text-xs text-slate-500 mt-1">{userLocation ? 'Sorted by distance' : 'Showing all active camps'}</div>
        </div>
      </div>

      {/* --- Cards List --- */}
      <div className="grid gap-6 md:grid-cols-2">
        {campsList.map(camp => (
          <Card key={camp.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row h-full">
                 {/* Date Column */}
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center min-w-[120px] border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary-500"></div>
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{camp.date.split('-')[2]}</span>
                    <span className="text-sm font-bold uppercase text-primary-600 tracking-widest">Nov</span>
                    <span className="text-xs text-slate-400 mt-1">2023</span>
                 </div>

                 {/* Details Column */}
                 <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{camp.name}</h3>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mt-1">{camp.organizer}</p>
                      </div>
                      {camp.distance !== undefined && (
                        <Badge variant={camp.distance < 5 ? "success" : "default"} className="ml-2 shrink-0 h-fit">
                          <Navigation className="h-3 w-3 mr-1" /> {camp.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-primary-400" /> {camp.time}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-primary-400" /> {camp.locationName}
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Button className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-colors shadow-none" onClick={() => handleRegisterClick(camp)}>
                        Register to Participate
                      </Button>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Registration Modal --- */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen} title={step === 3 ? "Registration Confirmed" : "Donor Registration"}>
        {step === 1 && (
          <div className="space-y-5 py-2">
            <Input 
              label="Full Name" 
              placeholder="As on your ID proof"
              value={userData.name} 
              onChange={e => setUserData({...userData, name: e.target.value})} 
            />
            <Input 
              label="Age" 
              type="number"
              placeholder="Must be 18+"
              value={userData.age} 
              onChange={e => setUserData({...userData, age: e.target.value})} 
            />
            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID Proof</label>
               <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <User className="h-6 w-6 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Click to upload Aadhar / Pan / License</span>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF</p>
               </div>
            </div>
            <Button className="w-full" size="lg" onClick={() => setStep(2)} disabled={!userData.name || !userData.age}>Next Step</Button>
          </div>
        )}

        {step === 2 && (
          <WebcamCapture onCapture={handlePhotoCaptured} />
        )}

        {step === 3 && (
          <div className="space-y-6 text-center py-2">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg dark:bg-slate-900 dark:border-slate-800 relative">
              <div className="bg-primary-600 h-2"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                   <div className="text-left">
                      <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">Event Pass</div>
                      <div className="font-bold text-xl text-primary-700 mt-1">Blood Bridge</div>
                   </div>
                   <img src={userData.photo} className="h-16 w-16 rounded-lg object-cover border-2 border-white shadow-sm" alt="User" />
                </div>
                
                <div className="text-left space-y-4">
                   <div>
                     <div className="text-xs text-slate-400 uppercase">Attendee</div>
                     <div className="font-semibold text-lg">{userData.name}</div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="text-xs text-slate-400 uppercase">Event</div>
                        <div className="font-medium text-sm">{selectedCamp?.name}</div>
                     </div>
                     <div>
                        <div className="text-xs text-slate-400 uppercase">Date</div>
                        <div className="font-medium text-sm">{selectedCamp?.date}</div>
                     </div>
                   </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-dashed border-slate-200 flex items-center justify-between">
                   <div className="text-xs text-left text-slate-400">
                     Show this ticket at the <br/> registration desk.
                   </div>
                   <div className="h-12 w-12 bg-slate-900 p-1">
                     <div className="h-full w-full bg-white opacity-90" style={{backgroundImage: 'radial-gradient(#000 30%, transparent 30%)', backgroundSize: '3px 3px'}}></div>
                   </div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Save to Gallery
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Camps;
