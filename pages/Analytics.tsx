
import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { INITIAL_RESOURCES, INITIAL_REQUESTS, BLOOD_TYPES } from '../constants';
import { Card, CardContent, CardHeader, CardTitle, Button, Select, Badge } from '../components/ui/UIComponents';
import { generateInventoryAnalysis, generateForecast, ForecastResult } from '../services/geminiService';
import { Sparkles, BarChart2, PieChart as PieIcon, TrendingUp, AlertTriangle, BrainCircuit, Calendar } from 'lucide-react';

const Analytics: React.FC = () => {
  // Analysis State
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Forecast State
  const [forecastBloodType, setForecastBloodType] = useState('A+');
  const [forecastTimeframe, setForecastTimeframe] = useState('1 Month');
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Process data for charts
  const bloodTypeData = INITIAL_RESOURCES.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.bloodType);
    if (existing) {
      existing.value += curr.units;
    } else {
      acc.push({ name: curr.bloodType, value: curr.units });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const statusData = [
    { name: 'Critical', value: INITIAL_RESOURCES.filter(r => r.units < 5).length },
    { name: 'Low', value: INITIAL_RESOURCES.filter(r => r.units >= 5 && r.units < 10).length },
    { name: 'Available', value: INITIAL_RESOURCES.filter(r => r.units >= 10).length },
  ];

  const handleAiAnalyze = async () => {
    setLoadingAi(true);
    const result = await generateInventoryAnalysis(INITIAL_RESOURCES, INITIAL_REQUESTS);
    setAnalysis(result);
    setLoadingAi(false);
  };

  const handleGenerateForecast = async () => {
    setLoadingForecast(true);
    // Calculate current units for the selected type
    const currentUnits = INITIAL_RESOURCES
      .filter(r => r.bloodType === forecastBloodType)
      .reduce((sum, r) => sum + r.units, 0);

    const result = await generateForecast(forecastBloodType, forecastTimeframe, currentUnits);
    setForecastResult(result);
    setLoadingForecast(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics & Intelligence</h2>
           <p className="text-slate-500 text-lg">Data-driven insights and AI predictions.</p>
        </div>
        <Button onClick={handleAiAnalyze} isLoading={loadingAi} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 dark:shadow-none rounded-full px-6">
          <Sparkles className="mr-2 h-4 w-4" /> Generate General Report
        </Button>
      </div>

      {/* General AI Analysis Result */}
      {analysis && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 border border-indigo-100 dark:from-indigo-950/40 dark:to-purple-950/40 dark:border-indigo-900/50 animate-in fade-in slide-in-from-top-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600 dark:bg-slate-900 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-900">
              <Sparkles className="h-5 w-5" /> 
            </div>
            <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-200">Gemini Strategic Insights</h3>
          </div>
          <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed">
            {analysis}
          </div>
        </div>
      )}

      {/* AI Supply Forecasting Section */}
      <Card className="border-t-4 border-t-violet-500 shadow-xl bg-white/60 dark:bg-slate-900/60">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <BrainCircuit className="h-6 w-6" />
             </div>
             <div>
                <CardTitle className="text-xl">AI Supply Forecasting</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Predictive modeling for specific blood type shortages.</p>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Controls */}
            <div className="space-y-6 lg:border-r border-slate-200 dark:border-slate-800 lg:pr-8">
               <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Blood Type</label>
                  <Select 
                    options={BLOOD_TYPES.map(t => ({ value: t, label: t }))}
                    value={forecastBloodType}
                    onChange={e => setForecastBloodType(e.target.value)}
                    className="h-12 text-lg font-bold"
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Forecast Timeframe</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1 Week', '1 Month', '1 Year'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setForecastTimeframe(tf)}
                        className={`py-2 px-3 text-sm rounded-lg font-medium transition-all border ${
                          forecastTimeframe === tf 
                            ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-violet-400'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
               </div>

               <Button 
                 onClick={handleGenerateForecast} 
                 isLoading={loadingForecast}
                 className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20"
               >
                 <TrendingUp className="mr-2 h-5 w-5" /> Run Prediction Model
               </Button>
            </div>

            {/* Result Display */}
            <div className="lg:col-span-2 min-h-[200px] flex flex-col justify-center">
               {!forecastResult && !loadingForecast && (
                 <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <BrainCircuit className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select parameters and run the model to see predictions.</p>
                 </div>
               )}

               {loadingForecast && (
                 <div className="flex flex-col items-center justify-center h-full text-violet-600 animate-pulse">
                    <BrainCircuit className="h-12 w-12 mb-4" />
                    <p className="font-medium">Crunching historical data & patterns...</p>
                 </div>
               )}

               {forecastResult && !loadingForecast && (
                 <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                       <div>
                          <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Estimated Risk Level</div>
                          <Badge 
                            className={`text-lg py-1 px-4 ${
                              forecastResult.riskLevel === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' :
                              forecastResult.riskLevel === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              forecastResult.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-green-100 text-green-700 border-green-200'
                            }`}
                          >
                            {forecastResult.riskLevel} Risk
                          </Badge>
                       </div>
                       <div className="text-right hidden sm:block">
                          <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Projection Period</div>
                          <div className="flex items-center justify-end gap-2 font-bold text-slate-700 dark:text-slate-200">
                             <Calendar className="h-4 w-4" /> {forecastTimeframe}
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border-l-4 border-violet-500 italic text-slate-600 dark:text-slate-300 text-lg">
                       "{forecastResult.reasoning}"
                    </div>
                 </div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standard Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200">Volume by Blood Type</CardTitle>
            <BarChart2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodTypeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: '#f1f5f9' }}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200">Stock Status Distribution</CardTitle>
            <PieIcon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={80}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.name === 'Critical' ? '#ef4444' : entry.name === 'Low' ? '#f59e0b' : '#22c55e'} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
