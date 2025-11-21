
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../components/ui/UIComponents';
import { INITIAL_SHIPMENTS } from '../constants';
import { Truck, Plane, Navigation, AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- Custom Icons for Map ---
const droneIcon = L.divIcon({
  className: 'custom-drone-icon',
  html: `
    <div class="relative flex items-center justify-center h-8 w-8 bg-white rounded-full border-2 border-blue-600 shadow-lg transition-transform duration-1000">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-blue-600"><path d="M2 8h20"/><path d="M12 2v20"/><path d="M5.5 19a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/><path d="M18.5 19a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10]
});

const ambulanceIcon = L.divIcon({
  className: 'custom-ambulance-icon',
  html: `
    <div class="relative flex items-center justify-center h-8 w-8 bg-white rounded-full border-2 border-red-600 shadow-lg transition-transform duration-1000">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-red-600"><path d="M10 17h4"/><path d="M19 17h2v-6l-3-5h-9l-3 5v6h2"/><path d="M14 17a2.5 2.5 0 0 0-5 0"/><path d="M12 9v4"/><path d="M10 11h4"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10]
});

const destinationIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `
    <div class="h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div class="relative flex h-4 w-4">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10]
});

// Helper to re-center map
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if(lat && lng) map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

const Logistics: React.FC = () => {
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // 1. Fetch User Location
  useEffect(() => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoadingLoc(false);
        },
        (error) => {
          console.error("Error fetching location", error);
          // Fallback to Navi Mumbai center if fail
          setUserLocation([19.0330, 73.0297]);
          setLoadingLoc(false);
        }
      );
    }
  }, []);

  // 2. Simulation Loop (2 Minute Delivery)
  useEffect(() => {
    const interval = setInterval(() => {
      setShipments(prevShipments => {
        return prevShipments.map(shipment => {
          // Only move active shipments
          if (shipment.status !== 'In Transit') return shipment;

          // Distance check
          const distLat = Math.abs(shipment.destLat - shipment.currentLat);
          const distLng = Math.abs(shipment.destLng - shipment.currentLng);

          // Threshold to consider "Arrived" (approx 50 meters)
          if (distLat < 0.0005 && distLng < 0.0005) {
             return { ...shipment, status: 'Delivered', eta: 'Arrived' };
          }

          // Move towards destination
          // We want it to take roughly 2 minutes (120 seconds)
          // Assuming 1 update per second.
          // We calculate the step size based on remaining distance / 120 (simplification)
          // To make it visible, we use a fixed step size that ensures movement
          const speedFactor = 0.0015; // Adjust this for speed
          
          const angle = Math.atan2(shipment.destLat - shipment.currentLat, shipment.destLng - shipment.currentLng);
          const moveLat = Math.sin(angle) * speedFactor;
          const moveLng = Math.cos(angle) * speedFactor;

          return {
            ...shipment,
            currentLat: shipment.currentLat + moveLat,
            currentLng: shipment.currentLng + moveLng
          };
        });
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      
      {/* Left Panel: Shipment List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full overflow-hidden">
         <Card className="shrink-0 bg-slate-900 text-white border-slate-800">
            <CardHeader className="pb-2">
               <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="text-xl">Control Tower</CardTitle>
                     <p className="text-slate-400 text-sm">Live Tracking System</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50">
                     <Navigation className="h-5 w-5 text-white" />
                  </div>
               </div>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                     <div className="text-2xl font-bold">{shipments.filter(s => s.status === 'In Transit').length}</div>
                     <div className="text-xs text-slate-400 uppercase tracking-wider">In Transit</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                     <div className="text-2xl font-bold text-green-400">{shipments.filter(s => s.status === 'Delivered').length}</div>
                     <div className="text-xs text-slate-400 uppercase tracking-wider">Delivered</div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {shipments.map(shipment => (
               <Card key={shipment.id} className={`border-l-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  shipment.status === 'Delivered' ? 'border-l-green-500 opacity-75' :
                  shipment.priority === 'Critical' ? 'border-l-red-500' : 
                  shipment.priority === 'High' ? 'border-l-orange-500' : 'border-l-blue-500'
               }`}>
                  <CardContent className="p-4">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           {shipment.method === 'Drone' ? <Plane className="h-4 w-4 text-blue-500" /> : <Truck className="h-4 w-4 text-slate-500" />}
                           <span className="font-bold text-sm text-slate-900 dark:text-white">{shipment.id}</span>
                        </div>
                        <Badge variant={shipment.status === 'In Transit' ? 'warning' : shipment.status === 'Delivered' ? 'success' : 'outline'} className="text-xs">
                           {shipment.status}
                        </Badge>
                     </div>
                     
                     <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                           <div className="flex flex-col items-center gap-1 mt-0.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                              <div className="h-3 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                              <div className={`h-1.5 w-1.5 rounded-full ${shipment.status === 'Delivered' ? 'bg-green-500' : 'bg-primary-500'}`}></div>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="truncate w-48">{shipment.origin}</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-48">{shipment.destination}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                           <div className={`h-8 w-8 rounded-md flex items-center justify-center font-bold text-xs text-white ${
                              shipment.bloodType.includes('O') ? 'bg-red-500' : 'bg-slate-600'
                           }`}>
                              {shipment.bloodType}
                           </div>
                           <div className="text-xs">
                              <div className="font-bold">{shipment.units} Units</div>
                              <div className="text-slate-400">{shipment.priority}</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs text-slate-400 uppercase">ETA</div>
                           <div className="text-sm font-bold text-green-600 dark:text-green-400">
                              {shipment.status === 'Delivered' ? 'ARRIVED' : shipment.eta}
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>

      {/* Right Panel: Live Map */}
      <div className="flex-1 h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl relative">
         <MapContainer 
            center={[19.0450, 73.0400]} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
         >
            {userLocation && <RecenterMap lat={userLocation[0]} lng={userLocation[1]} />}

            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* User Location Marker */}
            {userLocation && (
               <Marker position={userLocation} icon={userIcon}>
                  <Popup className="custom-popup">
                     <div className="font-bold text-sm">You are here</div>
                  </Popup>
               </Marker>
            )}

            {shipments.map(shipment => (
               <React.Fragment key={shipment.id}>
                  {/* Route Line */}
                  <Polyline 
                     positions={[
                        // If In Transit, draw from Current to Dest. If Delivered, line disappears or stays full? Let's keep it for visual.
                        [shipment.currentLat, shipment.currentLng], 
                        [shipment.destLat, shipment.destLng]
                     ]} 
                     pathOptions={{ 
                        color: shipment.status === 'Delivered' ? '#22c55e' : (shipment.method === 'Drone' ? '#3b82f6' : '#ef4444'), 
                        weight: 2, 
                        dashArray: shipment.status === 'Delivered' ? undefined : '5, 10',
                        opacity: 0.6 
                     }} 
                  />
                  
                  {/* Vehicle Marker */}
                  <Marker 
                     position={[shipment.currentLat, shipment.currentLng]} 
                     icon={shipment.method === 'Drone' ? droneIcon : ambulanceIcon}
                  >
                     <Popup className="custom-popup">
                        <div className="font-bold text-sm">{shipment.id} ({shipment.method})</div>
                        <div className="text-xs">To: {shipment.destination}</div>
                        <div className="text-xs mt-1 font-semibold text-green-600">Status: {shipment.status}</div>
                     </Popup>
                  </Marker>

                  {/* Destination Marker */}
                  <Marker position={[shipment.destLat, shipment.destLng]} icon={destinationIcon} />
               </React.Fragment>
            ))}
         </MapContainer>
         
         {/* Map Overlay Stats */}
         <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-lg border border-slate-700 shadow-lg">
               <div className="flex items-center gap-2 text-sm font-bold mb-2">
                  <Plane className="h-4 w-4 text-blue-400" /> Active Drones
               </div>
               <div className="text-2xl font-mono">{shipments.filter(s => s.method === 'Drone' && s.status === 'In Transit').length}</div>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-lg border border-slate-700 shadow-lg">
               <div className="flex items-center gap-2 text-sm font-bold mb-2">
                  <Truck className="h-4 w-4 text-red-400" /> Ambulances
               </div>
               <div className="text-2xl font-mono">{shipments.filter(s => s.method === 'Ambulance' && s.status === 'In Transit').length}</div>
            </div>
         </div>

         {/* User Location Button */}
         <div className="absolute bottom-6 right-6 z-[400]">
            <button className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-slate-700">
               <Crosshair className={`h-6 w-6 ${loadingLoc ? 'animate-spin' : ''}`} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default Logistics;
