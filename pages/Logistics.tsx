import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../components/ui/UIComponents';
import { INITIAL_SHIPMENTS, INITIAL_REQUESTS, INITIAL_RESOURCES, HOSPITAL_DETAILS } from '../constants';
import { Shipment, AgentLog } from '../types';
import { runAutonomousLogisticsAgent } from '../services/geminiService';
import { Truck, Plane, Navigation, AlertTriangle, CheckCircle2, Crosshair, Bot, Zap, Terminal, Activity } from 'lucide-react';
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
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  
  // Agent State
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  // Scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [agentLogs]);

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
          setUserLocation([19.0330, 73.0297]);
          setLoadingLoc(false);
        }
      );
    }
  }, []);

  // 2. Simulation Loop (Vehicle Movement)
  useEffect(() => {
    const interval = setInterval(() => {
      setShipments(prevShipments => {
        return prevShipments.map(shipment => {
          if (shipment.status !== 'In Transit') return shipment;

          const distLat = Math.abs(shipment.destLat - shipment.currentLat);
          const distLng = Math.abs(shipment.destLng - shipment.currentLng);

          if (distLat < 0.0005 && distLng < 0.0005) {
             return { ...shipment, status: 'Delivered', eta: 'Arrived' };
          }

          const speedFactor = 0.0015; 
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
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  // 3. Agent Logic Loop
  useEffect(() => {
    let agentInterval: any;

    if (isAutopilot) {
      // Add initial activation log
      setAgentLogs(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: "Autopilot engaged. Monitoring network for critical deficits...",
        type: 'info'
      }]);

      agentInterval = setInterval(async () => {
        if (processingRef.current) return;
        processingRef.current = true;

        try {
          // Get requests from local storage to be "live"
          const storedRequests = localStorage.getItem('bloodBridge_requests');
          const currentRequests = storedRequests ? JSON.parse(storedRequests) : INITIAL_REQUESTS;

          const actions = await runAutonomousLogisticsAgent(currentRequests, INITIAL_RESOURCES);

          if (actions.length > 0) {
            actions.forEach(act => {
              if (act.action === 'DISPATCH') {
                 const { origin, destination, bloodType, units, method, reason } = act.details;
                 
                 // Create visual shipment
                 const originCoords = HOSPITAL_DETAILS[origin] || { lat: 19.0330, lng: 73.0297 };
                 const destCoords = HOSPITAL_DETAILS[destination] || { lat: 19.0760, lng: 72.9980 };

                 const newShipment: Shipment = {
                   id: `auto-${Math.floor(Math.random() * 10000)}`,
                   origin,
                   destination,
                   bloodType: bloodType as any,
                   units,
                   status: 'In Transit',
                   method,
                   eta: method === 'Drone' ? '15 mins' : '45 mins',
                   priority: 'Critical',
                   currentLat: originCoords.lat,
                   currentLng: originCoords.lng,
                   destLat: destCoords.lat,
                   destLng: destCoords.lng
                 };

                 setShipments(prev => [newShipment, ...prev]);
                 
                 setAgentLogs(prev => [...prev, {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleTimeString(),
                    message: `CRITICAL MATCH: Dispatching ${method} from ${origin} to ${destination} (${units} units ${bloodType}). Reason: ${reason}`,
                    type: 'success'
                 }]);
              }
            });
          } else {
            // Heartbeat log occasionally
            if (Math.random() > 0.7) {
                setAgentLogs(prev => [...prev, {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleTimeString(),
                    message: "Network scan complete. No new critical interventions required.",
                    type: 'info'
                }]);
            }
          }

        } catch (e) {
          console.error(e);
        } finally {
          processingRef.current = false;
        }

      }, 8000); // Run agent every 8 seconds
    } else {
      setAgentLogs([]);
    }

    return () => clearInterval(agentInterval);
  }, [isAutopilot]);

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      
      {/* Left Panel: Control Tower & Agent Terminal */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full overflow-hidden">
         
         {/* Agent Toggle Card */}
         <Card className={`shrink-0 border-0 transition-all duration-500 ${isAutopilot ? 'bg-gradient-to-r from-indigo-900 to-purple-900 shadow-xl shadow-purple-900/20' : 'bg-slate-900'}`}>
           <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isAutopilot ? 'bg-white text-purple-600 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    <Bot className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-white leading-tight">Gemini Autopilot</h3>
                    <p className="text-xs text-slate-300 opacity-80">{isAutopilot ? 'AI Agent Active' : 'Manual Control'}</p>
                 </div>
              </div>
              <div 
                 className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${isAutopilot ? 'bg-green-500' : 'bg-slate-600'}`}
                 onClick={() => setIsAutopilot(!isAutopilot)}
              >
                 <div className={`bg-white h-6 w-6 rounded-full shadow-sm transition-transform ${isAutopilot ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
           </CardContent>
         </Card>

         {/* Agent Terminal (Visible only when Active) */}
         {isAutopilot && (
           <Card className="shrink-0 bg-black border-slate-800 font-mono text-xs overflow-hidden flex flex-col h-48 animate-in slide-in-from-top-4">
              <div className="bg-slate-900 p-2 border-b border-slate-800 flex items-center gap-2">
                 <Terminal className="h-3 w-3 text-green-500" />
                 <span className="text-slate-400">agent_log.txt</span>
                 <div className="ml-auto flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                 </div>
              </div>
              <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-green-400/90 custom-scrollbar">
                 {agentLogs.map(log => (
                    <div key={log.id} className="animate-in fade-in slide-in-from-left-2">
                       <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                       <span className={log.type === 'success' ? 'text-blue-400 font-bold' : ''}>
                          {log.type === 'success' ? '>> ACTION: ' : '> '}
                          {log.message}
                       </span>
                    </div>
                 ))}
                 <div className="animate-pulse">_</div>
              </div>
           </Card>
         )}

         {/* Stats Panel */}
         <Card className="shrink-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="text-2xl font-bold text-slate-900 dark:text-white">{shipments.filter(s => s.status === 'In Transit').length}</div>
                     <div className="text-xs text-slate-500 uppercase tracking-wider">In Transit</div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="text-2xl font-bold text-green-600">{shipments.filter(s => s.status === 'Delivered').length}</div>
                     <div className="text-xs text-slate-500 uppercase tracking-wider">Delivered</div>
                  </div>
            </CardContent>
         </Card>

         {/* Active Shipments List */}
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
                           {shipment.id.startsWith('auto') && <Badge className="bg-purple-100 text-purple-700 h-5 px-1.5 text-[10px]">AI</Badge>}
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
                        {shipment.id.startsWith('auto') && <div className="text-xs text-purple-600 font-bold mt-1">AI Dispatched</div>}
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
            <button 
                onClick={() => {
                    if(navigator.geolocation) {
                        setLoadingLoc(true);
                        navigator.geolocation.getCurrentPosition(
                            pos => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); setLoadingLoc(false); },
                            () => setLoadingLoc(false)
                        )
                    }
                }}
                className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-slate-700"
            >
               <Crosshair className={`h-6 w-6 ${loadingLoc ? 'animate-spin' : ''}`} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default Logistics;