/**
 * Network Inspector - TypeScript Definitions
 */

/**
 * Network request record
 */
export interface NetworkRequest {
    id: string;
    method: string;
    url: string;
    type: 'fetch' | 'xhr';
    startTime: number;
    headers?: Record<string, string>;
    body?: any;
    status: number | null;
    statusText: string | null;
    duration: string | null;
    response?: string;
    responseHeaders?: Record<string, string>;
    error?: string | null;
}

/**
 * Network request filters
 */
export interface NetworkFilters {
    method?: string;
    status?: number;
    type?: 'fetch' | 'xhr';
    url?: string;
}

/**
 * Network statistics
 */
export interface NetworkStats {
    total: number;
    successful: number;
    failed: number;
    avgDuration: string;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
}

/**
 * Network inspector class
 */
export declare class NetworkInspector {
    requests: NetworkRequest[];
    enabled: boolean;
    maxRequests: number;
    filters: NetworkFilters;

    /**
     * Start capturing network requests
     */
    start(): void;

    /**
     * Stop capturing network requests
     */
    stop(): void;

    /**
     * Intercept fetch API
     */
    interceptFetch(): void;

    /**
     * Intercept XMLHttpRequest
     */
    interceptXHR(): void;

    /**
     * Add request to history
     */
    addRequest(request: NetworkRequest): void;

    /**
     * Get all requests with optional filters
     */
    getRequests(filters?: NetworkFilters): NetworkRequest[];

    /**
     * Clear all requests
     */
    clear(): void;

    /**
     * Get request by ID
     */
    getRequest(id: string): NetworkRequest | undefined;

    /**
     * Export requests as JSON
     */
    export(): string;

    /**
     * Generate unique request ID
     */
    generateId(): string;

    /**
     * Convert Headers object to plain object
     */
    headersToObject(headers: Headers): Record<string, string>;

    /**
     * Get statistics
     */
    getStats(): NetworkStats;

    /**
     * Group requests by property
     */
    groupBy(prop: keyof NetworkRequest): Record<string, number>;
}

/**
 * Global network inspector instance
 */
export declare const networkInspector: NetworkInspector;

export default networkInspector;
