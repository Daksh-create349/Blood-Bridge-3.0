

import React, { useState } from 'react';
import { INITIAL_DONORS, BLOOD_TYPES, LEADERBOARD_DATA } from '../constants';
import { Card, CardContent, Input, Select, Button, Badge } from '../components/ui/UIComponents';
import { Search, MapPin, Phone, Mail, Calendar, User, Filter, Trophy, Medal, Heart } from 'lucide-react';

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

      {/* --- LEADERBOARD SECTION --- */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {LEADERBOARD_DATA.map((hero) => (
           <div key={hero.rank} className="relative group">
              <div className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500 ${
                 hero.badge === 'Gold' ? 'bg-gradient-to-r from-yellow-300 to-amber-500' :
                 hero.badge === 'Silver' ? 'bg-gradient-to-r from-slate-300 to-slate-500' :
                 'bg-gradient-to-r from-orange-300 to-orange-600'
              }`}></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 h-full flex flex-col items-center text-center">
                 <div className={`absolute top-0 right-4 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                    hero.badge === 'Gold' ? 'bg-amber-500' :
                    hero.badge === 'Silver' ? 'bg-slate-400' :
                    'bg-orange-500'
                 }`}>
                    #{hero.rank} {hero.badge}
                 </div>
                 
                 <div className="mb-4 relative">
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg ${
                       hero.badge === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-amber-600' :
                       hero.badge === 'Silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                       'bg-gradient-to-br from-orange-400 to-orange-700'
                    }`}>
                       {hero.name.charAt(0)}
                    </div>
                    {hero.rank === 1 && <Trophy className="absolute -bottom-2 -right-2 h-8 w-8 text-yellow-500 fill-yellow-200 drop-shadow-sm" />}
                 </div>

                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{hero.name}</h3>
                 <Badge variant="outline" className="mb-4">{hero.bloodType}</Badge>

                 <div className="grid grid-cols-2 w-full gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                    <div>
                       <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{hero.donations}</div>
                       <div className="text-xs text-slate-400 uppercase font-semibold">Donations</div>
                    </div>
                    <div>
                       <div className="text-2xl font-black text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                          {hero.livesSaved} <Heart className="h-3 w-3 fill-current" />
                       </div>
                       <div className="text-xs text-slate-400 uppercase font-semibold">Lives Saved</div>
                    </div>
                 </div>
              </div>
           </div>
        ))}
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
