export type AppType = 'web' | 'api' | 'streamlit';

export interface PortAssignment {
  port: number;
  name: string;
  type: AppType;
  envPath: string;
  timestamp: number;
  status: 'active' | 'reserved' | 'error';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'success' | 'warning' | 'error' | 'system';
  message: string;
}

export interface CommandParsed {
  type?: AppType;
  name?: string;
  env?: string;
  error?: string;
  isHelp?: boolean;
}
