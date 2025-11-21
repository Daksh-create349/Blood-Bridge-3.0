

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeartPulse, Droplet } from 'lucide-react';

import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import Mission from './pages/Mission';
import Dashboard from './pages/Dashboard';
import { SendRequest, ActiveRequests } from './pages/Requests';
import RequestHistory from './pages/History';
import Camps from './pages/Camps';
import Analytics from './pages/Analytics';
import Donors from './pages/Donors';

// --- Splash Screen Component ---
const Splash = ({ onComplete }: { onComplete: () => void }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade out slightly before unmounting
    const timer = setTimeout(() => setFade(true), 2500);
    const complete = setTimeout(onComplete, 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(complete);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative mb-8">
        <div className="h-24 w-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse-slow shadow-[0_0_40px_rgba(220,38,38,0.6)]">
          <HeartPulse className="h-12 w-12 text-white" />
        </div>
        <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" style={{ animationDuration: '2s' }}></div>
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3 tracking-tighter">
        Blood <span className="text-red-500">Bridge</span>
      </h1>
      <p className="text-slate-400 tracking-widest uppercase text-xs font-semibold">Bridging the gap between need & donor</p>
      
      <div className="absolute bottom-12 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 animate-[width_2.5s_ease-out_forwards] w-0"></div>
      </div>
    </div>
  );
};

// --- Mock Components for missing pages ---
const MockPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center dark:bg-slate-800">
       <Droplet className="h-10 w-10 text-slate-300" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
    <p className="text-slate-500 max-w-md">This module is currently under development by the engineering team.</p>
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onComplete={() => setLoading(false)} />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send-request" element={<SendRequest />} />
          <Route path="/view-alerts" element={<ActiveRequests />} />
          <Route path="/request-history" element={<RequestHistory />} />
          <Route path="/camps" element={<Camps />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/donors" element={<Donors />} />
          <Route path="/settings" element={<MockPage title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;