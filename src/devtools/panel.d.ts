/**
 * DevTools Panel - TypeScript Definitions
 */

import { Signal } from '../core/signal';

/**
 * Filter options for DevTools panel
 */
export interface DevToolsFilters {
    level?: string;
    source?: string;
    search?: string;
}

/**
 * Component info for DevTools
 */
export interface ComponentInfo {
    props?: Record<string, any>;
    [key: string]: any;
}

/**
 * DevTools panel class
 */
export declare class DevToolsPanel {
    enabled: boolean;
    panel: HTMLElement | null;
    signals: Map<string, Signal<any>>;
    components: Map<string, ComponentInfo>;
    selectedSignal: Signal<any> | null;

    /**
     * Initialize and show the DevTools panel
     */
    init(): void;

    /**
     * Create the panel DOM structure
     */
    createPanel(): void;

    /**
     * Attach keyboard shortcut (Ctrl+Shift+D)
     */
    attachKeyboardShortcut(): void;

    /**
     * Register a signal for inspection
     */
    registerSignal(name: string, signal: Signal<any>): void;

    /**
     * Register a component for inspection
     */
    registerComponent(id: string, component: ComponentInfo): void;

    /**
     * Render a specific tab
     */
    renderTab(tab: string): void;

    /**
     * Render signals tab
     */
    renderSignals(container: HTMLElement): void;

    /**
     * Render components tab
     */
    renderComponents(container: HTMLElement): void;

    /**
     * Render performance tab
     */
    renderPerformance(container: HTMLElement): void;

    /**
     * Escape HTML for display
     */
    escapeHtml(text: string): string;

    /**
     * Show the panel
     */
    show(): void;

    /**
     * Hide the panel
     */
    hide(): void;

    /**
     * Toggle panel visibility
     */
    toggle(): void;
}

/**
 * Global DevTools instance
 */
export declare const devtools: DevToolsPanel;

export default devtools;
