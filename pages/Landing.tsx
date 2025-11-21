import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/UIComponents';
import { HeartPulse, ChevronRight } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center selection:bg-red-500 selection:text-white">
      {/* Background Video - Sharp and Clear */}
      <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
         <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="h-full w-full object-cover opacity-100" 
         >
            <source src="https://cdn.pixabay.com/video/2019/09/12/26799-359604172_large.mp4" type="video/mp4" />
         </video>
         {/* Darker Overlay for Readability */}
         <div className="absolute inset-0 bg-slate-950/40" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/60" />
      </div>

      <div className="relative z-20 container mx-auto px-6 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        <div className="mx-auto bg-gradient-to-br from-red-600 to-red-800 p-5 rounded-2xl shadow-2xl shadow-red-900/50 flex items-center justify-center mb-2 border border-white/10 transform hover:scale-105 transition-transform duration-500">
           <HeartPulse className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1] drop-shadow-2xl">
          Blood <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Bridge</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-100 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md text-shadow">
          Bridging the critical gap between <span className="text-white font-semibold">urgent need</span> and <span className="text-white font-semibold">willing donor</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 w-full sm:w-auto">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-8 py-7 rounded-full shadow-red-600/40 shadow-xl hover:shadow-red-600/60 transition-all duration-300 hover:-translate-y-1 bg-red-600 hover:bg-red-700 border-none"
            onClick={() => navigate('/dashboard')}
          >
            Access Dashboard <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto text-lg px-8 py-7 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-sm transition-all duration-300 shadow-lg"
            onClick={() => navigate('/mission')}
          >
            Our Mission
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-8 mt-16 border-t border-white/10 pt-8 bg-slate-950/50 backdrop-blur-md rounded-2xl px-8 pb-4">
           <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">1.2k+</div>
              <div className="text-xs text-slate-300 uppercase tracking-wider mt-1 font-medium">Lives Saved</div>
           </div>
           <div className="text-center border-l border-white/10 pl-8">
              <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">50+</div>
              <div className="text-xs text-slate-300 uppercase tracking-wider mt-1 font-medium">Hospitals</div>
           </div>
           <div className="text-center border-l border-white/10 pl-8">
              <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">24/7</div>
              <div className="text-xs text-slate-300 uppercase tracking-wider mt-1 font-medium">Active Alerts</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;