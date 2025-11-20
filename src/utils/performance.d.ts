/**
 * Performance Monitoring Utilities - TypeScript Definitions
 */

/**
 * Performance measurement result
 */
export interface PerformanceMeasurement {
    label: string;
    duration: string;
    marks: PerformanceMark[];
}

/**
 * Performance mark/checkpoint
 */
export interface PerformanceMark {
    label: string;
    time: number;
}

/**
 * Active metric
 */
export interface ActiveMetric {
    label: string;
    elapsed: number;
    marks: PerformanceMark[];
}

/**
 * Performance monitor class
 */
export declare class PerformanceMonitor {
    metrics: Map<string, { start: number; marks: PerformanceMark[] }>;
    enabled: boolean;

    /**
     * Start a performance measurement
     */
    start(label: string): void;

    /**
     * Add a mark/checkpoint to an ongoing measurement
     */
    mark(label: string, markLabel: string): void;

    /**
     * End a measurement and log results
     */
    end(label: string): PerformanceMeasurement | null;

    /**
     * Measure a function execution
     */
    measure<T>(label: string, fn: () => T): T;

    /**
     * Measure async function execution
     */
    measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T>;

    /**
     * Get all current measurements
     */
    getMetrics(): ActiveMetric[];

    /**
     * Clear all measurements
     */
    clear(): void;

    /**
     * Enable performance monitoring
     */
    enable(): void;

    /**
     * Disable performance monitoring
     */
    disable(): void;
}

/**
 * Global performance monitor instance
 */
export declare const perf: PerformanceMonitor;

/**
 * Decorator for measuring component render time
 */
export declare function measureRender<T extends Function>(renderFn: T): T;

/**
 * Decorator for measuring effect execution
 */
export declare function measureEffect<T extends Function>(
    effectFn: T,
    label?: string
): T;

/**
 * Simple FPS monitor
 */
export declare class FPSMonitor {
    frames: number[];
    enabled: boolean;
    lastTime: number;

    /**
     * Start monitoring FPS
     */
    start(): void;

    /**
     * Internal tick function
     */
    tick(): void;

    /**
     * Get current average FPS
     */
    getFPS(): number;

    /**
     * Stop monitoring FPS
     */
    stop(): void;
}

export default perf;
