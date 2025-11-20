/**
 * Performance Budget Configuration
 * Define size limits for different bundle types
 */
/* eslint-disable no-console */

export const performanceBudget = {
  // Total bundle size limits (in KB)
  bundle: {
    max: 50, // Maximum total bundle size
    warn: 40, // Warning threshold
  },

  // Individual chunk limits
  chunks: {
    max: 20,
    warn: 15,
  },

  // Asset limits
  assets: {
    max: 10,
    warn: 8,
  },

  // Initial load budget
  initial: {
    max: 30,
    warn: 25,
  },
};

/**
 * Vite plugin for enforcing performance budgets
 */
export function performanceBudgetPlugin(budget = performanceBudget) {
  return {
    name: 'performance-budget',
    enforce: 'post',

    writeBundle(options, bundle) {
      const results = [];
      let totalSize = 0;
      let hasError = false;
      let hasWarning = false;

      console.log('\n📊 Performance Budget Report\n');
      console.log('━'.repeat(60));

      for (const [fileName, info] of Object.entries(bundle)) {
        if (info.type === 'chunk' || info.type === 'asset') {
          const size = info.code?.length || info.source?.length || 0;
          const sizeKB = (size / 1024).toFixed(2);
          totalSize += size;

          // Determine budget for this file type
          let budgetMax, budgetWarn;
          if (info.type === 'chunk') {
            budgetMax = budget.chunks.max;
            budgetWarn = budget.chunks.warn;
          } else {
            budgetMax = budget.assets.max;
            budgetWarn = budget.assets.warn;
          }

          // Check against budget
          let status = '✅';
          let color = '\x1b[32m'; // Green

          if (sizeKB > budgetMax) {
            status = '❌';
            color = '\x1b[31m'; // Red
            hasError = true;
          } else if (sizeKB > budgetWarn) {
            status = '⚠️';
            color = '\x1b[33m'; // Yellow
            hasWarning = true;
          }

          results.push({
            fileName,
            size: sizeKB,
            status,
            color,
            budget: budgetMax,
          });
        }
      }

      // Sort by size descending
      results.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));

      // Display results
      results.forEach(({ fileName, size, status, color, budget }) => {
        console.log(`${status} ${color}${fileName}\x1b[0m`);
        console.log(`   Size: ${size} KB / ${budget} KB`);
      });

      // Total size check
      const totalSizeKB = (totalSize / 1024).toFixed(2);
      console.log('━'.repeat(60));

      let totalStatus = '✅';
      let totalColor = '\x1b[32m';

      if (totalSizeKB > budget.bundle.max) {
        totalStatus = '❌';
        totalColor = '\x1b[31m';
        hasError = true;
      } else if (totalSizeKB > budget.bundle.warn) {
        totalStatus = '⚠️';
        totalColor = '\x1b[33m';
        hasWarning = true;
      }

      console.log(
        `${totalStatus} ${totalColor}Total: ${totalSizeKB} KB / ${budget.bundle.max} KB\x1b[0m`
      );
      console.log('━'.repeat(60));

      // Summary
      if (hasError) {
        console.log('\n❌ Performance budget exceeded!');
        console.log('   Consider code splitting or reducing bundle size.\n');

        if (process.env.CI || process.env.ENFORCE_BUDGET === 'true') {
          throw new Error('Performance budget exceeded');
        }
      } else if (hasWarning) {
        console.log('\n⚠️  Approaching performance budget limits.\n');
      } else {
        console.log('\n✅ All files within performance budget!\n');
      }
    },
  };
}

export default performanceBudgetPlugin;
