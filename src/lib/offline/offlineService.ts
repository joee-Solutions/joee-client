import { db, SyncQueueItem } from './database';
import { offlineLogger } from './offlineLogger';
import { swrMutateForOffline } from './swrMutateBridge';

export class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncInProgress: boolean = false;

  private constructor() {
    // Initialize online status
    this.isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
    
    offlineLogger.info('OfflineService initialized', { isOnline: this.isOnline });
    
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        offlineLogger.info('Device came ONLINE - starting sync');
        this.syncPendingActions();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        offlineLogger.warn('Device went OFFLINE - requests will use cache or be queued');
      });

      // Cleanup expired cache entries on initialization
      this.cleanupExpiredCache();

      // Set up periodic cleanup (every hour)
      setInterval(() => {
        this.cleanupExpiredCache();
      }, 60 * 60 * 1000); // 1 hour
    }
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Intercept API calls and handle offline/online scenarios
  async makeRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: any
  ): Promise<any> {
    // Update online status before checking (only in browser)
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
    }
    
    offlineLogger.debug(`API Request: ${method.toUpperCase()} ${endpoint}`, {
      isOnline: this.isOnline,
      hasData: !!data,
    });
    
    if (!this.isOnline) {
      offlineLogger.info(`Device is OFFLINE - handling ${method.toUpperCase()} request for ${endpoint}`);
      
      // We're offline
      if (method === 'get') {
        // Try to get from cache
        const cached = await this.getCachedResponse(endpoint);
        if (cached) {
          // Cache hit is already logged in getCachedResponse
          return cached;
        }
        offlineLogger.warn(`Cache MISS for ${endpoint} - no cached data available`);
        throw new Error('No cached data available and device is offline');
      } else {
        // Queue write operations (POST, PUT, PATCH, DELETE)
        offlineLogger.info(`Queuing ${method.toUpperCase()} action for sync when online`, { endpoint });
        const queueId = await this.queueAction(method, endpoint, data);
        
        // Merge IndexedDB + in-memory SWR data, update both so tables refresh without reload
        const optimisticResponse = await this.applyOfflineOptimisticUI(method, endpoint, data, queueId);
        
        offlineLogger.info(`Optimistic update applied for ${method.toUpperCase()} ${endpoint}`);
        
        // Return optimistic response that matches expected format
        // Components expect: { status: true, success: true, message: string, data?: any }
        if (optimisticResponse) {
          return {
            ...optimisticResponse,
            status: true,
            success: true,
            _offline: true,
            _queueId: queueId
          };
        }
        
        // Fallback response format
        return { 
          status: true,
          success: true, 
          message: 'Action queued for sync when online',
          data: data,
          _offline: true,
          _queueId: queueId
        };
      }
    }
    
    offlineLogger.debug(`Device is ONLINE - making ${method.toUpperCase()} request for ${endpoint}`);
    
    // If we reach here, we're online - make the actual HTTP request
    // Import axios and site config to create request directly to avoid circular dependency
    const axios = (await import('axios')).default;
    const { getToken, getRefreshToken } = await import('@/framework/get-token');
    const { siteConfig } = await import('@/framework/site-config');
    const token = getToken();
    
    const httpClient = axios.create({
      baseURL: siteConfig.siteUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    // Add request interceptor for token refresh
    httpClient.interceptors.request.use(
      (config) => {
        const currentToken = getToken();
        if (currentToken && typeof currentToken === 'string' && currentToken.trim().length > 10) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        } else {
          const refreshed = getRefreshToken();
          if (refreshed) {
            const newToken = getToken();
            if (newToken && typeof newToken === 'string' && newToken.trim().length > 10) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    try {
      let response;
      if (method === "post") {
        response = await httpClient.post(`/api${endpoint}`, data);
      } else if (method === "get") {
        response = await httpClient.get(`/api${endpoint}`);
      } else if (method === "put") {
        response = await httpClient.put(`/api${endpoint}`, data);
      } else if (method === "patch") {
        response = await httpClient.patch(`/api${endpoint}`, data);
      } else if (method === "delete") {
        response = await httpClient.delete(`/api${endpoint}`);
      } else {
        throw new Error(`Invalid method: ${method}`);
      }
      
      const responseData = response.data;
      
      // Cache GET requests for offline use
      if (method === 'get') {
        await this.cacheResponse(endpoint, responseData);
        offlineLogger.debug(`Cached GET response for ${endpoint}`);
      }
      
      offlineLogger.info(`API Request SUCCESS: ${method.toUpperCase()} ${endpoint}`);
      return responseData;
    } catch (error: any) {
      const status = error?.response?.status;
      const body = error?.response?.data;
      const fromBody =
        body &&
        typeof body === "object" &&
        (typeof (body as { message?: unknown }).message === "string"
          ? (body as { message: string }).message
          : typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : null);
      const detail = String(
        fromBody ||
          (typeof body === "string" ? body : "") ||
          error?.message ||
          (typeof error?.toString === "function" ? error.toString() : "") ||
          "Request failed"
      );
      const logPayload: Record<string, unknown> = { detail };
      if (typeof status === "number") logPayload.status = status;
      if (error?.response?.statusText) logPayload.statusText = error.response.statusText;

      // DELETE + 404/410: resource already gone (common after offline queue replay). Not a failure.
      const deleteAlreadyGone =
        method === "delete" && (status === 404 || status === 410);
      if (deleteAlreadyGone) {
        offlineLogger.info(
          `API DELETE skipped (already removed): ${method.toUpperCase()} ${endpoint}`,
          logPayload
        );
      } else {
        offlineLogger.error(
          `API Request FAILED: ${method.toUpperCase()} ${endpoint}`,
          logPayload
        );
      }
      
      // If request fails and we're online, check if we went offline during the request
      if (typeof window !== 'undefined') {
        this.isOnline = navigator.onLine;
      }
      if (!this.isOnline && method === 'get') {
        offlineLogger.info(`Went offline during request - trying cache for ${endpoint}`);
        // Try cache as fallback
        const cached = await this.getCachedResponse(endpoint);
        if (cached) {
          offlineLogger.info(`Cache fallback SUCCESS for ${endpoint}`);
          return cached;
        }
        offlineLogger.warn(`Cache fallback FAILED for ${endpoint}`);
      }
      throw error;
    }
  }

  // Cache API responses (public method so it can be called from https.ts)
  async cacheResponse(endpoint: string, data: any): Promise<void> {
    try {
      // Ensure database is open before attempting to cache
      if (!db.isOpen()) {
        try {
          await db.safeOpen();
        } catch (openError: any) {
          // If database can't be opened, skip caching silently
          offlineLogger.debug('Database not available for caching', { 
            endpoint,
            error: openError?.message || 'Unknown error' 
          });
          return;
        }
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // Cache for 1 month (30 days)

      // Try to serialize data to check if it's too large
      let dataSize: number;
      try {
        const serialized = JSON.stringify(data);
        dataSize = serialized.length;
        
        // Check if data is too large (IndexedDB has limits, typically 50MB per origin)
        if (dataSize > 10 * 1024 * 1024) { // 10MB threshold
          offlineLogger.warn(`Response data too large to cache (${(dataSize / 1024 / 1024).toFixed(2)}MB)`, {
            endpoint,
            dataSize,
          });
          return; // Skip caching very large responses
        }
      } catch (serializeError: any) {
        offlineLogger.warn('Failed to serialize data for caching', {
          endpoint,
          error: serializeError?.message || 'Unknown error',
        });
        return; // Skip caching if data can't be serialized
      }

      try {
        await db.apiCache.put({
          endpoint,
          data,
          timestamp: new Date(),
          expiresAt,
        });
        
        offlineLogger.debug(`Cached response for ${endpoint}`, {
          expiresAt: expiresAt.toISOString(),
          dataSize,
        });
      } catch (putError: any) {
        // If we get a ConstraintError, the database schema might be corrupted
        // Try to recover by deleting and recreating the database
        if (putError?.name === 'ConstraintError' || putError?.message?.includes('already exists')) {
          console.warn('ConstraintError during cache storage, attempting database recovery...');
          try {
            // Close database
            if (db.isOpen()) {
              await db.close();
            }
            // Delete and recreate
            await db.delete();
            await db.safeOpen();
            // Retry the operation
            await db.apiCache.put({
              endpoint,
              data,
              timestamp: new Date(),
              expiresAt,
            });
            console.log('✅ Response cached after database recovery');
          } catch (recoveryError: any) {
            // If recovery fails, just skip caching - don't break the app
            console.warn('Failed to cache response after database recovery, skipping cache:', recoveryError?.message);
            return; // Exit gracefully
          }
        } else {
          // Re-throw other errors
          throw putError;
        }
      }
    } catch (error: any) {
      // Extract comprehensive error information
      let errorMessage = 'Unknown error';
      let errorDetails: any = {};

      if (error instanceof Error) {
        errorMessage = error.message || 'Unknown error';
        errorDetails.name = error.name;
        errorDetails.stack = error.stack?.split('\n').slice(0, 3).join('\n'); // First 3 lines
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }

      errorDetails.message = errorMessage;
      errorDetails.errorType = error?.constructor?.name || typeof error;
      errorDetails.endpoint = endpoint;
      errorDetails.dbOpen = db.isOpen();
      
      // Try to get data size for context
      try {
        errorDetails.dataSize = JSON.stringify(data).length;
      } catch {
        errorDetails.dataSize = 'Unable to calculate';
      }

      offlineLogger.error(`Error caching response for ${endpoint}: ${errorMessage}`, errorDetails);
      
      // Also log directly to console for visibility
      console.error('[OFFLINE CACHE] Failed to cache response:', {
        endpoint,
        message: errorMessage,
        errorType: error?.constructor?.name || typeof error,
        dbOpen: db.isOpen(),
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
        } : String(error),
      });
    }
  }

  // Get cached API response (public method for use in fetchers)
  async getCachedResponse(endpoint: string): Promise<any | null> {
    try {
      // Ensure database is open before attempting to get cache
      if (!db.isOpen()) {
        try {
          await db.safeOpen();
        } catch (openError: any) {
          // If database can't be opened, return null silently
          offlineLogger.debug('Database not available for cache retrieval', { 
            endpoint,
            error: openError?.message || 'Unknown error' 
          });
          return null;
        }
      }

      // Try exact match first
      let cached = await db.apiCache
        .where('endpoint')
        .equals(endpoint)
        .and((item) => item.expiresAt > new Date())
        .first();
      
      // If no exact match and endpoint has query params, try to find base endpoint match
      if (!cached && endpoint.includes('?')) {
        const baseEndpoint = endpoint.split('?')[0];
        // Get all cached entries for this base endpoint and find the most recent valid one
        const allCached = await db.apiCache
          .where('endpoint')
          .startsWith(baseEndpoint)
          .and((item) => item.expiresAt > new Date())
          .sortBy('timestamp');
        
        if (allCached && allCached.length > 0) {
          // Use the most recent cache entry
          cached = allCached[allCached.length - 1];
          offlineLogger.debug(`Using base endpoint cache for ${endpoint}`, {
            matchedEndpoint: cached.endpoint,
            baseEndpoint,
          });
        }
      }
      
      if (cached) {
        const ageSeconds = Math.round((new Date().getTime() - new Date(cached.timestamp).getTime()) / 1000);
        offlineLogger.info(`✅ Cache HIT for ${endpoint}`, {
          cachedAt: cached.timestamp,
          expiresAt: cached.expiresAt,
          matchedEndpoint: cached.endpoint,
          age: `${ageSeconds}s ago`,
        });
        return cached.data;
      } else {
        offlineLogger.debug(`❌ No valid cache found for ${endpoint}`);
        return null;
      }
    } catch (error: any) {
      // Extract comprehensive error information
      let errorMessage = 'Unknown error';
      let errorDetails: any = {};

      if (error instanceof Error) {
        errorMessage = error.message || 'Unknown error';
        errorDetails.name = error.name;
        errorDetails.stack = error.stack?.split('\n').slice(0, 3).join('\n'); // First 3 lines
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }

      errorDetails.message = errorMessage;
      errorDetails.errorType = error?.constructor?.name || typeof error;
      errorDetails.endpoint = endpoint;
      errorDetails.dbOpen = db.isOpen();

      offlineLogger.error(`Error getting cached response for ${endpoint}: ${errorMessage}`, errorDetails);
      
      // Return null on error (don't break the app)
      return null;
    }
  }

  // Queue action for sync when online
  private async queueAction(
    method: 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: any
  ): Promise<number> {
    const action: SyncQueueItem['action'] = 
      method === 'post' ? 'create' :
      method === 'put' || method === 'patch' ? 'update' :
      'delete';

    const entity = this.extractEntityFromEndpoint(endpoint);

    const queueItem = {
      action,
      entity,
      endpoint,
      data,
      timestamp: new Date(),
      retries: 0,
      status: 'pending' as const,
      method,
    };

    const id = await db.syncQueue.add(queueItem);
    
    offlineLogger.info(`Queued ${action} action for ${entity}`, {
      endpoint,
      queueItemId: id,
      timestamp: queueItem.timestamp,
    });
    
    return id;
  }

  // Extract entity type from endpoint (check specific resources first; /tenants/85/patients matches /tenants)
  private extractEntityFromEndpoint(endpoint: string): SyncQueueItem['entity'] {
    if (endpoint.includes('/patients')) return 'patient';
    if (endpoint.includes('/employees')) return 'employee';
    if (endpoint.includes('/appointments')) return 'appointment';
    if (endpoint.includes('/schedules')) return 'schedule';
    if (endpoint.includes('/departments')) return 'department';
    if (endpoint.includes('/notification')) return 'notification';
    if (endpoint.includes('/medical') || endpoint.includes('/visit') || endpoint.includes('/prescription')) return 'medical_record';
    if (endpoint.includes('/tenants') || endpoint.includes('/organizations')) return 'organization';
    return 'organization';
  }

  // Sync pending actions when coming back online.
  // When user clicks "Sync", also retries failed items (resets them to pending with fresh retries).
  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      offlineLogger.debug('Sync skipped', { syncInProgress: this.syncInProgress, isOnline: this.isOnline });
      return;
    }

    this.syncInProgress = true;
    offlineLogger.info('Starting sync of pending actions');

    try {
      // Always retry any previously-failed items automatically (no manual "Sync" required)
      const failedItems = await db.syncQueue.where('status').equals('failed').toArray();
      for (const item of failedItems) {
        await db.syncQueue.update(item.id!, {
          status: 'pending',
          // keep retries but clear hard-failed state; we'll apply backoff instead
          error: item.error,
        });
      }

      // Only sync items that are due (respect nextAttemptAt backoff)
      const now = new Date();
      const itemsToSync = (await db.syncQueue.where('status').equals('pending').toArray()).filter((it) => {
        const next = (it as any).nextAttemptAt as Date | undefined;
        return !next || next <= now;
      });

      offlineLogger.info(`Found ${itemsToSync.length} actions to sync`);

      for (const item of itemsToSync) {
        try {
          offlineLogger.debug(`Syncing action: ${item.action} ${item.entity}`, { itemId: item.id });
          
          // Update status to syncing
          await db.syncQueue.update(item.id!, { status: 'syncing', lastAttemptAt: new Date() });

          // Use stored method (preserves PUT vs PATCH) or fall back to action mapping
          // Patients and appointments use PATCH for update; default update to PUT
          let method: 'post' | 'put' | 'patch' | 'delete' =
            item.action === 'create' ? 'post' :
            item.action === 'update' ? 'put' :
            'delete';
          if (item.method) method = item.method;
          else if (item.action === 'update' && (item.endpoint.includes('/patients/') || item.endpoint.includes('/appointments/')))
            method = 'patch';

          // Make the request using the offline service (which will handle online requests)
          await this.makeRequest(method, item.endpoint, item.data);

          // Mark as completed
          await db.syncQueue.update(item.id!, { 
            status: 'completed',
            retries: item.retries + 1,
            nextAttemptAt: undefined,
          });
          
          offlineLogger.info(`Successfully synced action: ${item.action} ${item.entity}`, { itemId: item.id });

          if (item.entity === 'patient' && item.action === 'create' && method === 'post') {
            await this.reconcilePatientListAfterCreateSynced(item.endpoint);
          }
          await this.invalidateRelatedCache(item.endpoint);
        } catch (error: any) {
          const status = error?.response?.status;
          // DELETE: 404/410 means resource is already gone — treat sync as successful
          if (
            item.action === "delete" &&
            (status === 404 || status === 410)
          ) {
            offlineLogger.debug(
              `Sync queue: delete treated as done (already removed)`,
              { itemId: item.id, endpoint: item.endpoint, status }
            );
            await db.syncQueue.update(item.id!, {
              status: "completed",
              retries: item.retries + 1,
              nextAttemptAt: undefined,
              error: undefined,
            });
            await this.invalidateRelatedCache(item.endpoint);
            continue;
          }

          // Extract error message more robustly
          const errorMessage = error?.message || 
                              error?.toString() || 
                              (typeof error === 'string' ? error : 'Unknown error');
          
          offlineLogger.error(`Failed to sync action: ${item.action} ${item.entity}`, {
            itemId: item.id,
            error: errorMessage,
            retries: item.retries,
            endpoint: item.endpoint,
            ...(error?.response && {
              status: error.response.status,
              statusText: error.response.statusText,
            }),
          });
          
          const newRetries = item.retries + 1;
          // Never hard-mark as failed; keep pending and retry automatically with backoff
          const baseMs = 5000;
          const backoffMs = Math.min(baseMs * Math.pow(2, Math.min(newRetries, 6)), 5 * 60 * 1000); // cap 5 min
          await db.syncQueue.update(item.id!, {
            status: 'pending',
            retries: newRetries,
            error: errorMessage,
            nextAttemptAt: new Date(Date.now() + backoffMs),
          });
          offlineLogger.info(`Action will retry automatically (attempt ${newRetries})`, { itemId: item.id, backoffMs });
        }
      }
      
      const remaining = await db.syncQueue.where('status').equals('pending').count();
      offlineLogger.info(`Sync completed. ${remaining} actions still pending`);
    } catch (error: any) {
      // Extract error information more robustly
      const errorInfo = {
        message: error?.message || error?.toString() || 'Unknown error',
        name: error?.name || 'Error',
        stack: error?.stack || undefined,
        ...(error?.response && {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        }),
      };
      
      offlineLogger.error('Error syncing pending actions', errorInfo);
    } finally {
      this.syncInProgress = false;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offline-sync-complete'));
      }
    }
  }

  /**
   * Merge the latest mapped payload into an existing queued offline patient POST
   * (avoids duplicate creates and duplicate optimistic rows).
   */
  async updatePendingPatientCreatePayload(queueId: number, mappedData: any): Promise<boolean> {
    try {
      if (!db.isOpen()) {
        await db.open();
      }
      const item = await db.syncQueue.get(queueId);
      if (
        !item ||
        item.status !== 'pending' ||
        item.entity !== 'patient' ||
        item.action !== 'create' ||
        (item.method != null && item.method !== 'post')
      ) {
        return false;
      }

      await db.syncQueue.update(queueId, { data: mappedData });

      const listEndpoint = this.getListEndpoint(item.endpoint);
      const normalizePath = (p: string) => {
        const base = p.split('?')[0];
        return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
      };
      const listNorm = normalizePath(listEndpoint);

      const mergeRow = (rows: any[]) =>
        rows.map((row: any) =>
          row._queueId === queueId
            ? {
                ...row,
                ...mappedData,
                id: row.id,
                _offline: true,
                _pending: true,
                _queueId: queueId,
              }
            : row
        );

      const cached = await this.getCachedResponse(listEndpoint);
      if (!cached) {
        return true;
      }

      let updatedList: any;
      if (Array.isArray(cached)) {
        updatedList = mergeRow(cached);
      } else if (cached.data && Array.isArray(cached.data)) {
        updatedList = { ...cached, data: mergeRow(cached.data) };
      } else if (cached.results && Array.isArray(cached.results)) {
        updatedList = { ...cached, results: mergeRow(cached.results) };
      } else {
        return true;
      }

      await this.cacheResponse(listEndpoint, updatedList);
      await swrMutateForOffline(listEndpoint, updatedList, { revalidate: false });
      await swrMutateForOffline(
        (key: unknown) =>
          typeof key === 'string' &&
          key !== listEndpoint &&
          normalizePath(key) === listNorm,
        updatedList,
        { revalidate: false }
      );

      offlineLogger.info('Merged payload into pending offline patient create', { queueId });
      return true;
    } catch (e: any) {
      offlineLogger.error('updatePendingPatientCreatePayload failed', { error: e?.message, queueId });
      return false;
    }
  }

  async isSyncQueueItemCompleted(queueId: number): Promise<boolean> {
    try {
      if (!db.isOpen()) {
        await db.open();
      }
      const item = await db.syncQueue.get(queueId);
      return item?.status === 'completed';
    } catch {
      return false;
    }
  }

  // Get sync queue status
  async getSyncStatus(): Promise<{
    pending: number;
    syncing: number;
    failed: number;
  }> {
    // Treat failed as pending (we auto-retry; do not surface "failed" in the UI)
    const pending = await db.syncQueue.where('status').equals('pending').count();
    const syncing = await db.syncQueue.where('status').equals('syncing').count();
    const failed = 0;

    return { pending, syncing, failed };
  }

  /**
   * Build updated list + API-shaped response for offline writes (single source of truth).
   */
  private computeOptimisticListAndResponse(
    method: 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data: any | undefined,
    cachedList: any,
    queueId?: number
  ): { updatedList: any; apiResponse: any } | null {
    const listEndpoint = this.getListEndpoint(endpoint);

    if (method === 'post') {
      const newItem = {
        ...data,
        id: `temp_${Date.now()}`,
        _offline: true,
        _pending: true,
        ...(queueId != null ? { _queueId: queueId } : {}),
      };

      let updatedData: any;
      if (Array.isArray(cachedList)) {
        updatedData = [newItem, ...cachedList];
      } else if (cachedList.data && Array.isArray(cachedList.data)) {
        updatedData = { ...cachedList, data: [newItem, ...cachedList.data] };
      } else if (cachedList.results && Array.isArray(cachedList.results)) {
        updatedData = { ...cachedList, results: [newItem, ...cachedList.results] };
      } else {
        offlineLogger.debug(`Unknown list structure for ${listEndpoint}`);
        return null;
      }

      return {
        updatedList: updatedData,
        apiResponse: {
          status: true,
          success: true,
          data: newItem,
          message: 'Created successfully (offline - will sync when online)',
        },
      };
    }

    if (method === 'put' || method === 'patch') {
      const itemId = this.extractIdFromEndpoint(endpoint);

      let updatedData: any;
      if (Array.isArray(cachedList)) {
        updatedData = cachedList.map((item: any) =>
          item.id === itemId || item.id?.toString() === itemId?.toString()
            ? { ...item, ...data, _offline: true, _pending: true }
            : item
        );
      } else if (cachedList.data && Array.isArray(cachedList.data)) {
        updatedData = {
          ...cachedList,
          data: cachedList.data.map((item: any) =>
            item.id === itemId || item.id?.toString() === itemId?.toString()
              ? { ...item, ...data, _offline: true, _pending: true }
              : item
          ),
        };
      } else if (cachedList.results && Array.isArray(cachedList.results)) {
        updatedData = {
          ...cachedList,
          results: cachedList.results.map((item: any) =>
            item.id === itemId || item.id?.toString() === itemId?.toString()
              ? { ...item, ...data, _offline: true, _pending: true }
              : item
          ),
        };
      } else {
        offlineLogger.debug(`Unknown list structure for update: ${listEndpoint}`);
        return null;
      }

      return {
        updatedList: updatedData,
        apiResponse: {
          status: true,
          success: true,
          data: { ...data, id: itemId },
          message: 'Updated successfully (offline - will sync when online)',
        },
      };
    }

    if (method === 'delete') {
      const itemId = this.extractIdFromEndpoint(endpoint);

      let updatedData: any;
      if (Array.isArray(cachedList)) {
        updatedData = cachedList.filter(
          (item: any) => item.id !== itemId && item.id?.toString() !== itemId?.toString()
        );
      } else if (cachedList.data && Array.isArray(cachedList.data)) {
        updatedData = {
          ...cachedList,
          data: cachedList.data.filter(
            (item: any) => item.id !== itemId && item.id?.toString() !== itemId?.toString()
          ),
        };
      } else if (cachedList.results && Array.isArray(cachedList.results)) {
        updatedData = {
          ...cachedList,
          results: cachedList.results.filter(
            (item: any) => item.id !== itemId && item.id?.toString() !== itemId?.toString()
          ),
        };
      } else {
        offlineLogger.debug(`Unknown list structure for delete: ${listEndpoint}`);
        return null;
      }

      return {
        updatedList: updatedData,
        apiResponse: {
          status: true,
          success: true,
          message: 'Deleted successfully (offline - will sync when online)',
        },
      };
    }

    return null;
  }

  private stripClientTempRowsFromListCache(cached: any): any {
    const keep = (item: any) => !String(item?.id ?? '').startsWith('temp_');
    if (Array.isArray(cached)) {
      return cached.filter(keep);
    }
    if (cached?.data && Array.isArray(cached.data)) {
      return { ...cached, data: cached.data.filter(keep) };
    }
    if (cached?.results && Array.isArray(cached.results)) {
      return { ...cached, results: cached.results.filter(keep) };
    }
    return cached;
  }

  /** Drop optimistic `temp_*` rows from the patients list so they are not duplicated after sync. */
  private async reconcilePatientListAfterCreateSynced(endpoint: string): Promise<void> {
    try {
      if (!endpoint.includes('/patients')) return;
      const eq = endpoint.split('?')[0];
      if (/\/patients\/\d+/.test(eq)) return;

      const listEndpoint = this.getListEndpoint(endpoint);
      const normalizePath = (p: string) => {
        const base = p.split('?')[0];
        return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
      };
      const listNorm = normalizePath(listEndpoint);

      const cached = await this.getCachedResponse(listEndpoint);
      if (!cached) return;

      const cleaned = this.stripClientTempRowsFromListCache(cached);
      await this.cacheResponse(listEndpoint, cleaned);
      await swrMutateForOffline(listEndpoint, cleaned, { revalidate: false });
      await swrMutateForOffline(
        (key: unknown) =>
          typeof key === 'string' &&
          key !== listEndpoint &&
          normalizePath(key) === listNorm,
        cleaned,
        { revalidate: false }
      );
      offlineLogger.debug('Reconciled patient list after offline create synced', { listEndpoint });
    } catch (e: any) {
      offlineLogger.error('reconcilePatientListAfterCreateSynced failed', { error: e?.message });
    }
  }

  private async applyDetailCacheSideEffects(
    method: 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: any
  ): Promise<void> {
    if (method === 'put' || method === 'patch') {
      const itemCache = await this.getCachedResponse(endpoint);
      if (itemCache) {
        await this.cacheResponse(endpoint, {
          ...itemCache,
          ...data,
          _offline: true,
          _pending: true,
        });
      }
      return;
    }

    if (method === 'delete') {
      try {
        const cachedItem = await db.apiCache.where('endpoint').equals(endpoint).first();
        if (cachedItem) {
          await db.apiCache.delete(cachedItem.id!);
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Offline write: merge IndexedDB list cache with current SWR data, persist, and mutate SWR so tables update immediately.
   */
  private async applyOfflineOptimisticUI(
    method: 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: any,
    queueId?: number
  ): Promise<any | null> {
    try {
      if (typeof window === 'undefined') return null;

      const listEndpoint = this.getListEndpoint(endpoint);
      if (!listEndpoint) return null;

      const normalizePath = (p: string) => {
        const base = p.split('?')[0];
        return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
      };
      const listNorm = normalizePath(listEndpoint);

      let apiResponseOut: any | null = null;
      let updatedListResult: any = null;

      const updater = async (current: any) => {
        const fromDb = await this.getCachedResponse(listEndpoint);
        // Prefer SWR (what the table is showing), then IndexedDB for offline-first pages
        const base = current ?? fromDb ?? null;
        if (!base) {
          offlineLogger.debug(
            `No list in IndexedDB or SWR for optimistic UI: ${listEndpoint}`
          );
          return current;
        }

        const computed = this.computeOptimisticListAndResponse(
          method,
          endpoint,
          data,
          base,
          queueId
        );
        if (!computed) {
          return current;
        }

        apiResponseOut = computed.apiResponse;
        updatedListResult = computed.updatedList;
        await this.cacheResponse(listEndpoint, updatedListResult);
        await this.applyDetailCacheSideEffects(method, endpoint, data);
        offlineLogger.info(`Optimistic list + SWR update for ${listEndpoint}`);
        return updatedListResult;
      };

      await swrMutateForOffline(listEndpoint, updater, { revalidate: false });

      if (updatedListResult != null) {
        await swrMutateForOffline(
          (key: unknown) =>
            typeof key === 'string' &&
            key !== listEndpoint &&
            normalizePath(key) === listNorm,
          updatedListResult,
          { revalidate: false }
        );
      }

      return apiResponseOut;
    } catch (error: any) {
      offlineLogger.error(`Error applying offline optimistic UI for ${endpoint}`, {
        error: error?.message,
      });
      return null;
    }
  }

  // Get list endpoint from detail endpoint
  private getListEndpoint(endpoint: string): string {
    // Remove query parameters first
    const endpointWithoutQuery = endpoint.split('?')[0];
    const parts = endpointWithoutQuery.split('/').filter(p => p);
    
    // Try to find the list endpoint by removing trailing numeric IDs
    // Examples:
    // /super/tenants/1/employees/5 -> /super/tenants/1/employees
    // /super/tenants/1/patients/123 -> /super/tenants/1/patients
    // /management/super/training-guides/10 -> /management/super/training-guides
    // /management/super/roles/5/update -> /management/super/roles (if last is "update")
    
    // Check if last part is a number (ID)
    const lastPart = parts[parts.length - 1];
    
    // Handle special cases like "/update" or "/read" at the end
    if (lastPart && (lastPart === 'update' || lastPart === 'read' || lastPart === 'delete')) {
      // Remove the action word and check if previous part is a number
      if (parts.length >= 2 && /^\d+$/.test(parts[parts.length - 2])) {
        return '/' + parts.slice(0, -2).join('/');
      }
      return '/' + parts.slice(0, -1).join('/');
    }
    
    // If last part is a number, it's likely an ID
    if (lastPart && /^\d+$/.test(lastPart)) {
      return '/' + parts.slice(0, -1).join('/');
    }
    
    // If no ID found, return the endpoint as-is (might already be a list endpoint)
    return endpointWithoutQuery;
  }

  // Extract ID from endpoint
  private extractIdFromEndpoint(endpoint: string): string | number | null {
    // Remove query parameters first
    const endpointWithoutQuery = endpoint.split('?')[0];
    const parts = endpointWithoutQuery.split('/').filter(p => p);
    
    // Handle special cases like "/update" or "/read" at the end
    const lastPart = parts[parts.length - 1];
    
    // If last part is an action word, get the ID before it
    if (lastPart && (lastPart === 'update' || lastPart === 'read' || lastPart === 'delete')) {
      if (parts.length >= 2 && /^\d+$/.test(parts[parts.length - 2])) {
        return parseInt(parts[parts.length - 2], 10);
      }
    }
    
    // If last part is a number, it's likely an ID
    if (lastPart && /^\d+$/.test(lastPart)) {
      return parseInt(lastPart, 10);
    }
    
    return null;
  }

  // Cleanup expired cache entries
  async cleanupExpiredCache(): Promise<void> {
    try {
      // Ensure database is open before attempting cleanup - use safeOpen to handle ConstraintError
      if (!db.isOpen()) {
        try {
          await db.safeOpen();
        } catch (openError: any) {
          // If database can't be opened, skip cleanup silently
          offlineLogger.debug('Database not available for cache cleanup', { 
            error: openError?.message || 'Unknown error' 
          });
          return;
        }
      }

      // Try to query expired cache entries
      // If we get a ConstraintError during the query, it means the database schema is inconsistent
      let expired: any[] = [];
      try {
        const now = new Date();
        expired = await db.apiCache
          .where('expiresAt')
          .below(now)
          .toArray();
      } catch (queryError: any) {
        // If query fails with ConstraintError, try to recover the database
        if (queryError?.name === 'ConstraintError' || queryError?.message?.includes('already exists')) {
          console.warn('ConstraintError during cache query, attempting database recovery...');
          try {
            await db.safeOpen(); // This will attempt recovery
            // Retry the query after recovery
            const now = new Date();
            expired = await db.apiCache
              .where('expiresAt')
              .below(now)
              .toArray();
          } catch (retryError: any) {
            // If retry also fails, skip cleanup for this cycle
            offlineLogger.warn('Failed to query expired cache after recovery, skipping cleanup', {
              error: retryError?.message || 'Unknown error',
            });
            return;
          }
        } else {
          // For other query errors, rethrow to be caught by outer catch
          throw queryError;
        }
      }
      
      if (expired.length > 0) {
        for (const item of expired) {
          try {
            await db.apiCache.delete(item.id!);
          } catch (deleteError: any) {
            // Log individual delete errors but continue with other items
            offlineLogger.warn('Failed to delete expired cache entry', {
              id: item.id,
              endpoint: item.endpoint,
              error: deleteError?.message || 'Unknown error',
            });
          }
        }
        offlineLogger.info(`Cleaned up ${expired.length} expired cache entries`);
      }
    } catch (error: any) {
      // If it's a ConstraintError that we haven't handled, it means recovery failed
      // Log it but don't treat it as critical - the app can continue without cache cleanup
      if (error?.name === 'ConstraintError' || error?.message?.includes('already exists')) {
        // This is a known issue with database schema - log as warning, not error
        offlineLogger.warn('Database constraint error during cache cleanup (non-critical)', {
          error: error?.message || 'Unknown error',
          dbOpen: db.isOpen(),
        });
        return; // Exit gracefully - cleanup can be skipped
      }

      // Extract comprehensive error information for other errors
      let errorMessage = 'Unknown error';
      let errorDetails: any = {};

      if (error instanceof Error) {
        errorMessage = error.message || 'Unknown error';
        errorDetails.name = error.name;
        errorDetails.stack = error.stack?.split('\n').slice(0, 3).join('\n'); // First 3 lines
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }

      errorDetails.message = errorMessage;
      errorDetails.errorType = error?.constructor?.name || typeof error;
      errorDetails.dbOpen = db.isOpen();

      offlineLogger.error(`Error cleaning up expired cache: ${errorMessage}`, errorDetails);
      
      // Also log directly to console for visibility
      console.error('[OFFLINE CACHE] Cleanup failed:', {
        message: errorMessage,
        errorType: error?.constructor?.name || typeof error,
        dbOpen: db.isOpen(),
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
        } : String(error),
      });
    }
  }

  // Invalidate related cache entries (for SWR)
  private async invalidateRelatedCache(endpoint: string): Promise<void> {
    try {
      // Only invalidate in browser environment
      if (typeof window === 'undefined') return;
      
      // Import mutate from SWR dynamically to avoid circular dependency
      const { mutate } = await import('swr');
      
      // Remove query parameters for cache key matching
      const endpointWithoutQuery = endpoint.split('?')[0];
      
      // Invalidate the list endpoint (most important for UI updates)
      const listEndpoint = this.getListEndpoint(endpoint);
      if (listEndpoint && listEndpoint !== endpointWithoutQuery) {
        // Invalidate exact match
        mutate(listEndpoint);
        // Also invalidate with query params variations
        mutate((key: string) => {
          if (typeof key !== 'string') return false;
          const keyWithoutQuery = key.split('?')[0];
          return keyWithoutQuery === listEndpoint;
        }, undefined, { revalidate: true });
        offlineLogger.debug(`Invalidated list endpoint: ${listEndpoint}`);
      }
      
      // Invalidate the detail endpoint
      mutate(endpointWithoutQuery);
      mutate((key: string) => {
        if (typeof key !== 'string') return false;
        const keyWithoutQuery = key.split('?')[0];
        return keyWithoutQuery === endpointWithoutQuery;
      }, undefined, { revalidate: true });
      
      // Invalidate common related endpoints using matcher function
      // This ensures all related endpoints are refreshed
      if (endpoint.includes('/employees')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/employees'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/patients')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/patients'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/appointments')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/appointments'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/notification')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/notification'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/tenants') || endpoint.includes('/organizations')) {
        mutate(
          (key: string) => typeof key === 'string' && (key.includes('/tenants') || key.includes('/organizations')),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/training-guides')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/training-guides'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/roles')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/roles'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/permissions')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/permissions'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/departments')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/departments'),
          undefined,
          { revalidate: true }
        );
      } else if (endpoint.includes('/schedules')) {
        mutate(
          (key: string) => typeof key === 'string' && key.includes('/schedules'),
          undefined,
          { revalidate: true }
        );
      }
      
      offlineLogger.debug(`Invalidated SWR cache for ${endpoint} and related endpoints`);
    } catch (error: any) {
      offlineLogger.error(`Error invalidating cache for ${endpoint}`, {
        error: error?.message,
      });
    }
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();

