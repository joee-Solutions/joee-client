import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface JoeeOfflineDB extends DBSchema {
  patients: {
    key: string;
    value: any;
    indexes: { 'by-tenant': string; 'by-updated': number };
  };
  employees: {
    key: string;
    value: any;
    indexes: { 'by-tenant': string; 'by-updated': number };
  };
  departments: {
    key: string;
    value: any;
    indexes: { 'by-tenant': string; 'by-updated': number };
  };
  appointments: {
    key: string;
    value: any;
    indexes: { 'by-tenant': string; 'by-date': string; 'by-updated': number };
  };
  organizations: {
    key: string;
    value: any;
    indexes: { 'by-tenant': string; 'by-updated': number };
  };
  schedules: {
    key: string;
    value: any;
    indexes: { 'by-tenant': string; 'by-date': string; 'by-updated': number };
  };
  queuedRequests: {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      headers: Record<string, string>;
      body?: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: { 'by-timestamp': number; 'by-retry-count': number };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      entity: string;
      data: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: { 'by-timestamp': number; 'by-entity': string };
  };
  /** Last session for offline restore (single record: id = "lastSession") */
  authSession: {
    key: string;
    value: {
      id: string;
      tenant?: string;
      auth_token: string;
      refresh_token?: string;
      user: any;
      savedAt: number;
    };
    indexes: { 'by-tenant': string };
  };
}

class OfflineDatabase {
  private db: IDBPDatabase<JoeeOfflineDB> | null = null;
  private readonly DB_NAME = 'joee-offline';
  private readonly DB_VERSION = 2;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<JoeeOfflineDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        // v1: original stores
        if (oldVersion < 1) {
          const patientsStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientsStore.createIndex('by-tenant', 'tenantId');
          patientsStore.createIndex('by-updated', 'updatedAt');

          const employeesStore = db.createObjectStore('employees', { keyPath: 'id' });
          employeesStore.createIndex('by-tenant', 'tenantId');
          employeesStore.createIndex('by-updated', 'updatedAt');

          const departmentsStore = db.createObjectStore('departments', { keyPath: 'id' });
          departmentsStore.createIndex('by-tenant', 'tenantId');
          departmentsStore.createIndex('by-updated', 'updatedAt');

          const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id' });
          appointmentsStore.createIndex('by-tenant', 'tenantId');
          appointmentsStore.createIndex('by-date', 'date');
          appointmentsStore.createIndex('by-updated', 'updatedAt');

          const organizationsStore = db.createObjectStore('organizations', { keyPath: 'id' });
          organizationsStore.createIndex('by-tenant', 'tenantId');
          organizationsStore.createIndex('by-updated', 'updatedAt');

          const schedulesStore = db.createObjectStore('schedules', { keyPath: 'id' });
          schedulesStore.createIndex('by-tenant', 'tenantId');
          schedulesStore.createIndex('by-date', 'date');
          schedulesStore.createIndex('by-updated', 'updatedAt');

          const queuedRequestsStore = db.createObjectStore('queuedRequests', { keyPath: 'id' });
          queuedRequestsStore.createIndex('by-timestamp', 'timestamp');
          queuedRequestsStore.createIndex('by-retry-count', 'retryCount');

          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncQueueStore.createIndex('by-timestamp', 'timestamp');
          syncQueueStore.createIndex('by-entity', 'entity');
        }

        // v2: auth session store for offline restore
        if (oldVersion < 2) {
          const authSessionStore = db.createObjectStore('authSession', { keyPath: 'id' });
          authSessionStore.createIndex('by-tenant', 'tenant');
        }
      },
    });
  }

  // Generic CRUD operations
  async get<T>(storeName: keyof JoeeOfflineDB, key: string): Promise<T | undefined> {
    await this.init();
    return this.db!.get(storeName as any, key);
  }

  async getAll<T>(storeName: keyof JoeeOfflineDB, indexName?: string, query?: any): Promise<T[]> {
    await this.init();
    if (indexName && query) {
      return (this.db!.getAllFromIndex as any)(storeName, indexName, query);
    }
    return this.db!.getAll(storeName as any);
  }

  async put<T>(storeName: keyof JoeeOfflineDB, value: T): Promise<string> {
    await this.init();
    return String(this.db!.put(storeName as any, value));
  }

  async delete(storeName: keyof JoeeOfflineDB, key: string): Promise<void> {
    await this.init();
    await this.db!.delete(storeName as any, key);
  }

  async clear(storeName: keyof JoeeOfflineDB): Promise<void> {
    await this.init();
    await this.db!.clear(storeName as any);
  }

  // Specific entity operations
  async getPatients(tenantId: string): Promise<any[]> {
    return this.getAll('patients', 'by-tenant', tenantId);
  }

  async getEmployees(tenantId: string): Promise<any[]> {
    return this.getAll('employees', 'by-tenant', tenantId);
  }

  async getDepartments(tenantId: string): Promise<any[]> {
    return this.getAll('departments', 'by-tenant', tenantId);
  }

  async getAppointments(tenantId: string, date?: string): Promise<any[]> {
    if (date) {
      return this.getAll('appointments', 'by-date', date);
    }
    return this.getAll('appointments', 'by-tenant', tenantId);
  }

  async getSchedules(tenantId: string, date?: string): Promise<any[]> {
    if (date) {
      return this.getAll('schedules', 'by-date', date);
    }
    return this.getAll('schedules', 'by-tenant', tenantId);
  }

  async getOrganizations(tenantId: string): Promise<any[]> {
    return this.getAll('organizations', 'by-tenant', tenantId);
  }

  // Auth session (offline restore)
  private readonly AUTH_SESSION_KEY = 'lastSession';

  async saveAuthSession(session: {
    tenant?: string;
    auth_token: string;
    refresh_token?: string;
    user: any;
  }): Promise<void> {
    await this.put('authSession', {
      id: this.AUTH_SESSION_KEY,
      tenant: session.tenant,
      auth_token: session.auth_token,
      refresh_token: session.refresh_token,
      user: session.user,
      savedAt: Date.now(),
    });
  }

  async getAuthSession(): Promise<{
    tenant?: string;
    auth_token: string;
    refresh_token?: string;
    user: any;
    savedAt: number;
  } | null> {
    await this.init();
    const row = await this.db!.get('authSession', this.AUTH_SESSION_KEY);
    return row ?? null;
  }

  async clearAuthSession(): Promise<void> {
    await this.delete('authSession', this.AUTH_SESSION_KEY);
  }

  // Queue operations
  async queueRequest(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }): Promise<void> {
    const queuedRequest = {
      id: `${Date.now()}-${Math.random()}`,
      ...request,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await this.put('queuedRequests', queuedRequest);
  }

  async getQueuedRequests(): Promise<any[]> {
    return this.getAll('queuedRequests');
  }

  async removeQueuedRequest(id: string): Promise<void> {
    await this.delete('queuedRequests', id);
  }

  async incrementRetryCount(id: string): Promise<void> {
    const request = await this.get<any>('queuedRequests', id);
    if (request) {
      request.retryCount = (request.retryCount || 0) + 1;
      await this.put('queuedRequests', request);
    }
  }

  // Sync queue operations
  async addToSyncQueue(action: 'create' | 'update' | 'delete', entity: string, data: any): Promise<void> {
    const syncItem = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await this.put('syncQueue', syncItem);
  }

  async getSyncQueue(): Promise<any[]> {
    return this.getAll('syncQueue');
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.delete('syncQueue', id);
  }

  // Cache management
  async cacheData(storeName: keyof JoeeOfflineDB, data: any[], tenantId: string): Promise<void> {
    for (const item of data) {
      const itemWithMetadata = {
        ...item,
        tenantId,
        updatedAt: Date.now(),
        cachedAt: Date.now(),
      };
      await this.put(storeName, itemWithMetadata);
    }
  }

  async getCachedData(storeName: keyof JoeeOfflineDB, tenantId: string): Promise<any[]> {
    return this.getAll(storeName, 'by-tenant', tenantId);
  }

  async isDataStale(storeName: keyof JoeeOfflineDB, tenantId: string, maxAge: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    const data = await this.getCachedData(storeName, tenantId);
    if (data.length === 0) return true;

    const oldestUpdate = Math.min(...data.map(item => item.updatedAt || 0));
    return Date.now() - oldestUpdate > maxAge;
  }

  // Database maintenance
  async clearOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const stores: (keyof JoeeOfflineDB)[] = ['patients', 'employees', 'departments', 'appointments', 'organizations', 'schedules'];
    
    for (const storeName of stores) {
      const data = await this.getAll(storeName);
      const cutoff = Date.now() - maxAge;
      
      for (const item of data) {
        const itemTyped = item as any;
        if (itemTyped.updatedAt && itemTyped.updatedAt < cutoff) {
          await this.delete(storeName, itemTyped.id);
        }
      }
    }
  }

  async getDatabaseSize(): Promise<number> {
    await this.init();
    const stores = this.db!.objectStoreNames;
    let totalSize = 0;

    for (const storeName of stores) {
      const count = await this.db!.count(storeName);
      totalSize += count;
    }

    return totalSize;
  }
}

// Export singleton instance
export const offlineDB = new OfflineDatabase();

// Export types for use in other files
export type { JoeeOfflineDB }; 