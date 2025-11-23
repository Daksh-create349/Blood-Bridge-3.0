
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui/UIComponents';
import { Heart, Bell, Shield, Crown, Sparkles, Code2, Rocket, Terminal, Volume2, Mic, StopCircle } from 'lucide-react';

const NARRATOR_SCRIPT = `
Welcome to Blood Bridge. 

This revolutionary platform was conceptualized and built with a singular mission: to save lives at the speed of data.

Let me guide you through the ecosystem.

First, the Dashboard. This is your command center. It provides a real-time view of blood inventory levels across the network. You can monitor critical shortages, update stock units instantly, and check medical compatibility matrices.

Next, the Operations Center. Hospitals can use the 'Send Request' feature to broadcast urgent SOS alerts. These alerts trigger push notifications to donors within a 5 or 10 kilometer radius. The 'Active Alerts' page allows donors to accept these requests and navigate to the hospital immediately.

For community engagement, we have the Donation Camps module. It allows users to locate nearby blood drives, register digitally using their ID proof, and even generate a digital participation pass.

We also feature Smart Logistics. A control tower view that tracks ambulances and delivery drones in real-time as they transport life-saving supplies between facilities.

Our Intelligence layer uses Google's Gemini AI to provide inventory analytics and predictive supply forecasting, helping us prevent shortages before they happen.

And finally, Safety. We ensure a verified trust protocol where every donor and hospital is authenticated.

Blood Bridge is not just an app. It is a lifeline. Thank you for being a part of this journey.
`;

const Settings: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  
  // Narrator State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleToggleNarrator = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(NARRATOR_SCRIPT);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      
      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
        <p className="text-slate-500 text-lg">Manage application preferences and system configuration.</p>
      </div>

      {/* Narrator Section */}
      <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-900 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-indigo-500/5 skew-x-12"></div>
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
           <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Mic className="h-4 w-4" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">App Tour Narrator</h3>
              </div>
              <p className="text-slate-500 max-w-lg">
                 Listen to an audio walkthrough of the Blood Bridge ecosystem, its features, and the vision of its creators.
              </p>
           </div>
           
           <Button 
             size="lg" 
             onClick={handleToggleNarrator}
             className={`h-16 px-8 rounded-full text-lg font-bold shadow-xl transition-all duration-500 ${
                isSpeaking 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'
             }`}
           >
             {isSpeaking ? (
                <>
                  <StopCircle className="mr-2 h-6 w-6" /> Stop Tour
                </>
             ) : (
                <>
                  <Volume2 className="mr-2 h-6 w-6" /> Start Narrator
                </>
             )}
           </Button>
        </CardContent>
        {/* Audio Visualizer Effect when speaking */}
        {isSpeaking && (
           <div className="absolute bottom-0 left-0 right-0 h-1 flex items-end justify-center gap-1 opacity-50">
              {[...Array(20)].map((_, i) => (
                 <div 
                   key={i} 
                   className="w-1 bg-indigo-500 animate-[pulse_0.5s_ease-in-out_infinite]"
                   style={{ 
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`
                   }}
                 ></div>
              ))}
           </div>
        )}
      </Card>

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

      {/* STYLISH BOLD CREDITS SECTION */}
      <div className="pt-10">
         <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl ring-1 ring-white/10">
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-40 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="relative z-10 p-8 md:p-12 text-center">
               
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/90">Visionaries & Architects</span>
               </div>

               <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm">
                  "CODE THAT BEATS<br/>WITH A PURPOSE."
               </h2>
               
               <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                  We didn't just build an app. We built a lifeline. Engineering the future of emergency healthcare response.
               </p>

               {/* Founder Cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  
                  {/* Daksh */}
                  <div className="group relative">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500 blur-md"></div>
                     <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5 hover:bg-slate-800/80 transition-all">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg shrink-0">
                           <Crown className="h-8 w-8 fill-current" />
                        </div>
                        <div className="text-left">
                           <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Owner & Creator</div>
                           <h3 className="text-2xl font-bold text-white group-hover:text-red-100 transition-colors">Daksh Ranjan<br/>Srivastava</h3>
                        </div>
                     </div>
                  </div>

                  {/* Nimish */}
                  <div className="group relative">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500 blur-md"></div>
                     <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5 hover:bg-slate-800/80 transition-all">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shrink-0">
                           <Rocket className="h-8 w-8 fill-current" />
                        </div>
                        <div className="text-left">
                           <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Owner & Creator</div>
                           <h3 className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">Nimish<br/>Bordiya</h3>
                        </div>
                     </div>
                  </div>

               </div>

               {/* Tech Badge */}
               <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-4 text-sm font-mono text-slate-500">
                  <span className="flex items-center gap-2"><Terminal className="h-4 w-4" /> v1.0.0 Release</span>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span className="flex items-center gap-2"><Code2 className="h-4 w-4" /> Powered by React & Gemini</span>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-red-500 fill-red-500" /> Made in India</span>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
