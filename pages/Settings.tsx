import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui/UIComponents';
import { Bell, Shield } from 'lucide-react';

const Settings: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
        <p className="text-slate-500 text-lg">Manage application preferences and system configuration.</p>
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
    </div>
  );
};

export default Settings;