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
}

class OfflineDatabase {
  private db: IDBPDatabase<JoeeOfflineDB> | null = null;
  private readonly DB_NAME = 'joee-offline';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<JoeeOfflineDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Patients store
        const patientsStore = db.createObjectStore('patients', { keyPath: 'id' });
        patientsStore.createIndex('by-tenant', 'tenantId');
        patientsStore.createIndex('by-updated', 'updatedAt');

        // Employees store
        const employeesStore = db.createObjectStore('employees', { keyPath: 'id' });
        employeesStore.createIndex('by-tenant', 'tenantId');
        employeesStore.createIndex('by-updated', 'updatedAt');

        // Departments store
        const departmentsStore = db.createObjectStore('departments', { keyPath: 'id' });
        departmentsStore.createIndex('by-tenant', 'tenantId');
        departmentsStore.createIndex('by-updated', 'updatedAt');

        // Appointments store
        const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id' });
        appointmentsStore.createIndex('by-tenant', 'tenantId');
        appointmentsStore.createIndex('by-date', 'date');
        appointmentsStore.createIndex('by-updated', 'updatedAt');

        // Organizations store
        const organizationsStore = db.createObjectStore('organizations', { keyPath: 'id' });
        organizationsStore.createIndex('by-tenant', 'tenantId');
        organizationsStore.createIndex('by-updated', 'updatedAt');

        // Schedules store
        const schedulesStore = db.createObjectStore('schedules', { keyPath: 'id' });
        schedulesStore.createIndex('by-tenant', 'tenantId');
        schedulesStore.createIndex('by-date', 'date');
        schedulesStore.createIndex('by-updated', 'updatedAt');

        // Queued requests store
        const queuedRequestsStore = db.createObjectStore('queuedRequests', { keyPath: 'id' });
        queuedRequestsStore.createIndex('by-timestamp', 'timestamp');
        queuedRequestsStore.createIndex('by-retry-count', 'retryCount');

        // Sync queue store
        const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-timestamp', 'timestamp');
        syncQueueStore.createIndex('by-entity', 'entity');
      },
    });
  }

  // Generic CRUD operations
  async get<T>(storeName: keyof JoeeOfflineDB, key: string): Promise<T | undefined> {
    await this.init();
    return this.db!.get(storeName, key);
  }

  async getAll<T>(storeName: keyof JoeeOfflineDB, indexName?: string, query?: any): Promise<T[]> {
    await this.init();
    if (indexName && query) {
      return this.db!.getAllFromIndex(storeName, indexName, query);
    }
    return this.db!.getAll(storeName);
  }

  async put<T>(storeName: keyof JoeeOfflineDB, value: T): Promise<string> {
    await this.init();
    return this.db!.put(storeName, value);
  }

  async delete(storeName: keyof JoeeOfflineDB, key: string): Promise<void> {
    await this.init();
    await this.db!.delete(storeName, key);
  }

  async clear(storeName: keyof JoeeOfflineDB): Promise<void> {
    await this.init();
    await this.db!.clear(storeName);
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
    const request = await this.get('queuedRequests', id);
    if (request) {
      request.retryCount += 1;
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
        if (item.updatedAt && item.updatedAt < cutoff) {
          await this.delete(storeName, item.id);
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