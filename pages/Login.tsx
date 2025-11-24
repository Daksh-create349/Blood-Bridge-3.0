import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Select, Card, CardContent } from '../components/ui/UIComponents';
import { HeartPulse, ShieldCheck, User, Building2 } from 'lucide-react';
import { UserRole } from '../types';
import { HOSPITALS } from '../constants';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Hospital Name
  const [password, setPassword] = useState(''); 
  const [role, setRole] = useState<UserRole>('donor');
  const [isLoading, setIsLoading] = useState(false);

  // Reset identifier when role changes to prevent invalid state
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setIdentifier('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // For hospital role, identifier is the hospital name
      // For others, it's the email
      const finalIdentifier = role === 'hospital' ? identifier : identifier;
      
      // Use the entered name, or fallback for login if not entered (simulated)
      const finalName = name || (role === 'hospital' ? 'Hospital Admin' : identifier.split('@')[0]);

      login(finalName, finalIdentifier, role);
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/30 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse-slow"></div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 mb-4">
              <HeartPulse className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              {isLogin ? 'Welcome Back' : 'Join the Network'}
            </h1>
            <p className="text-slate-300 text-sm">
              {isLogin ? 'Sign in to access the life-saving grid.' : 'Create an account to start saving lives.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => handleRoleChange('donor')}
                  className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${role === 'donor' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-medium">Donor</span>
                </div>
                <div 
                  onClick={() => handleRoleChange('hospital')}
                  className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${role === 'hospital' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs font-medium">Hospital</span>
                </div>
                <div 
                  onClick={() => handleRoleChange('admin')}
                  className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${role === 'admin' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-medium">Admin</span>
                </div>
              </div>
            </div>

            {/* Name Field (Shown during signup or hospital login for admin name) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Your Name</label>
              <Input 
                type="text" 
                placeholder="John Doe" 
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Dynamic Identifier Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
                {role === 'hospital' ? 'Select Hospital' : 'Email Address'}
              </label>
              
              {role === 'hospital' ? (
                <Select
                  options={[
                    { value: '', label: 'Select your facility...' },
                    ...HOSPITALS.map(h => ({ value: h, label: h }))
                  ]}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white h-10"
                  required
                />
              ) : (
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-12 text-lg bg-white text-slate-900 hover:bg-slate-200 font-bold mt-6"
              isLoading={isLoading}
            >
              {isLogin ? 'Secure Login' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="underline font-semibold">{isLogin ? 'Sign Up' : 'Login'}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;