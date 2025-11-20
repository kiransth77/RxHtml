/**
 * Time-Travel Debugging - TypeScript Definitions
 */

import { Signal } from '../core/signal';

/**
 * State snapshot
 */
export interface Snapshot {
    timestamp: number;
    action: string;
    state: Record<string, any>;
}

/**
 * History entry
 */
export interface HistoryEntry extends Snapshot {
    index: number;
    isCurrent: boolean;
}

/**
 * Time-travel stats
 */
export interface TimeTravelStats {
    totalSnapshots: number;
    currentIndex: number;
    canGoBack: boolean;
    canGoForward: boolean;
    trackedSignals: number;
    isEnabled: boolean;
}

/**
 * Time-travel debugger class
 */
export declare class TimeTravelDebugger {
    history: Snapshot[];
    currentIndex: number;
    maxHistory: number;
    isEnabled: boolean;
    trackedSignals: Map<string, Signal<any>>;
    snapshots: Snapshot[];

    /**
     * Enable time-travel debugging
     */
    enable(): void;

    /**
     * Disable time-travel debugging
     */
    disable(): void;

    /**
     * Track a signal for time-travel
     */
    track(name: string, signal: Signal<any>): void;

    /**
     * Record a state snapshot
     */
    recordSnapshot(action: string, state?: Record<string, any>): void;

    /**
     * Go back in time
     */
    goBack(): boolean;

    /**
     * Go forward in time
     */
    goForward(): boolean;

    /**
     * Jump to specific snapshot
     */
    jumpTo(index: number): boolean;

    /**
     * Restore a snapshot
     */
    restoreSnapshot(snapshot: Snapshot): void;

    /**
     * Get current snapshot
     */
    getCurrentSnapshot(): Snapshot;

    /**
     * Get all snapshots
     */
    getHistory(): HistoryEntry[];

    /**
     * Export history as JSON
     */
    export(): string;

    /**
     * Import history from JSON
     */
    import(json: string): boolean;

    /**
     * Clear history
     */
    clear(): void;

    /**
     * Clone value (deep copy)
     */
    cloneValue<T>(value: T): T;

    /**
     * Get stats
     */
    getStats(): TimeTravelStats;
}

/**
 * Global time-travel debugger instance
 */
export declare const timeTravel: TimeTravelDebugger;

export default timeTravel;
