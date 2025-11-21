
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui/UIComponents';
import { Heart, Bell, Smartphone, Shield, Moon, Sun, Monitor, Github, Code2 } from 'lucide-react';

const Settings: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
        <p className="text-slate-500 text-lg">Manage application preferences and view credits.</p>
      </div>

      {/* Preferences Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-500" /> Notifications
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-medium">Email Alerts</div>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${emailNotifs ? 'bg-green-500' : 'bg-slate-300'}`}
                  onClick={() => setEmailNotifs(!emailNotifs)}
                >
                   <div className={`bg-white h-4 w-4 rounded-full shadow-sm transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-medium">Push Notifications</div>
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${pushNotifs ? 'bg-green-500' : 'bg-slate-300'}`}
                  onClick={() => setPushNotifs(!pushNotifs)}
                >
                   <div className={`bg-white h-4 w-4 rounded-full shadow-sm transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" /> Privacy & Data
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" className="w-full justify-between">
                <span>Data Visibility</span>
                <Badge variant="success">Public</Badge>
             </Button>
             <Button variant="outline" className="w-full justify-between">
                <span>Location Access</span>
                <Badge variant="success">Granted</Badge>
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* CREDITS SECTION */}
      <div className="pt-8">
         <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 transform skew-y-1 rounded-3xl opacity-10"></div>
            <Card className="relative border-0 shadow-xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
               <CardContent className="p-10 text-center">
                  
                  <div className="mb-6 inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 animate-pulse-slow shadow-lg shadow-red-500/20">
                     <Heart className="h-10 w-10 fill-current" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Blood Bridge</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto text-lg">
                    "Bridging the gap between urgent need and willing donor through the power of technology."
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-lg text-slate-600 dark:text-slate-300 mb-8">
                     <span className="font-medium opacity-70">Made with Love by</span>
                     <div className="flex flex-wrap justify-center gap-4">
                        <div className="group relative">
                           <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
                           <div className="relative px-6 py-2 bg-white dark:bg-slate-900 rounded-full leading-none flex items-center">
                              <span className="font-bold text-slate-800 dark:text-slate-100">Daksh Ranjan Srivastava</span>
                           </div>
                        </div>
                        <span className="hidden md:inline opacity-50">&</span>
                        <div className="group relative">
                           <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
                           <div className="relative px-6 py-2 bg-white dark:bg-slate-900 rounded-full leading-none flex items-center">
                              <span className="font-bold text-slate-800 dark:text-slate-100">Nimish Bordiya</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-800">
                     <div className="text-center">
                        <Code2 className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">Stack</div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">React + Vite</div>
                     </div>
                     <div className="text-center">
                        <Monitor className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">UI</div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">Tailwind CSS</div>
                     </div>
                     <div className="text-center">
                        <Smartphone className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">AI</div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">Google Gemini</div>
                     </div>
                     <div className="text-center">
                        <Github className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">Ver</div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">1.0.0</div>
                     </div>
                  </div>

               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default Settings;
