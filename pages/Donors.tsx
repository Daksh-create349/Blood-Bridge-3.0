
import React, { useState } from 'react';
import { INITIAL_DONORS, BLOOD_TYPES } from '../constants';
import { Card, CardContent, Input, Select, Button, Badge } from '../components/ui/UIComponents';
import { Search, MapPin, Phone, Mail, Calendar, User, Filter } from 'lucide-react';

const Donors: React.FC = () => {
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');

  const filteredDonors = INITIAL_DONORS.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(search.toLowerCase()) || 
                          donor.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = bloodTypeFilter === 'All' || donor.bloodType === bloodTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Registered Donors</h2>
           <p className="text-slate-500 text-lg">Verified volunteers ready to save lives.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
           <User className="h-5 w-5 text-primary-500" />
           <span className="font-bold text-slate-900 dark:text-white">{INITIAL_DONORS.length}</span>
           <span className="text-sm font-medium text-slate-500">Total Donors</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search by name or location..." 
              className="pl-10 h-12"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>
         <div className="w-full md:w-48">
            <Select 
              options={[{ value: 'All', label: 'All Blood Types' }, ...BLOOD_TYPES.map(t => ({ value: t, label: t }))]}
              value={bloodTypeFilter}
              onChange={e => setBloodTypeFilter(e.target.value)}
              className="h-12"
            />
         </div>
      </div>

      {/* Donors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {filteredDonors.slice(0, 50).map(donor => ( // Limit display for performance if list is huge
           <Card key={donor.id} className="group hover:border-primary-300 dark:hover:border-primary-800 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600 font-bold text-lg text-slate-600 dark:text-slate-300">
                          {donor.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{donor.name}</h3>
                          <div className="flex items-center text-xs text-slate-500 mt-0.5">
                             <MapPin className="h-3 w-3 mr-1" /> {donor.location}
                          </div>
                       </div>
                    </div>
                    <Badge variant={
                        ['O-', 'AB-'].includes(donor.bloodType) ? 'warning' : 'outline'
                    } className="text-lg px-3 py-1 h-fit">
                       {donor.bloodType}
                    </Badge>
                 </div>
                 
                 <div className="space-y-3 text-sm border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                       <span className="text-slate-500">Last Donation</span>
                       <div className="flex items-center font-medium text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {donor.lastDonation}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                       <a href={`tel:${donor.phone}`} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors text-xs font-bold">
                          <Phone className="h-3.5 w-3.5" /> Call
                       </a>
                       <a href={`mailto:${donor.email}`} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors text-xs font-bold">
                          <Mail className="h-3.5 w-3.5" /> Email
                       </a>
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
      
      {filteredDonors.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
           <User className="h-16 w-16 mx-auto text-slate-300 mb-4" />
           <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No donors found</h3>
           <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Donors;
