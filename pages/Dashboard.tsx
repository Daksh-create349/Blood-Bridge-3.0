
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Select, Button, Badge, Dialog } from '../components/ui/UIComponents';
import { INITIAL_RESOURCES } from '../constants';
import { Resource, Status } from '../types';
import { AlertTriangle, RefreshCcw, Search, CheckCircle2, TrendingUp, TrendingDown, ExternalLink, Star, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for Leaflet default icon issues
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const hospitalIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const Dashboard: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Update Modal State
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [newUnits, setNewUnits] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');

  // Location Map Modal State
  const [viewLocationResource, setViewLocationResource] = useState<Resource | null>(null);

  // Stats
  const criticalCount = resources.filter(r => r.units < 5).length;
  const lowCount = resources.filter(r => r.units >= 5 && r.units < 10).length;
  const healthyCount = resources.filter(r => r.units >= 10).length;

  const getStatus = (units: number): Status => {
    if (units < 5) return 'Critical';
    if (units < 10) return 'Low';
    return 'Available';
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.bloodType.toLowerCase().includes(search.toLowerCase()) || 
                          r.location.toLowerCase().includes(search.toLowerCase());
    const status = getStatus(r.units);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateClick = (resource: Resource) => {
    setSelectedResource(resource);
    setNewUnits(resource.units.toString());
    setIsAdmin(false);
    setPassword('');
  };

  const handleAdminAuth = () => {
    if (password === 'admin') {
      setIsAdmin(true);
    } else {
      alert("Invalid password (use 'admin')");
    }
  };

  const handleSaveUpdate = () => {
    if (selectedResource) {
      setResources(prev => prev.map(r => r.id === selectedResource.id ? { ...r, units: parseInt(newUnits) || 0, lastUpdated: new Date().toISOString() } : r));
      setSelectedResource(null);
    }
  };

  const handleGetDirections = () => {
    if (viewLocationResource) {
      // Open Google Maps in a new tab with the destination set to the resource's coordinates
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${viewLocationResource.lat},${viewLocationResource.lng}`, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      {/* Summaries */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-l-4 border-l-red-500">
          <div className="absolute right-0 top-0 p-6 opacity-5">
             <AlertTriangle className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Critical Supplies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{criticalCount}</div>
              <span className="text-sm font-medium text-red-500 flex items-center"><TrendingDown className="h-3 w-3 mr-1"/> Urgent</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Units below 5</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute right-0 top-0 p-6 opacity-5">
             <AlertTriangle className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Low Supplies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{lowCount}</div>
              <span className="text-sm font-medium text-amber-500 flex items-center"><TrendingDown className="h-3 w-3 mr-1"/> Warning</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Units below 10</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
          <div className="absolute right-0 top-0 p-6 opacity-5">
             <CheckCircle2 className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Healthy Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{healthyCount}</div>
              <span className="text-sm font-medium text-green-500 flex items-center"><TrendingUp className="h-3 w-3 mr-1"/> Stable</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Units above 10</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
             <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
             <Input 
                placeholder="Search hospital or blood type..." 
                className="pl-10 bg-slate-50 border-transparent focus:bg-white transition-colors"
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
          </div>
          <div className="w-full sm:w-48">
            <Select 
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Available', label: 'Available' },
                { value: 'Low', label: 'Low' },
                { value: 'Critical', label: 'Critical' }
              ]}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border-transparent focus:bg-white"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Showing <strong>{filteredResources.length}</strong> resources
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredResources.map(resource => {
           const status = getStatus(resource.units);
           const badgeVariant = status === 'Critical' ? 'destructive' : status === 'Low' ? 'warning' : 'success';
           const progressColor = status === 'Critical' ? 'bg-red-500' : status === 'Low' ? 'bg-amber-500' : 'bg-green-500';
           const maxUnits = 30; // assumption for progress bar
           const percentage = Math.min((resource.units / maxUnits) * 100, 100);
           
           return (
             <Card key={resource.id} className="overflow-hidden group hover:border-primary-200 dark:hover:border-primary-900">
               <div className={`h-1.5 w-full ${progressColor}`} />
               <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex flex-col">
                      <span className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{resource.bloodType}</span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Type</span>
                   </div>
                   <Badge variant={badgeVariant}>{status}</Badge>
                 </div>
                 
                 <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-sm mb-1">
                       <span className="text-slate-500 font-medium">Quantity</span>
                       <span className="font-bold text-slate-900 dark:text-slate-100">{resource.units} Units</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                        <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                     </div>
                   </div>

                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                     <div 
                        className="flex items-center gap-2 cursor-pointer group/hospital" 
                        onClick={() => setViewLocationResource(resource)}
                     >
                       <div className="min-w-[4px] mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 group-hover/hospital:bg-primary-500 transition-colors"></div>
                       <span className="text-sm text-slate-600 dark:text-slate-400 truncate group-hover/hospital:text-primary-600 group-hover/hospital:underline transition-colors font-medium" title="View on Map">
                          {resource.hospital}
                       </span>
                       <ExternalLink className="h-3 w-3 opacity-0 group-hover/hospital:opacity-100 text-primary-500 transition-opacity" />
                     </div>
                     <div className="flex items-start gap-2">
                       <div className="min-w-[4px] mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                       <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{resource.location}</span>
                     </div>
                   </div>
                 </div>

                 <Button 
                   variant="ghost" 
                   className="w-full mt-6 border border-slate-200 dark:border-slate-700 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-slate-800" 
                   size="sm"
                   onClick={() => handleUpdateClick(resource)}
                 >
                   <RefreshCcw className="mr-2 h-3 w-3" /> Update Stock
                 </Button>
               </CardContent>
             </Card>
           );
        })}
      </div>

      {/* Inventory Update Modal */}
      <Dialog open={!!selectedResource} onOpenChange={(v) => !v && setSelectedResource(null)} title="Update Inventory">
         {!isAdmin ? (
           <div className="space-y-4 py-2">
             <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
               <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
               <p className="text-sm text-amber-800">Administrative access required for <strong>{selectedResource?.location}</strong>.</p>
             </div>
             <Input 
                type="password" 
                label="Admin Password"
                placeholder="Enter password (hint: admin)" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
             />
             <Button className="w-full" onClick={handleAdminAuth}>Verify Identity</Button>
           </div>
         ) : (
           <div className="space-y-6 py-2">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                   {selectedResource?.bloodType}
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-slate-100">{selectedResource?.hospital}</h4>
                   <p className="text-sm text-slate-500">Current Stock: {selectedResource?.units} Units</p>
                 </div>
              </div>
              <Input 
                 type="number" 
                 label="New Quantity (Units)" 
                 value={newUnits}
                 onChange={e => setNewUnits(e.target.value)}
                 className="text-lg font-medium"
              />
              <Button className="w-full" size="lg" onClick={handleSaveUpdate}>Save Changes</Button>
           </div>
         )}
      </Dialog>

      {/* Satellite Map View Modal */}
      <Dialog 
        open={!!viewLocationResource} 
        onOpenChange={(v) => !v && setViewLocationResource(null)} 
        title="Hospital Location"
        className="max-w-4xl w-full"
      >
        <div className="space-y-4">
           {viewLocationResource && (
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                   <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{viewLocationResource.hospital}</h3>
                      <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-700">
                         <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                         <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{viewLocationResource.rating}</span>
                      </div>
                   </div>
                   <div className="flex items-start gap-2 mt-1 text-slate-500 dark:text-slate-400 text-sm">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                      <span>{viewLocationResource.address}</span>
                   </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={handleGetDirections}>
                   Get Directions
                </Button>
             </div>
           )}

           <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 relative shadow-inner">
              {viewLocationResource && (
                <MapContainer 
                   key={viewLocationResource.id} 
                   center={[viewLocationResource.lat, viewLocationResource.lng]} 
                   zoom={18} 
                   style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                     attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                     url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                   />
                   <Marker position={[viewLocationResource.lat, viewLocationResource.lng]} icon={hospitalIcon}>
                      <Popup className="custom-popup">
                         <div className="font-bold text-sm">{viewLocationResource.hospital}</div>
                         <div className="text-xs text-slate-500">{viewLocationResource.location}</div>
                      </Popup>
                   </Marker>
                </MapContainer>
              )}
           </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Dashboard;
