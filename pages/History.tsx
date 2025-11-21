
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Select, Badge, Button } from '../components/ui/UIComponents';
import { MOCK_HISTORY, INITIAL_REQUESTS } from '../constants';
import { Request } from '../types';
import { Search, Calendar, MapPin, CheckCircle2, XCircle, Clock, AlertCircle, FileText, Filter } from 'lucide-react';

const RequestHistory: React.FC = () => {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  useEffect(() => {
    // Load active requests from localStorage to get the most up-to-date "Live" data
    const storedActive = localStorage.getItem('bloodBridge_requests');
    const activeRequests = storedActive ? JSON.parse(storedActive) : INITIAL_REQUESTS;

    // Combine Active requests with Mock History (Fulfilled/Expired)
    const combined = [...activeRequests, ...MOCK_HISTORY];
    
    // Sort by date descending (newest first)
    combined.sort((a: Request, b: Request) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    
    setAllRequests(combined);
    setFilteredRequests(combined);
  }, []);

  // Handle Filtering
  useEffect(() => {
    let result = allRequests;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(r => 
        r.hospitalName.toLowerCase().includes(lowerSearch) || 
        r.location.toLowerCase().includes(lowerSearch) ||
        r.bloodType.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (urgencyFilter !== 'All') {
      result = result.filter(r => r.urgency === urgencyFilter);
    }

    setFilteredRequests(result);
  }, [search, statusFilter, urgencyFilter, allRequests]);

  // Helper for formatting date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Request Archives</h2>
           <p className="text-slate-500 text-lg">Comprehensive log of all broadcasted alerts and their outcomes.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{allRequests.filter(r => r.status === 'Fulfilled').length} Fulfilled</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{allRequests.filter(r => r.status === 'Active').length} Active</span>
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-md border-0 bg-white/50 dark:bg-slate-900/50">
         <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
               <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="Search by hospital, location or blood type..." 
                    className="pl-10 h-12 text-base"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
               </div>
               <div className="flex gap-4">
                  <div className="w-40">
                     <Select 
                       options={[
                         { value: 'All', label: 'All Status' },
                         { value: 'Active', label: 'Active' },
                         { value: 'Fulfilled', label: 'Fulfilled' },
                         { value: 'Expired', label: 'Expired' }
                       ]}
                       value={statusFilter}
                       onChange={e => setStatusFilter(e.target.value)}
                       className="h-12"
                     />
                  </div>
                  <div className="w-40">
                     <Select 
                       options={[
                         { value: 'All', label: 'All Urgency' },
                         { value: 'Critical', label: 'Critical' },
                         { value: 'High', label: 'High' },
                         { value: 'Moderate', label: 'Moderate' }
                       ]}
                       value={urgencyFilter}
                       onChange={e => setUrgencyFilter(e.target.value)}
                       className="h-12"
                     />
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>

      {/* Results Table/Grid */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No records found</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setSearch(''); setStatusFilter('All'); setUrgencyFilter('All'); }}
              >
                Clear Filters
              </Button>
           </div>
        ) : (
          <div className="grid gap-4">
             {filteredRequests.map(req => (
               <Card key={req.id} className="hover:border-primary-200 dark:hover:border-slate-700 transition-colors group">
                  <CardContent className="p-5">
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* Left: Main Info */}
                        <div className="flex items-start gap-4 flex-1">
                           <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
                              req.status === 'Active' ? 'bg-red-500 shadow-lg shadow-red-500/20' : 
                              req.status === 'Fulfilled' ? 'bg-green-500' : 'bg-slate-400'
                           }`}>
                              {req.bloodType}
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">{req.hospitalName}</h3>
                                 <Badge variant={
                                    req.urgency === 'Critical' ? 'destructive' : 
                                    req.urgency === 'High' ? 'warning' : 'outline'
                                 }>
                                    {req.urgency}
                                 </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                 <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" /> {req.location}
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> {formatDate(req.postedAt)}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Middle: Stats */}
                        <div className="flex items-center gap-8 lg:border-l lg:border-r border-slate-100 dark:border-slate-800 lg:px-8">
                           <div className="text-center">
                              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Quantity</div>
                              <div className="font-bold text-lg text-slate-800 dark:text-slate-200">{req.quantity} Units</div>
                           </div>
                           <div className="text-center">
                              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Radius</div>
                              <div className="font-bold text-lg text-slate-800 dark:text-slate-200">{req.radius}</div>
                           </div>
                        </div>

                        {/* Right: Status */}
                        <div className="w-full lg:w-48 flex flex-col items-end justify-center gap-2">
                           <div className={`flex items-center gap-2 font-bold ${
                              req.status === 'Active' ? 'text-red-600 animate-pulse' : 
                              req.status === 'Fulfilled' ? 'text-green-600' : 'text-slate-500'
                           }`}>
                              {req.status === 'Active' && <Clock className="h-4 w-4" />}
                              {req.status === 'Fulfilled' && <CheckCircle2 className="h-4 w-4" />}
                              {req.status === 'Expired' && <XCircle className="h-4 w-4" />}
                              {req.status}
                           </div>
                           
                           {req.fulfilledBy && (
                              <div className="text-xs text-slate-500 text-right">
                                 by <span className="font-semibold text-slate-700 dark:text-slate-300">{req.fulfilledBy}</span>
                              </div>
                           )}
                        </div>

                     </div>
                  </CardContent>
               </Card>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestHistory;
