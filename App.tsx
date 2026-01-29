import React, { useState, useCallback, useEffect } from 'react';
import { Shield, ShieldAlert, Wifi, Lock, Users, Radio } from 'lucide-react';
import Terminal from './components/Terminal';
import { NetworkChart, ActiveAssignments } from './components/PortMap';
import { PortAssignment, LogEntry, AppType } from './types';
import { PORT_RANGES } from './constants';
import { parseCommandWithGemini } from './services/geminiService';
import { persistence } from './services/persistence';

export default function App() {
  // Initialize state from persistence layer (The "File")
  const [ports, setPorts] = useState<PortAssignment[]>(() => persistence.read());
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'init', timestamp: Date.now(), level: 'system', message: 'Port Pal System Online.' },
    { id: 'storage', timestamp: Date.now(), level: 'system', message: 'Connected to local registry (persistence enabled).' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    setLogs(prev => [...prev, { id: crypto.randomUUID(), timestamp: Date.now(), level, message }]);
  }, []);

  // Sync with other agents (tabs)
  useEffect(() => {
    const unsubscribe = persistence.subscribe((updatedPorts) => {
      setPorts(updatedPorts);
      addLog('system', 'Registry synced: Update received from remote agent.');
    });
    return unsubscribe;
  }, [addLog]);

  const findAvailablePort = (type: AppType): number => {
    const range = PORT_RANGES[type];
    const usedPorts = new Set(ports.map(p => p.port));
    
    // Simple strategy: find first gap or append
    for (let p = range.start; p <= range.end; p++) {
      if (!usedPorts.has(p)) return p;
    }
    throw new Error(`No available ports for type ${type}`);
  };

  const handleCommand = async (input: string) => {
    addLog('info', input);
    setIsProcessing(true);

    try {
      // 1. Parse with Gemini
      const parsed = await parseCommandWithGemini(input);
      
      if (!parsed) {
        throw new Error("Failed to parse command intent.");
      }

      if (parsed.is_help_request) {
        addLog('system', "Help: Usage example: 'Assign a web port for project dashboard'");
        setIsProcessing(false);
        return;
      }

      if (parsed.validation_error) {
         addLog('error', `SecurityError: ${parsed.validation_error}`);
         setIsProcessing(false);
         return;
      }

      if (!parsed.type || !parsed.name) {
        addLog('warning', "Incomplete request. Please specify project name and type (web/api/streamlit).");
        setIsProcessing(false);
        return;
      }

      const envPath = parsed.env || './.env';
      
      // 2. Validate Path (Simulated 'Secure' check)
      if (!envPath.startsWith('./')) {
        addLog('error', `SecurityError: Path '${envPath}' is unsafe. Must start with './'.`);
        setIsProcessing(false);
        return;
      }

      // 3. Simulate "port_pal.py" execution delay
      addLog('system', `Executing: python port_pal.py --type ${parsed.type} --name ${parsed.name} --env ${envPath}`);
      
      // Simulate LockError 20% of the time to demonstrate retry logic
      if (Math.random() < 0.2) {
        addLog('warning', 'LockError: Registry locked by another process. Retrying in 1s...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        addLog('system', 'Retry attempt 1/1...');
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));

      // 4. Assign Port
      const freshPorts = persistence.read();
      
      // Re-check availability against fresh data
      const usedPorts = new Set(freshPorts.map(p => p.port));
      const range = PORT_RANGES[parsed.type as AppType];
      let newPort = -1;
      
      for (let p = range.start; p <= range.end; p++) {
        if (!usedPorts.has(p)) {
           newPort = p;
           break;
        }
      }

      if (newPort === -1) throw new Error(`No available ports for type ${parsed.type}`);
      
      const newAssignment: PortAssignment = {
        port: newPort,
        name: parsed.name,
        type: parsed.type as AppType,
        envPath: envPath,
        timestamp: Date.now(),
        status: 'active'
      };

      const updatedPorts = [...freshPorts, newAssignment];
      setPorts(updatedPorts);
      persistence.write(updatedPorts); // Save and Sync
      
      addLog('success', `Assigned PORT ${newPort} to '${parsed.name}' (${parsed.type})`);

    } catch (error: any) {
      addLog('error', error.message || "Unknown system error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
             <Shield className="text-emerald-500" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              PORT PAL 
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SECURE</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest">LOCAL_NET_MGR // V2.4.1</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono tracking-tight">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
             <Users size={12} className="text-amber-400 animate-pulse" />
             <span className="text-slate-400">SYNC: <span className="text-amber-400">ACTIVE</span></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-slate-400">STATUS: <span className="text-emerald-400">ONLINE</span></span>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Grid */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Col 1: Charts (3/12 width) */}
          <div className="lg:col-span-3 min-h-[300px]">
            <NetworkChart ports={ports} />
          </div>

          {/* Col 2: Active List (5/12 width) */}
          <div className="lg:col-span-5 min-h-[400px]">
            <ActiveAssignments ports={ports} />
          </div>

          {/* Col 3: Terminal (4/12 width) */}
          <div className="lg:col-span-4 min-h-[400px]">
            <Terminal 
              logs={logs} 
              onCommand={handleCommand} 
              isProcessing={isProcessing}
            />
          </div>

        </div>
      </main>
    </div>
  );
}