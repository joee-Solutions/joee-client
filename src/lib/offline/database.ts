import Dexie, { Table } from 'dexie';

// Define interfaces for offline data
export interface OfflineOrganization {
  id?: number;
  name: string;
  email: string;
  phone_number: string;
  status: string;
  // ... other organization fields
  _syncStatus?: 'synced' | 'pending' | 'conflict';
  _lastSynced?: Date;
  _localId?: string;
  _timestamp?: Date;
}

export interface OfflineEmployee {
  id?: number;
  tenantId: number;
  firstname: string;
  lastname: string;
  email: string;
  // ... other employee fields
  _syncStatus?: 'synced' | 'pending' | 'conflict';
  _lastSynced?: Date;
  _localId?: string;
  _timestamp?: Date;
}

export interface OfflinePatient {
  id?: number;
  tenantId: number;
  // ... patient fields
  _syncStatus?: 'synced' | 'pending' | 'conflict';
  _lastSynced?: Date;
  _localId?: string;
  _timestamp?: Date;
}

export interface OfflineAppointment {
  id?: number;
  tenantId: number;
  patientId: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  // ... other appointment fields
  _syncStatus?: 'synced' | 'pending' | 'conflict';
  _lastSynced?: Date;
  _localId?: string;
  _timestamp?: Date;
}

export interface OfflineSchedule {
  id?: number;
  tenantId: number;
  employeeId: number;
  availableDays: any[];
  _syncStatus?: 'synced' | 'pending' | 'conflict';
  _lastSynced?: Date;
  _localId?: string;
  _timestamp?: Date;
}

export interface OfflineDepartment {
  id?: number;
  tenantId: number;
  name: string;
  description: string;
  status: string;
  _syncStatus?: 'synced' | 'pending' | 'conflict';
  _lastSynced?: Date;
  _localId?: string;
  _timestamp?: Date;
}

export interface OfflineNotification {
  id?: number;
  title: string;
  message: string;
  sender?: string;
  read?: boolean;
  isRead?: boolean;
  readAt?: string | null;
  _syncStatus?: 'synced' | 'pending' | 'conflict';
  _lastSynced?: Date;
  _localId?: string;
  _timestamp?: Date;
}

export interface SyncQueueItem {
  id?: number;
  action: 'create' | 'update' | 'delete';
  entity: 'organization' | 'employee' | 'patient' | 'appointment' | 'schedule' | 'department' | 'notification' | 'medical_record';
  endpoint: string;
  data: any;
  timestamp: Date;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
  /** Original HTTP method (put vs patch) so sync uses correct verb */
  method?: 'post' | 'put' | 'patch' | 'delete';
  // Optional backoff control (not indexed)
  nextAttemptAt?: Date;
  lastAttemptAt?: Date;
}

export interface CachedApiResponse {
  id?: number;
  endpoint: string;
  data: any;
  timestamp: Date;
  expiresAt: Date;
}

export interface OfflineCredentials {
  id?: number;
  email: string;
  passwordHash: string; // Hashed password (not plain text)
  token?: string;
  userData?: any;
  lastLogin: Date;
  expiresAt: Date;
}

// Define the database
export class OfflineDatabase extends Dexie {
  organizations!: Table<OfflineOrganization, number>;
  employees!: Table<OfflineEmployee, number>;
  patients!: Table<OfflinePatient, number>;
  appointments!: Table<OfflineAppointment, number>;
  schedules!: Table<OfflineSchedule, number>;
  departments!: Table<OfflineDepartment, number>;
  notifications!: Table<OfflineNotification, number>;
  syncQueue!: Table<SyncQueueItem, number>;
  apiCache!: Table<CachedApiResponse, number>;
  offlineCredentials!: Table<OfflineCredentials, number>;

  constructor() {
    super('JoeeTenantDB');
    
    // Version 1 - Initial schema
    this.version(1).stores({
      organizations: '++id, name, email, status, _syncStatus, _timestamp',
      employees: '++id, tenantId, email, _syncStatus, _timestamp',
      patients: '++id, tenantId, _syncStatus, _timestamp',
      appointments: '++id, tenantId, patientId, doctorId, date, _syncStatus, _timestamp',
      schedules: '++id, tenantId, employeeId, _syncStatus, _timestamp',
      departments: '++id, tenantId, name, _syncStatus, _timestamp',
      notifications: '++id, read, isRead, _syncStatus, _timestamp',
      syncQueue: '++id, action, entity, status, timestamp',
      apiCache: '++id, endpoint, timestamp, expiresAt',
      offlineCredentials: '++id, email, expiresAt',
    });
  }

  private _openLock: Promise<void> = Promise.resolve();

  /**
   * Safely open the database, handling existing indexes.
   * Serialized so only one open/recreate runs at a time (avoids ConstraintError race).
   */
  async safeOpen(): Promise<void> {
    const run = () => this._safeOpenImpl();
    this._openLock = this._openLock.then(run, run);
    return this._openLock;
  }

  private async _safeOpenImpl(): Promise<void> {
    if (this.isOpen()) return;

    try {
      await this.open();
    } catch (error: any) {
      if (error?.name === 'ConstraintError' || error?.message?.includes('already exists')) {
        console.warn('⚠️ Database constraint error detected (index already exists). Deleting via native IndexedDB and recreating...');
        try {
          if (this.isOpen()) await this.close();
          await new Promise(resolve => setTimeout(resolve, 300));

          await new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(this.name);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
            req.onblocked = () => {
              console.warn('[OFFLINE DB] Delete blocked - close other tabs with this app, then retry.');
              setTimeout(() => reject(new Error('Database delete was blocked. Please close other tabs and try again.')), 5000);
            };
          });

          await new Promise(resolve => setTimeout(resolve, 1000));
          if (this.isOpen()) {
            await this.close();
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          await this.open();
          console.log('✅ Database recreated successfully. Offline features are now available.');
        } catch (recreateError: any) {
          console.error('❌ Failed to delete and recreate database:', recreateError);
          throw new Error(`Database could not be recreated: ${recreateError?.message || 'Unknown error'}`);
        }
      } else {
        console.warn('Database initialization error:', error?.message || 'Unknown error');
        throw error;
      }
    }

    if (!this.isOpen()) throw new Error('Database could not be opened');
  }
}

// Create and export a singleton instance
export const db = new OfflineDatabase();

// Track if database initialization is in progress to prevent multiple simultaneous opens
let initializing = false;
let initializationPromise: Promise<void> | null = null;

// Initialize database on module load (only in browser)
// This ensures the database is ready before any operations
if (typeof window !== 'undefined') {
  // Use safeOpen to handle any initialization errors
  // Only initialize once, even if called multiple times
  if (!initializationPromise) {
    initializing = true;
    initializationPromise = db.safeOpen()
      .then(() => {
        if (!db.isOpen()) {
          throw new Error('Database did not open');
        }
        console.log('[OFFLINE DB] ✅ Database initialized successfully');
      })
      .catch((error) => {
        console.error('[OFFLINE DB] ❌ Database initialization failed on module load:', error);
        console.error('[OFFLINE DB] Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
        });
        initializing = false;
        throw error; // Reject so callers (e.g. offlineAuth) can retry open
      })
      .finally(() => {
        initializing = false;
      });
    
    // Expose initialization promise for other modules to wait on
    (window as any).__offlineDbInitPromise = initializationPromise;
  }

  // Also ensure database is open when credentials are accessed
  const ensureDbOpen = async () => {
    if (!db.isOpen() && !initializing) {
      try {
        await db.safeOpen();
      } catch (error) {
        console.warn('[OFFLINE DB] Failed to ensure database is open:', error);
      }
    }
  };
  
  // Expose helper for manual database opening
  (window as any).ensureOfflineDbOpen = ensureDbOpen;
}

/**
 * Call this early (e.g. on login page mount) so the DB is open before the user submits.
 * Safe to call multiple times; returns the same promise once init has started.
 */
export function ensureOfflineDbReady(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  let p = (window as any).__offlineDbInitPromise as Promise<void> | undefined;
  if (!p) {
    p = db.safeOpen().then(() => {
      if (!db.isOpen()) throw new Error('Database did not open');
    });
    (window as any).__offlineDbInitPromise = p;
  }
  return p.catch(() => {
    (window as any).__offlineDbInitPromise = undefined;
    return db.safeOpen().then(() => {
      if (!db.isOpen()) throw new Error('Database did not open');
    });
  });
}

