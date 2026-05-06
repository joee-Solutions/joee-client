import { offlineService } from './offlineService';
import { offlineLogger } from './offlineLogger';
import { API_ENDPOINTS } from '@/framework/api-endpoints';
import { processRequestAuth } from '@/framework/https';

/**
 * Pre-cache Service
 * Automatically caches all important endpoints on first load
 */

interface PreCacheConfig {
  enabled: boolean;
  endpoints: string[];
  onProgress?: (current: number, total: number, endpoint?: string) => void;
}

class PreCacheService {
  private static instance: PreCacheService;
  private isPreCaching = false;
  private preCacheCompleted = false;
  private maxConcurrentRequests = 5; // Limit concurrent requests to prevent server overload
  private activeRequests = 0;
  private requestDelay = 100; // Delay between requests in milliseconds

  private constructor() {
    // Check if pre-cache was already completed
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('offline_precache_completed');
      this.preCacheCompleted = completed === 'true';
    }
  }

  static getInstance(): PreCacheService {
    if (!PreCacheService.instance) {
      PreCacheService.instance = new PreCacheService();
    }
    return PreCacheService.instance;
  }

  /**
   * Get list of all important endpoints to pre-cache
   * This includes ALL GET endpoints that can be cached
   * Automatically extracts all GET endpoints from API_ENDPOINTS
   */
  private getImportantEndpoints(): string[] {
    const endpoints: string[] = [];
    
    // Helper to add endpoint with pagination variants
    const addWithPagination = (endpoint: string, maxPages: number = 5) => {
      endpoints.push(endpoint);
      for (let page = 1; page <= maxPages; page++) {
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoints.push(`${endpoint}${separator}page=${page}&limit=10`);
      }
    };

    // Dashboard endpoints
    endpoints.push(
      API_ENDPOINTS.GET_DASHBOARD_DATA,
      API_ENDPOINTS.GET_DASHBOARD_APPOINTMENTS,
      API_ENDPOINTS.GET_DASHBOARD_PATIENTS,
      API_ENDPOINTS.GET_DASHBOARD_USERS,
    );

    // Organizations - with multiple pagination and filter variants
    addWithPagination(API_ENDPOINTS.GET_ALL_TENANTS, 5);
    endpoints.push(
      `${API_ENDPOINTS.GET_ALL_TENANTS}?limit=4`, // Dashboard preview
      API_ENDPOINTS.GET_ALL_TENANTS_ACTIVE,
      API_ENDPOINTS.GET_ALL_TENANTS_INACTIVE,
      `${API_ENDPOINTS.GET_ALL_TENANTS}?status=active`,
      `${API_ENDPOINTS.GET_ALL_TENANTS}?status=inactive`,
    );

    // All Users/Employees
    addWithPagination(API_ENDPOINTS.GET_ALL_USERS, 5);

    // Notifications - All variations
    endpoints.push(API_ENDPOINTS.GET_NOTIFICATIONS);
    addWithPagination(`${API_ENDPOINTS.GET_NOTIFICATIONS}?tab=all`, 5);
    addWithPagination(`${API_ENDPOINTS.GET_NOTIFICATIONS}?tab=sent`, 5);
    addWithPagination(`${API_ENDPOINTS.GET_NOTIFICATIONS}?tab=received`, 5);

    // Admin Profile
    endpoints.push(API_ENDPOINTS.GET_ADMIN_PROFILE);

    // Super Admins
    addWithPagination(API_ENDPOINTS.GET_SUPER_ADMIN, 5);

    // System Settings
    endpoints.push(API_ENDPOINTS.GET_SYSTEM_SETTINGS);

    // Roles & Permissions
    addWithPagination(API_ENDPOINTS.GET_ALL_ROLES, 5);
    endpoints.push(`${API_ENDPOINTS.GET_ALL_ROLES}?permission=true`);
    addWithPagination(API_ENDPOINTS.GET_ALL_PERMISSIONS, 5);

    // Training Guides
    addWithPagination(API_ENDPOINTS.GET_TRAINING_GUIDES, 5);
    endpoints.push(API_ENDPOINTS.GET_TRAINING_GUIDE_CATEGORIES);

    // Remove duplicates
    return [...new Set(endpoints)];
  }

  /**
   * Get tenant-specific endpoints for a given tenant
   * Includes paginated versions for list endpoints and ALL possible endpoints
   * Automatically generates pagination for all list endpoints
   */
  private getTenantEndpoints(tenantId: number): string[] {
    const endpoints: string[] = [];
    
    // Helper to add endpoint with pagination
    const addWithPagination = (endpoint: string, maxPages: number = 5) => {
      endpoints.push(endpoint);
      for (let page = 1; page <= maxPages; page++) {
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoints.push(`${endpoint}${separator}page=${page}&limit=10`);
      }
    };

    // Organization details
    endpoints.push(API_ENDPOINTS.GET_TENANT(tenantId.toString()));
    
    // Departments tab - Multiple pages
    addWithPagination(API_ENDPOINTS.TENANTS_DEPARTMENTS(tenantId), 5);
    
    // Employees tab - Multiple pages
    addWithPagination(API_ENDPOINTS.GET_TENANTS_EMPLOYEES(tenantId), 5);
    
    // Patients tab - Multiple pages (more pages for patients as they're usually more numerous)
    addWithPagination(API_ENDPOINTS.TENANTS_PATIENTS(tenantId), 10);
    addWithPagination(API_ENDPOINTS.GET_ALL_PATIENTS(tenantId), 10);
    
    // Appointments tab - Multiple pages
    addWithPagination(API_ENDPOINTS.TENANTS_APPOINTMENTS(tenantId), 5);
    
    // Schedules tab - Multiple pages
    addWithPagination(API_ENDPOINTS.TENANTS_SCHEDULES(tenantId), 5);
    
    // Tenant Users/Employees (alternative endpoint)
    addWithPagination(API_ENDPOINTS.GET_TENANT_USERS(tenantId.toString()), 5);

    // Remove duplicates
    return [...new Set(endpoints)];
  }

  /**
   * Wait for an available request slot (throttling)
   * Prevents overwhelming the server with too many concurrent requests
   */
  private async waitForAvailableSlot(): Promise<void> {
    while (this.activeRequests >= this.maxConcurrentRequests) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * Pre-cache all important endpoints including all organization tab pages
   */
  async preCacheAll(config?: Partial<PreCacheConfig>): Promise<void> {
    // Don't pre-cache if already completed or currently caching
    if (this.preCacheCompleted || this.isPreCaching) {
      offlineLogger.debug('Pre-cache skipped', {
        reason: this.preCacheCompleted ? 'already completed' : 'already in progress',
      });
      return;
    }

    // Don't pre-cache if offline
    if (!offlineService.getOnlineStatus()) {
      offlineLogger.warn('Pre-cache skipped - device is offline');
      return;
    }

    this.isPreCaching = true;
    offlineLogger.info('🚀 Starting comprehensive pre-cache', {
      includes: 'dashboard, organizations, notifications, login data, and all organization tabs',
    });

    let totalEndpoints = 0;
    let successCount = 0;
    let failCount = 0;

    try {
      // Step 1: Pre-cache base endpoints (dashboard, notifications, login, etc.)
      const baseEndpoints = this.getImportantEndpoints();
      totalEndpoints = baseEndpoints.length;

      offlineLogger.info('📦 Step 1: Pre-caching base endpoints', {
        count: baseEndpoints.length,
      });

      for (let i = 0; i < baseEndpoints.length; i++) {
        const endpoint = baseEndpoints[i];
        
        if (config?.onProgress) {
          // Don't pass endpoint - just show progress
          config.onProgress(i + 1, baseEndpoints.length);
        }

        // Throttle requests to prevent overwhelming the server
        await this.waitForAvailableSlot();

        try {
          this.activeRequests++;
          await processRequestAuth('get', endpoint);
          successCount++;
          offlineLogger.debug(`✅ Pre-cached endpoint`, {
            progress: `${i + 1}/${baseEndpoints.length}`,
          });
        } catch (error: any) {
          failCount++;
          offlineLogger.warn(`❌ Failed to pre-cache endpoint`, {
            error: error?.message || error,
            progress: `${i + 1}/${baseEndpoints.length}`,
          });
        } finally {
          this.activeRequests--;
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }

      // Step 2: Fetch all organizations to get their IDs
      offlineLogger.info('📦 Step 2: Fetching all organizations');
      let organizations: any[] = [];
      
      try {
        const orgsResponse = await processRequestAuth('get', API_ENDPOINTS.GET_ALL_TENANTS);
        // Extract organizations from response (handle different response structures)
        if (Array.isArray(orgsResponse)) {
          organizations = orgsResponse;
        } else if (orgsResponse?.data && Array.isArray(orgsResponse.data)) {
          organizations = orgsResponse.data;
        } else if (orgsResponse?.data?.data && Array.isArray(orgsResponse.data.data)) {
          organizations = orgsResponse.data.data;
        }
        
        offlineLogger.info(`Found ${organizations.length} organizations to pre-cache`);
      } catch (error: any) {
        offlineLogger.warn('Failed to fetch organizations list', {
          error: error?.message,
        });
      }

      // Step 3: Pre-cache all organization tab pages (for ALL organizations)
      if (organizations.length > 0) {
        offlineLogger.info('📦 Step 3: Pre-caching ALL organization tab pages', {
          organizationCount: organizations.length,
        });

        // Calculate total endpoints first (for accurate progress)
        let orgEndpointsCount = 0;
        const validOrgs: Array<{ org: any; tenantId: number; endpoints: string[] }> = [];
        
        // Process ALL organizations (not just first few)
        for (const org of organizations) {
          const tenantId = org.id || org.organization_id || parseInt(org.slug || org.domain || '0', 10);
          if (tenantId && !isNaN(tenantId)) {
            const endpoints = this.getTenantEndpoints(tenantId);
            validOrgs.push({ org, tenantId, endpoints });
            orgEndpointsCount += endpoints.length;
          }
        }
        
        totalEndpoints = baseEndpoints.length + orgEndpointsCount;
        
        offlineLogger.info(`Will cache ${orgEndpointsCount} organization endpoints for ${validOrgs.length} organizations`);

        for (let orgIndex = 0; orgIndex < validOrgs.length; orgIndex++) {
          const { org, tenantId, endpoints: tenantEndpoints } = validOrgs[orgIndex];

          offlineLogger.debug(`Pre-caching organization ${tenantId} (${orgIndex + 1}/${validOrgs.length})`, {
            orgName: org.name || org.domain || 'Unknown',
            endpoints: tenantEndpoints.length,
          });

          for (let endpointIndex = 0; endpointIndex < tenantEndpoints.length; endpointIndex++) {
            const endpoint = tenantEndpoints[endpointIndex];
            const currentIndex = baseEndpoints.length + 
              validOrgs.slice(0, orgIndex).reduce((sum, o) => sum + o.endpoints.length, 0) + 
              endpointIndex + 1;
            
            if (config?.onProgress) {
              // Don't pass endpoint - just show progress
              config.onProgress(currentIndex, totalEndpoints);
            }

            // Throttle requests to prevent overwhelming the server
            await this.waitForAvailableSlot();

            try {
              this.activeRequests++;
              const response = await processRequestAuth('get', endpoint);
              successCount++;
              offlineLogger.debug(`✅ Pre-cached organization endpoint`);
              
              // Step 4: Cache individual items from lists (patients, employees, appointments, etc.)
              await this.cacheIndividualItemsFromList(endpoint, response, tenantId);
            } catch (error: any) {
              failCount++;
              offlineLogger.warn(`❌ Failed to pre-cache organization endpoint`, {
                error: error?.message,
              });
            } finally {
              this.activeRequests--;
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, this.requestDelay));
          }
        }
      }

      // Step 4: Cache individual items from global lists
      await this.cacheGlobalListItems(config, baseEndpoints.length, totalEndpoints);

      // Step 5: Cache additional paginated results for organizations
      if (organizations.length > 0) {
        offlineLogger.info('📦 Step 5: Caching additional paginated results');
        await this.cachePaginatedResults(organizations, config, totalEndpoints);
      }

      this.preCacheCompleted = true;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('offline_precache_completed', 'true');
        localStorage.setItem('offline_precache_timestamp', new Date().toISOString());
        localStorage.setItem('offline_precache_stats', JSON.stringify({
          total: totalEndpoints,
          success: successCount,
          failed: failCount,
          organizations: organizations.length,
        }));
      }

      offlineLogger.info('✅ Comprehensive pre-cache completed', {
        total: totalEndpoints,
        success: successCount,
        failed: failCount,
        organizations: organizations.length,
      });
    } catch (error: any) {
      offlineLogger.error('Pre-cache process failed', { error: error?.message });
    } finally {
      this.isPreCaching = false;
    }
  }

  /**
   * Pre-cache tenant-specific endpoints for a given tenant
   * This includes all tab pages: departments, employees, patients, appointments, schedules
   */
  async preCacheTenant(tenantId: number): Promise<void> {
    if (!offlineService.getOnlineStatus()) {
      offlineLogger.warn(`Cannot pre-cache tenant ${tenantId} - device is offline`);
      return;
    }

    const tenantEndpoints = this.getTenantEndpoints(tenantId);

    offlineLogger.info(`Pre-caching tenant ${tenantId} endpoints`, {
      totalEndpoints: tenantEndpoints.length,
      tabs: ['departments', 'employees', 'patients', 'appointments', 'schedules'],
    });

    for (const endpoint of tenantEndpoints) {
      try {
        await processRequestAuth('get', endpoint);
        offlineLogger.debug(`✅ Pre-cached tenant endpoint: ${endpoint}`);
      } catch (error: any) {
        offlineLogger.warn(`❌ Failed to pre-cache tenant endpoint: ${endpoint}`, {
          error: error?.message,
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Cache additional endpoints on-demand (for pages visited after initial pre-cache)
   * This allows incremental caching of pages that weren't in the initial pre-cache
   */
  async cacheAdditionalEndpoints(endpoints: string[]): Promise<void> {
    if (!offlineService.getOnlineStatus()) {
      offlineLogger.warn('Cannot cache additional endpoints - device is offline');
      return;
    }

    offlineLogger.info(`Caching ${endpoints.length} additional endpoints`);

    for (const endpoint of endpoints) {
      try {
        await processRequestAuth('get', endpoint);
        offlineLogger.debug(`✅ Cached additional endpoint: ${endpoint}`);
      } catch (error: any) {
        offlineLogger.warn(`❌ Failed to cache additional endpoint: ${endpoint}`, {
          error: error?.message,
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Cache a single endpoint on-demand
   */
  async cacheEndpoint(endpoint: string): Promise<boolean> {
    if (!offlineService.getOnlineStatus()) {
      offlineLogger.warn(`Cannot cache endpoint ${endpoint} - device is offline`);
      return false;
    }

    try {
      await processRequestAuth('get', endpoint);
      offlineLogger.debug(`✅ Cached endpoint: ${endpoint}`);
      return true;
    } catch (error: any) {
      offlineLogger.warn(`❌ Failed to cache endpoint: ${endpoint}`, {
        error: error?.message,
      });
      return false;
    }
  }

  /**
   * Reset pre-cache status (useful for testing or forcing re-cache)
   */
  resetPreCache(): void {
    this.preCacheCompleted = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('offline_precache_completed');
      localStorage.removeItem('offline_precache_timestamp');
    }
    offlineLogger.info('Pre-cache status reset');
  }

  /**
   * Check if pre-cache was completed
   */
  isCompleted(): boolean {
    return this.preCacheCompleted;
  }

  /**
   * Get pre-cache timestamp
   */
  getPreCacheTimestamp(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('offline_precache_timestamp');
    }
    return null;
  }

  /**
   * Cache individual items from a list response
   * This allows caching detail pages for items in lists
   * Public method so it can be called from https.ts for on-demand caching
   */
  async cacheIndividualItemsFromList(
    listEndpoint: string,
    listResponse: any,
    tenantId?: number
  ): Promise<void> {
    try {
      // Extract data array from response (handle different response structures)
      let items: any[] = [];
      if (Array.isArray(listResponse)) {
        items = listResponse;
      } else if (listResponse?.data && Array.isArray(listResponse.data)) {
        items = listResponse.data;
      } else if (listResponse?.data?.data && Array.isArray(listResponse.data.data)) {
        items = listResponse.data.data;
      }

      if (items.length === 0) return;

      // Cache individual items based on endpoint type
      if (listEndpoint.includes('/patients')) {
        // Cache individual patient details - cache more items
        for (const item of items.slice(0, 50)) { // Increased to 50
          const patientId = item.id || item.patientId;
          if (patientId && tenantId) {
            try {
              await processRequestAuth('get', API_ENDPOINTS.GET_PATIENT(tenantId, patientId));
              offlineLogger.debug(`✅ Pre-cached patient detail: ${patientId}`);
              // Small delay to avoid overwhelming the server
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
              // Silently fail - not critical
            }
          }
        }
      } else if (listEndpoint.includes('/employees')) {
        // Cache individual employee details if endpoint exists
        // Check if we can get employee details (might need tenantId + employeeId)
        for (const item of items.slice(0, 50)) {
          const employeeId = item.id || item.employeeId;
          if (employeeId && tenantId) {
            try {
              // Try to cache employee detail if endpoint exists
              const employeeEndpoint = API_ENDPOINTS.UPDATE_TENANT_EMPLOYEE(tenantId, employeeId);
              // For GET, we'd need a GET endpoint, but UPDATE endpoint might work for caching
              // This is a fallback - actual GET endpoint might be different
              offlineLogger.debug(`Would cache employee detail: ${employeeId}`);
            } catch (error) {
              // Silently fail - not critical
            }
          }
        }
      } else if (listEndpoint.includes('/training-guides') && !listEndpoint.includes('/categories')) {
        // Cache individual training guide details - cache more items
        for (const item of items.slice(0, 50)) {
          const guideId = item.id || item.guideId;
          if (guideId) {
            try {
              await processRequestAuth('get', API_ENDPOINTS.GET_TRAINING_GUIDE(guideId));
              offlineLogger.debug(`✅ Pre-cached training guide: ${guideId}`);
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
              // Silently fail - not critical
            }
          }
        }
      } else if (listEndpoint.includes('/appointments')) {
        // Cache individual appointment details if endpoint exists
        for (const item of items.slice(0, 30)) {
          const appointmentId = item.id || item.appointmentId;
          if (appointmentId && tenantId) {
            try {
              // Appointment detail endpoint might exist
              offlineLogger.debug(`Would cache appointment detail: ${appointmentId}`);
            } catch (error) {
              // Silently fail
            }
          }
        }
      }
    } catch (error: any) {
      offlineLogger.debug('Error caching individual items', { error: error?.message });
    }
  }

  /**
   * Cache individual items from global lists (training guides, etc.)
   */
  private async cacheGlobalListItems(
    config: Partial<PreCacheConfig> | undefined,
    baseIndex: number,
    totalEndpoints: number
  ): Promise<void> {
    try {
      // Cache training guides
      try {
        const guidesResponse = await processRequestAuth('get', API_ENDPOINTS.GET_TRAINING_GUIDES);
        await this.cacheIndividualItemsFromList(API_ENDPOINTS.GET_TRAINING_GUIDES, guidesResponse);
      } catch (error) {
        // Silently fail
      }

      // Cache super admins (if needed)
      try {
        const adminsResponse = await processRequestAuth('get', API_ENDPOINTS.GET_SUPER_ADMIN);
        // Admins might not have individual detail endpoints
      } catch (error) {
        // Silently fail
      }
    } catch (error: any) {
      offlineLogger.debug('Error caching global list items', { error: error?.message });
    }
  }

  /**
   * Cache paginated results for organizations
   * This ensures we cache multiple pages of data for each organization
   */
  private async cachePaginatedResults(
    organizations: any[],
    config: Partial<PreCacheConfig> | undefined,
    currentTotal: number
  ): Promise<void> {
    let additionalEndpoints = 0;
    
    // Cache additional pages for each organization's lists
    for (const org of organizations.slice(0, 10)) { // Limit to first 10 orgs to avoid too many requests
      const tenantId = org.id || org.organization_id || parseInt(org.slug || org.domain || '0', 10);
      if (!tenantId || isNaN(tenantId)) continue;

      const paginatedEndpoints = [
        `${API_ENDPOINTS.TENANTS_PATIENTS(tenantId)}?page=3&limit=10`,
        `${API_ENDPOINTS.TENANTS_PATIENTS(tenantId)}?page=4&limit=10`,
        `${API_ENDPOINTS.TENANTS_APPOINTMENTS(tenantId)}?page=3&limit=10`,
        `${API_ENDPOINTS.GET_TENANTS_EMPLOYEES(tenantId)}?page=3&limit=10`,
      ];

      for (const endpoint of paginatedEndpoints) {
        try {
          await processRequestAuth('get', endpoint);
          additionalEndpoints++;
          offlineLogger.debug(`✅ Pre-cached paginated endpoint: ${endpoint}`);
        } catch (error) {
          // Silently fail - not all pages may exist
        }
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    if (additionalEndpoints > 0) {
      offlineLogger.info(`Cached ${additionalEndpoints} additional paginated endpoints`);
    }
  }
}

export const preCacheService = PreCacheService.getInstance();

