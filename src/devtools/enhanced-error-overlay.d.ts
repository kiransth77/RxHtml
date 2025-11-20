/**
 * Enhanced Error Overlay - TypeScript Definitions
 */

/**
 * Error record
 */
export interface ErrorRecord {
    level: 'error' | 'warning';
    source: 'runtime' | 'network' | 'component' | 'console';
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    stack?: string;
    timestamp: number;
}

/**
 * Error filters
 */
export interface ErrorFilters {
    level: 'all' | 'error' | 'warning';
    source: 'all' | 'runtime' | 'network' | 'component' | 'console';
    search: string;
}

/**
 * Enhanced error overlay class
 */
export declare class EnhancedErrorOverlay {
    errors: ErrorRecord[];
    filters: ErrorFilters;
    maxErrors: number;
    overlay: HTMLElement | null;

    /**
     * Initialize the enhanced error overlay
     */
    init(): void;

    /**
     * Setup comprehensive error handlers
     */
    setupErrorHandlers(): void;

    /**
     * Intercept console methods
     */
    interceptConsole(): void;

    /**
     * Add error to the list
     */
    addError(error: ErrorRecord): void;

    /**
     * Create overlay DOM structure
     */
    createOverlay(): void;

    /**
     * Render the overlay
     */
    render(): void;

    /**
     * Render header
     */
    renderHeader(): HTMLElement;

    /**
     * Render filter controls
     */
    renderFilters(): HTMLElement;

    /**
     * Render error list
     */
    renderErrorList(errors: ErrorRecord[]): HTMLElement;

    /**
     * Render individual error
     */
    renderError(error: ErrorRecord, index: number): HTMLElement;

    /**
     * Get filtered errors
     */
    getFilteredErrors(): ErrorRecord[];

    /**
     * Attach event listeners
     */
    attachEventListeners(): void;

    /**
     * Clear all errors
     */
    clear(): void;

    /**
     * Show overlay
     */
    show(): void;

    /**
     * Hide overlay
     */
    hide(): void;

    /**
     * Escape HTML
     */
    escapeHtml(text: string): string;
}

export default EnhancedErrorOverlay;
