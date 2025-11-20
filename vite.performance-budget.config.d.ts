/**
 * Performance Budget - TypeScript Definitions
 */

/**
 * Budget limits
 */
export interface BudgetLimits {
    max: number;
    warn: number;
}

/**
 * Performance budget configuration
 */
export interface PerformanceBudget {
    bundle: BudgetLimits;
    chunks: BudgetLimits;
    assets: BudgetLimits;
    initial: BudgetLimits;
}

/**
 * Performance budget configuration object
 */
export declare const performanceBudget: PerformanceBudget;

/**
 * Vite plugin for enforcing performance budgets
 */
export declare function performanceBudgetPlugin(
    budget?: PerformanceBudget
): {
    name: string;
    enforce: 'post';
    writeBundle(options: any, bundle: any): void;
};

export default performanceBudgetPlugin;
