import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon, Send, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  onCommand: (cmd: string) => void;
  isProcessing: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onCommand, isProcessing }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onCommand(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-300">
          <TerminalIcon size={16} />
          <span className="font-semibold">secure_shell — port_pal.py</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
      </div>

      {/* Logs Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 text-slate-300 bg-slate-950/50"
      >
        <div className="text-slate-500 italic mb-4">
          # Port Authority System v2.4.0 initialized<br/>
          # Waiting for command...
        </div>
        
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 break-all">
            <span className="text-slate-600 shrink-0">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]
            </span>
            <span className={
              log.level === 'error' ? 'text-red-400' :
              log.level === 'success' ? 'text-emerald-400' :
              log.level === 'warning' ? 'text-amber-400' :
              log.level === 'system' ? 'text-blue-400' :
              'text-slate-300'
            }>
              {log.level === 'error' && <ShieldAlert className="inline w-4 h-4 mr-1 -mt-1" />}
              {log.level === 'success' && <ShieldCheck className="inline w-4 h-4 mr-1 -mt-1" />}
              <span className="mr-2">
                {log.level === 'info' && '>'}
                {log.level === 'system' && '$'}
                {log.level === 'success' && '✓'}
                {log.level === 'error' && '✗'}
              </span>
              {log.message}
            </span>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-400">
             <Loader2 className="w-4 h-4 animate-spin" />
             <span>Processing request...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-slate-800 border-t border-slate-700">
        <span className="text-emerald-500 font-bold">➜</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command or natural language request (e.g., 'Assign api port for crypto-bot')"
          className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isProcessing}
          className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default Terminal;
