import { useState, useEffect, useCallback } from 'react';
import { offlineDB, type JoeeOfflineDB } from '@/lib/offline-db';
import { localStorageUtils } from '@/utils/localstorage';

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  lastOnline: Date | null;
  syncQueueSize: number;
  queuedRequestsSize: number;
}

export interface OfflineData<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  lastUpdated: Date | null;
}

export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    lastOnline: null,
    syncQueueSize: 0,
    queuedRequestsSize: 0,
  });

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    setStatus(prev => ({
      ...prev,
      isOnline,
      isOffline: !isOnline,
      lastOnline: isOnline ? new Date() : prev.lastOnline,
    }));
  }, []);

  // Update queue sizes
  const updateQueueSizes = useCallback(async () => {
    try {
      const syncQueue = await offlineDB.getSyncQueue();
      const queuedRequests = await offlineDB.getQueuedRequests();
      
      setStatus(prev => ({
        ...prev,
        syncQueueSize: syncQueue.length,
        queuedRequestsSize: queuedRequests.length,
      }));
    } catch (error) {
      console.error('Error updating queue sizes:', error);
    }
  }, []);

  // Initialize offline database
  const initOfflineDB = useCallback(async () => {
    try {
      await offlineDB.init();
      await updateQueueSizes();
    } catch (error) {
      console.error('Error initializing offline database:', error);
    }
  }, [updateQueueSizes]);

  // Sync data when back online
  const syncData = useCallback(async () => {
    if (!status.isOnline) return;

    try {
      // Sync queued requests
      const queuedRequests = await offlineDB.getQueuedRequests();
      for (const request of queuedRequests) {
        try {
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
          });

          if (response.ok) {
            await offlineDB.removeQueuedRequest(request.id);
          } else {
            await offlineDB.incrementRetryCount(request.id);
          }
        } catch (error) {
          console.error('Failed to sync request:', request, error);
          await offlineDB.incrementRetryCount(request.id);
        }
      }

      // Sync queue
      const syncQueue = await offlineDB.getSyncQueue();
      for (const item of syncQueue) {
        try {
          // Here you would implement the actual sync logic based on the entity and action
          // For now, we'll just remove successful items
          await offlineDB.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
        }
      }

      await updateQueueSizes();
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }, [status.isOnline, updateQueueSizes]);

  // Queue a request for later
  const queueRequest = useCallback(async (
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: any
  ) => {
    try {
      await offlineDB.queueRequest({ url, method, headers, body });
      await updateQueueSizes();
    } catch (error) {
      console.error('Error queuing request:', error);
    }
  }, [updateQueueSizes]);

  // Add item to sync queue
  const addToSyncQueue = useCallback(async (
    action: 'create' | 'update' | 'delete',
    entity: string,
    data: any
  ) => {
    try {
      await offlineDB.addToSyncQueue(action, entity, data);
      await updateQueueSizes();
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }, [updateQueueSizes]);

  // Get cached data with offline fallback
  const getCachedData = useCallback(async <T>(
    storeName: keyof JoeeOfflineDB,
    tenantId: string,
    fetchFromAPI?: () => Promise<T[]>
  ): Promise<OfflineData<T>> => {
    const result: OfflineData<T> = {
      data: [],
      isLoading: true,
      error: null,
      isOffline: !status.isOnline,
      lastUpdated: null,
    };

    try {
      // Try to get cached data first
      const cachedData = await offlineDB.getCachedData(storeName, tenantId);
      
      if (cachedData.length > 0) {
        result.data = cachedData;
        result.lastUpdated = new Date(Math.max(...cachedData.map(item => item.updatedAt || 0)));
      }

      // If online and we have a fetch function, try to get fresh data
      if (status.isOnline && fetchFromAPI) {
        try {
          const freshData = await fetchFromAPI();
          await offlineDB.cacheData(storeName, freshData, tenantId);
          result.data = freshData;
          result.lastUpdated = new Date();
          result.isOffline = false;
        } catch (error) {
          console.warn('Failed to fetch fresh data, using cached:', error);
          result.isOffline = true;
        }
      } else {
        result.isOffline = true;
      }

      result.isLoading = false;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.isLoading = false;
    }

    return result;
  }, [status.isOnline]);

  // Clear old data
  const clearOldData = useCallback(async (maxAge?: number) => {
    try {
      await offlineDB.clearOldData(maxAge);
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }, []);

  // Get database size
  const getDatabaseSize = useCallback(async () => {
    try {
      return await offlineDB.getDatabaseSize();
    } catch (error) {
      console.error('Error getting database size:', error);
      return 0;
    }
  }, []);

  // Effects
  useEffect(() => {
    initOfflineDB();
  }, [initOfflineDB]);

  useEffect(() => {
    updateConnectionStatus();
    
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, [updateConnectionStatus]);

  useEffect(() => {
    if (status.isOnline) {
      syncData();
    }
  }, [status.isOnline, syncData]);

  // Periodic queue size updates
  useEffect(() => {
    const interval = setInterval(updateQueueSizes, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [updateQueueSizes]);

  return {
    status,
    getCachedData,
    queueRequest,
    addToSyncQueue,
    clearOldData,
    getDatabaseSize,
    syncData,
    updateQueueSizes,
  };
}; 