import { offlineService } from "./offlineService";
import { offlineLogger } from "./offlineLogger";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { processRequestAuth } from "@/framework/https";

interface PreCacheConfig {
  enabled: boolean;
  endpoints: string[];
  onProgress?: (current: number, total: number, endpoint?: string) => void;
}

class PreCacheService {
  private static instance: PreCacheService;
  private isPreCaching = false;
  private preCacheCompleted = false;

  private constructor() {
    if (typeof window !== "undefined") {
      this.preCacheCompleted = localStorage.getItem("offline_precache_completed") === "true";
    }
  }

  static getInstance(): PreCacheService {
    if (!PreCacheService.instance) {
      PreCacheService.instance = new PreCacheService();
    }
    return PreCacheService.instance;
  }

  private getImportantEndpoints(): string[] {
    return [
      API_ENDPOINTS.GET_PROFILE,
      API_ENDPOINTS.GET_DEPARTMENTS,
      API_ENDPOINTS.GET_APPOINTMENTS,
      API_ENDPOINTS.GET_PATIENTS,
      API_ENDPOINTS.GET_EMPLOYEE,
      API_ENDPOINTS.GET_SCHEDULES,
      API_ENDPOINTS.GET_NOTIFICATIONS,
      API_ENDPOINTS.GET_NOTIFICATION_UNREAD,
      API_ENDPOINTS.GET_ADMINS,
    ];
  }

  private getTenantEndpoints(_tenantId: number): string[] {
    // Current API routes are tenant-scoped by auth header/cookies, not by path params.
    return [
      API_ENDPOINTS.GET_DEPARTMENTS,
      API_ENDPOINTS.GET_EMPLOYEE,
      API_ENDPOINTS.GET_PATIENTS,
      API_ENDPOINTS.GET_APPOINTMENTS,
      API_ENDPOINTS.GET_SCHEDULES,
      API_ENDPOINTS.GET_NOTIFICATIONS,
    ];
  }

  async preCacheAll(config?: Partial<PreCacheConfig>): Promise<void> {
    if (this.preCacheCompleted || this.isPreCaching) return;
    if (!offlineService.getOnlineStatus()) {
      offlineLogger.warn("Pre-cache skipped - device is offline");
      return;
    }

    this.isPreCaching = true;
    const endpoints = config?.endpoints?.length ? config.endpoints : this.getImportantEndpoints();
    try {
      for (let i = 0; i < endpoints.length; i += 1) {
        const endpoint = endpoints[i];
        config?.onProgress?.(i + 1, endpoints.length, endpoint);
        try {
          const response = await processRequestAuth("get", endpoint);
          await this.cacheIndividualItemsFromList(endpoint, response);
        } catch (error: any) {
          offlineLogger.debug("Pre-cache request failed", { endpoint, error: error?.message });
        }
      }

      this.preCacheCompleted = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("offline_precache_completed", "true");
        localStorage.setItem("offline_precache_timestamp", new Date().toISOString());
      }
    } finally {
      this.isPreCaching = false;
    }
  }

  async preCacheTenant(tenantId: number): Promise<void> {
    if (!offlineService.getOnlineStatus()) return;
    const endpoints = this.getTenantEndpoints(tenantId);
    for (const endpoint of endpoints) {
      try {
        await processRequestAuth("get", endpoint);
      } catch (error: any) {
        offlineLogger.debug("Tenant pre-cache request failed", {
          endpoint,
          tenantId,
          error: error?.message,
        });
      }
    }
  }

  async cacheAdditionalEndpoints(endpoints: string[]): Promise<void> {
    if (!offlineService.getOnlineStatus()) return;
    for (const endpoint of endpoints) {
      try {
        await processRequestAuth("get", endpoint);
      } catch (error: any) {
        offlineLogger.debug("Additional endpoint pre-cache failed", {
          endpoint,
          error: error?.message,
        });
      }
    }
  }

  async cacheEndpoint(endpoint: string): Promise<boolean> {
    if (!offlineService.getOnlineStatus()) return false;
    try {
      await processRequestAuth("get", endpoint);
      return true;
    } catch {
      return false;
    }
  }

  resetPreCache(): void {
    this.preCacheCompleted = false;
    if (typeof window !== "undefined") {
      localStorage.removeItem("offline_precache_completed");
      localStorage.removeItem("offline_precache_timestamp");
    }
  }

  isCompleted(): boolean {
    return this.preCacheCompleted;
  }

  getPreCacheTimestamp(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("offline_precache_timestamp");
    }
    return null;
  }

  async cacheIndividualItemsFromList(
    _listEndpoint: string,
    _listResponse: any,
    _tenantId?: number
  ): Promise<void> {
    // No-op for now. Detail endpoint caching can be added incrementally
    // after API endpoint constants are formalized.
  }
}

export const preCacheService = PreCacheService.getInstance();

