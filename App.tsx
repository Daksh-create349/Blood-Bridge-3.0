import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Mission from './pages/Mission';
import Dashboard from './pages/Dashboard';
import { SendRequest, ActiveRequests } from './pages/Requests';
import RequestHistory from './pages/History';
import Camps from './pages/Camps';
import Analytics from './pages/Analytics';
import Donors from './pages/Donors';
import Logistics from './pages/Logistics';
import Settings from './pages/Settings';
import Contact from './pages/Contact';

// --- Splash Screen ---
const Splash = ({ onComplete }: { onComplete: () => void }) => {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 2500);
    const complete = setTimeout(onComplete, 3000);
    return () => { clearTimeout(timer); clearTimeout(complete); };
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
    </div>
  );
};

// --- Protected Route Component ---
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/mission" element={<Mission />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/send-request" element={<RequireAuth><SendRequest /></RequireAuth>} />
      <Route path="/view-alerts" element={<RequireAuth><ActiveRequests /></RequireAuth>} />
      <Route path="/request-history" element={<RequireAuth><RequestHistory /></RequireAuth>} />
      <Route path="/camps" element={<RequireAuth><Camps /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
      <Route path="/donors" element={<RequireAuth><Donors /></RequireAuth>} />
      <Route path="/logistics" element={<RequireAuth><Logistics /></RequireAuth>} />
      <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onComplete={() => setLoading(false)} />;
  }

  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;