
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Send, 
  Bell, 
  History, 
  Tent, 
  BarChart3, 
  Users, 
  Settings, 
  Menu,
  ChevronLeft,
  HeartPulse,
  Sun,
  Moon
} from 'lucide-react';
import Chatbot from './Chatbot';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const NavItem = ({ to, icon, label, collapsed }: { to: string, icon: React.ReactNode, label: string, collapsed: boolean }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
      }`
    }
  >
    <span className={collapsed ? "mx-auto" : ""}>{icon}</span>
    {!collapsed && <span>{label}</span>}
    {!collapsed && (
      <div className="ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
        <ChevronLeft className="h-3 w-3 rotate-180" />
      </div>
    )}
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white/90 backdrop-blur-md transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950/90 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/dashboard" className={`flex items-center gap-2 font-bold text-xl text-primary-600 transition-opacity duration-200 ${collapsed ? 'justify-center w-full' : ''}`}>
          <HeartPulse className="h-7 w-7 drop-shadow-md" />
          {!collapsed && <span className="tracking-tight text-slate-900 dark:text-slate-50">Blood Bridge</span>}
        </NavLink>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <nav className="space-y-1">
          <div className={`mb-2 px-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 ${collapsed ? 'hidden' : 'block'}`}>Overview</div>
          <NavItem to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" collapsed={collapsed} />
          <NavItem to="/analytics" icon={<BarChart3 className="h-5 w-5" />} label="Analytics" collapsed={collapsed} />
          
          <div className={`mt-6 mb-2 px-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 ${collapsed ? 'hidden' : 'block'}`}>Operations</div>
          <NavItem to="/send-request" icon={<Send className="h-5 w-5" />} label="Send Request" collapsed={collapsed} />
          <NavItem to="/view-alerts" icon={<Bell className="h-5 w-5" />} label="Active Alerts" collapsed={collapsed} />
          <NavItem to="/request-history" icon={<History className="h-5 w-5" />} label="History" collapsed={collapsed} />
          
          <div className={`mt-6 mb-2 px-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 ${collapsed ? 'hidden' : 'block'}`}>Community</div>
          <NavItem to="/camps" icon={<Tent className="h-5 w-5" />} label="Donation Camps" collapsed={collapsed} />
          <NavItem to="/donors" icon={<Users className="h-5 w-5" />} label="Donors" collapsed={collapsed} />
          
          <div className={`mt-6 mb-2 px-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 ${collapsed ? 'hidden' : 'block'}`}>System</div>
          <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" collapsed={collapsed} />
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
         <button 
           onClick={() => setCollapsed(!collapsed)}
           className="flex w-full items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors"
         >
           {collapsed ? <Menu className="h-5 w-5" /> : <div className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> <span className="text-sm font-medium">Collapse Sidebar</span></div>}
         </button>
      </div>
    </aside>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  
  // Theme Toggle Logic
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Hide sidebar for Landing (/) and Mission (/mission) pages
  const isPublicPage = location.pathname === '/' || location.pathname === '/mission';

  // Inject Chatbot on all pages (can be conditional if desired, but useful everywhere)
  const showChatbot = true; 

  if (isPublicPage) return (
    <>
      {children}
      {showChatbot && <Chatbot />}
    </>
  );

  // Formatting the title
  const getTitle = (path: string) => {
    const clean = path.split('/')[1];
    if (!clean) return 'Dashboard';
    return clean.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-200 blur-[120px] dark:bg-red-900/30 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200 blur-[120px] dark:bg-blue-900/30 animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      </div>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`relative z-10 transition-all duration-300 ease-in-out ${collapsed ? 'pl-16' : 'pl-64'}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
           <div className="flex flex-col">
             <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {getTitle(location.pathname)}
             </h1>
             <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Welcome back, Admin</span>
           </div>
           <div className="ml-auto flex items-center gap-4">
              <button 
                onClick={() => setIsDark(!isDark)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-md ring-2 ring-white dark:ring-slate-800" />
           </div>
        </header>
        <main className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      {showChatbot && <Chatbot />}
    </div>
  );
};
