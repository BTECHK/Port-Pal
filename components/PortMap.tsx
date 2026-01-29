import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PortAssignment, AppType } from '../types';
import { Server, Globe, Box, Activity, Cpu } from 'lucide-react';

const COLORS = {
  web: '#3b82f6',      // blue-500
  api: '#10b981',      // emerald-500
  streamlit: '#f59e0b' // amber-500
};

const getTypeIcon = (type: AppType) => {
  switch (type) {
    case 'web': return <Globe size={16} className="text-blue-400" />;
    case 'api': return <Server size={16} className="text-emerald-400" />;
    case 'streamlit': return <Activity size={16} className="text-amber-400" />;
    default: return <Box size={16} />;
  }
};

interface WidgetProps {
  ports: PortAssignment[];
}

export const NetworkChart: React.FC<WidgetProps> = ({ ports }) => {
  const stats = [
    { name: 'Web', value: ports.filter(p => p.type === 'web').length, color: COLORS.web },
    { name: 'API', value: ports.filter(p => p.type === 'api').length, color: COLORS.api },
    { name: 'Streamlit', value: ports.filter(p => p.type === 'streamlit').length, color: COLORS.streamlit },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-6 shadow-2xl flex flex-col h-full ring-1 ring-emerald-500/10">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <Activity size={16} className="text-emerald-500"/>
        Network Load
      </h3>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '4px' }}
              itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
         <div className="text-3xl font-mono font-bold text-white">{ports.length}</div>
         <div className="text-xs text-slate-500 uppercase tracking-widest">Active Nodes</div>
      </div>
    </div>
  );
};

export const ActiveAssignments: React.FC<WidgetProps> = ({ ports }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-6 shadow-2xl flex flex-col h-full overflow-hidden ring-1 ring-emerald-500/10">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <Cpu size={16} className="text-emerald-500"/>
        Assignments
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {ports.length === 0 ? (
          <div className="text-slate-600 text-center py-10 font-mono text-sm border border-dashed border-slate-800 rounded">
            System Standby...
          </div>
        ) : (
          ports.sort((a, b) => b.timestamp - a.timestamp).map((p) => (
            <div 
              key={p.port}
              className="group relative flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-slate-900 border border-slate-800 group-hover:border-${p.type === 'web' ? 'blue' : p.type === 'api' ? 'emerald' : 'amber'}-500/30 transition-colors`}>
                  {getTypeIcon(p.type)}
                </div>
                <div>
                  <div className="font-mono text-emerald-400 font-bold text-sm tracking-wide">:{p.port}</div>
                  {/* Visually Truncate Long Names to prevent layout breakages */}
                  <div className="text-slate-300 text-xs font-semibold truncate max-w-[150px]" title={p.name}>
                    {p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-600 font-mono truncate max-w-[100px]">{p.envPath}</div>
                <div className="text-[10px] text-slate-700 font-mono">
                  {new Date(p.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
