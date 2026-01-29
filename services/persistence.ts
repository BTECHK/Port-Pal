import { PortAssignment, AppType } from '../types';
import { INITIAL_PORTS } from '../constants';

const STORAGE_KEY = 'port_authority_registry_v1';
const SYNC_CHANNEL = 'port_authority_sync_channel';

const channel = new BroadcastChannel(SYNC_CHANNEL);

/**
 * SECURITY PROTOCOL: Data Sanitization
 * Strips potential XSS vectors and enforces length limits.
 */
const sanitizeString = (str: unknown, maxLength: number): string => {
  if (typeof str !== 'string') return '';
  // Strip < and > to prevent HTML injection, though React escapes by default.
  // Defense in depth against any future dangerouslySetInnerHTML usage.
  const clean = str.replace(/[<>]/g, '');
  return clean.slice(0, maxLength);
};

const isValidAppType = (type: any): type is AppType => {
  return ['web', 'api', 'streamlit'].includes(type);
};

/**
 * SECURITY PROTOCOL: Data Validation
 * Ensures loaded data conforms to expected schema and safety rules.
 */
const validateAssignment = (data: any): PortAssignment | null => {
  if (!data || typeof data !== 'object') return null;
  
  // Sanitize Name
  const name = sanitizeString(data.name, 32);
  if (!name) return null;

  // Sanitize Path & Enforce Traversal Prevention
  const envPath = sanitizeString(data.envPath, 64);
  // Strictly enforce local path reference
  const safeEnvPath = envPath.startsWith('./') ? envPath : './.env';

  return {
    port: Number(data.port) || 0,
    name: name,
    type: isValidAppType(data.type) ? data.type : 'web',
    envPath: safeEnvPath,
    timestamp: Number(data.timestamp) || Date.now(),
    status: data.status === 'active' ? 'active' : 'error' // Default to error if unknown status
  };
};

export const persistence = {
  /**
   * Reads the current port registry from LocalStorage ("The Port File")
   * Performs sanitization on read to protect the UI from malformed storage.
   */
  read: (): PortAssignment[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_PORTS;
      
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return INITIAL_PORTS;

      // Map and Filter out invalid/malformed entries
      return parsed
        .map(validateAssignment)
        .filter((item): item is PortAssignment => item !== null);

    } catch (error) {
      console.error('SecurityAlert: Failed to read registry or validation failed:', error);
      return INITIAL_PORTS;
    }
  },

  /**
   * Writes to LocalStorage and notifies other agents (tabs)
   */
  write: (ports: PortAssignment[]) => {
    try {
      // We re-validate before write to ensure we never save garbage
      const safePorts = ports
        .map(validateAssignment)
        .filter((item): item is PortAssignment => item !== null);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(safePorts));
      // Notify other tabs that the registry has changed
      channel.postMessage({ type: 'REGISTRY_UPDATE', timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to write registry:', error);
    }
  },

  /**
   * Subscribes to updates from other agents
   */
  subscribe: (onUpdate: (ports: PortAssignment[]) => void) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'REGISTRY_UPDATE') {
        // Reload fresh data from storage (which triggers read() sanitization)
        onUpdate(persistence.read());
      }
    };

    channel.addEventListener('message', handleMessage);
    
    // Cleanup function
    return () => channel.removeEventListener('message', handleMessage);
  }
};
