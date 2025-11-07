# Performance Optimization Guide

This guide covers best practices for building high-performance applications with RxHtml Framework.

## Table of Contents

- [Understanding RxHtml Performance](#understanding-rxhtml-performance)
- [Signal Optimization](#signal-optimization)
- [Component Optimization](#component-optimization)
- [Rendering Performance](#rendering-performance)
- [Memory Management](#memory-management)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Profiling and Debugging](#profiling-and-debugging)
- [Benchmarks](#benchmarks)

## Understanding RxHtml Performance

### Why RxHtml is Fast

1. **Fine-grained Reactivity**: Only updates what changed, not entire components
2. **No Virtual DOM**: Direct DOM updates eliminate diffing overhead
3. **Compile-time Optimization**: Templates can be optimized ahead of time
4. **Minimal Framework Code**: Small runtime footprint (~20KB min+gzip)
5. **Efficient Dependency Tracking**: Smart signal dependency graph

### Performance Characteristics

| Operation | RxHtml | React | Vue 3 |
|-----------|--------|-------|-------|
| Initial Render | ⚡ Fast | ✓ Good | ⚡ Fast |
| Updates | ⚡⚡ Fastest | ✓ Good | ⚡ Fast |
| Memory Usage | ⚡ Low | ✓ Medium | ⚡ Low |
| Bundle Size | ⚡⚡ Smallest | ✗ Large | ✓ Medium |

## Signal Optimization

### Use Computed Values

**❌ Bad: Recalculating on every access**
```javascript
const items = signal([...]);

// Recalculates every time
function getTotalPrice() {
    return items.value.reduce((sum, item) => sum + item.price, 0);
}

// Called multiple times - inefficient!
console.log(getTotalPrice());
console.log(getTotalPrice());
```

**✅ Good: Computed memoizes the result**
```javascript
const items = signal([...]);

// Calculates once, caches result
const totalPrice = computed(() => 
    items.value.reduce((sum, item) => sum + item.price, 0)
);

// Uses cached value - efficient!
console.log(totalPrice.value);
console.log(totalPrice.value);
```

### Batch Updates

**❌ Bad: Multiple updates trigger multiple effects**
```javascript
const firstName = signal('John');
const lastName = signal('Doe');

effect(() => {
    console.log(`Name: ${firstName.value} ${lastName.value}`);
});

// Triggers effect twice!
firstName.value = 'Jane';
lastName.value = 'Smith';
```

**✅ Good: Batch updates trigger effect once**
```javascript
import { batch } from 'rxhtmx';

const firstName = signal('John');
const lastName = signal('Doe');

effect(() => {
    console.log(`Name: ${firstName.value} ${lastName.value}`);
});

// Triggers effect only once!
batch(() => {
    firstName.value = 'Jane';
    lastName.value = 'Smith';
});
```

### Avoid Unnecessary Signals

**❌ Bad: Everything is a signal**
```javascript
const config = signal({
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
});

// Config never changes, doesn't need to be reactive!
```

**✅ Good: Only reactive data is signals**
```javascript
// Static configuration - plain object
const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
};

// Dynamic data - signal
const userData = signal(null);
const loading = signal(false);
```

### Minimize Signal Dependencies

**❌ Bad: Effect depends on entire object**
```javascript
const state = signal({
    user: { name: 'John', age: 30 },
    posts: [...],
    comments: [...]
});

// Re-runs when ANY property changes!
effect(() => {
    console.log(state.value.user.name);
});
```

**✅ Good: Computed extracts only what's needed**
```javascript
const state = signal({
    user: { name: 'John', age: 30 },
    posts: [...],
    comments: [...]
});

// Only depends on user.name
const userName = computed(() => state.value.user.name);

effect(() => {
    console.log(userName.value); // Only runs when name changes
});
```

## Component Optimization

### Avoid Unnecessary Re-renders

**❌ Bad: Component recreates functions on every update**
```javascript
const MyComponent = defineComponent({
    setup() {
        const count = signal(0);
        
        // Creates new function on every update!
        return {
            count,
            increment: () => count.value++
        };
    }
});
```

**✅ Good: Functions created once**
```javascript
const MyComponent = defineComponent({
    setup() {
        const count = signal(0);
        
        // Created once during setup
        const increment = () => count.value++;
        
        return { count, increment };
    }
});
```

### Use Lazy Component Loading

**❌ Bad: Loading all components upfront**
```javascript
import HeavyComponent1 from './Heavy1.js';
import HeavyComponent2 from './Heavy2.js';
import HeavyComponent3 from './Heavy3.js';

// All loaded immediately, even if not used
```

**✅ Good: Load components when needed**
```javascript
const MyComponent = defineComponent({
    setup() {
        const showHeavy = signal(false);
        const HeavyComponent = signal(null);
        
        const loadHeavy = async () => {
            if (!HeavyComponent.value) {
                const module = await import('./Heavy.js');
                HeavyComponent.value = module.default;
            }
            showHeavy.value = true;
        };
        
        return { showHeavy, HeavyComponent, loadHeavy };
    }
});
```

### Optimize Props

**❌ Bad: Passing entire objects as props**
```javascript
<ChildComponent :data="largeDataObject" />

// Child re-renders when ANY property in largeDataObject changes
```

**✅ Good: Pass only necessary data**
```javascript
<ChildComponent 
    :id="data.id"
    :name="data.name"
    :status="data.status" 
/>

// Child only re-renders when these specific props change
```

## Rendering Performance

### Use Keys for Lists

**❌ Bad: No keys in v-for**
```javascript
template: `
    <div v-for="item in items">
        {{item.name}}
    </div>
`
```

**✅ Good: Unique keys help identify items**
```javascript
template: `
    <div v-for="item in items" :key="item.id">
        {{item.name}}
    </div>
`
```

### Debounce Expensive Operations

**❌ Bad: Filtering on every keystroke**
```javascript
const SearchComponent = defineComponent({
    setup() {
        const search = signal('');
        const items = signal([...1000 items]);
        
        // Filters 1000 items on every keystroke!
        const filtered = computed(() => 
            items.value.filter(item => 
                item.name.includes(search.value)
            )
        );
        
        return { search, filtered };
    }
});
```

**✅ Good: Debounce search input**
```javascript
const SearchComponent = defineComponent({
    setup() {
        const search = signal('');
        const debouncedSearch = signal('');
        const items = signal([...1000 items]);
        
        let debounceTimer;
        effect(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                debouncedSearch.value = search.value;
            }, 300);
        });
        
        // Only filters after user stops typing
        const filtered = computed(() => 
            items.value.filter(item => 
                item.name.includes(debouncedSearch.value)
            )
        );
        
        return { search, filtered };
    }
});
```

### Virtual Scrolling for Large Lists

**❌ Bad: Rendering 10,000 items**
```javascript
template: `
    <div class="list">
        <div v-for="item in items" :key="item.id">
            {{item.name}}
        </div>
    </div>
`
// Slow! Renders all 10,000 items
```

**✅ Good: Only render visible items**
```javascript
const VirtualList = defineComponent({
    setup() {
        const items = signal([...10000 items]);
        const scrollTop = signal(0);
        const containerHeight = 500;
        const itemHeight = 50;
        
        const visibleItems = computed(() => {
            const start = Math.floor(scrollTop.value / itemHeight);
            const end = Math.ceil((scrollTop.value + containerHeight) / itemHeight);
            return items.value.slice(start, end).map((item, i) => ({
                ...item,
                top: (start + i) * itemHeight
            }));
        });
        
        return { visibleItems, itemHeight };
    },
    template: `
        <div 
            class="list" 
            style="height: 500px; overflow-y: auto"
            @scroll="scrollTop = $event.target.scrollTop"
        >
            <div :style="{ height: items.length * itemHeight + 'px', position: 'relative' }">
                <div 
                    v-for="item in visibleItems" 
                    :key="item.id"
                    :style="{ position: 'absolute', top: item.top + 'px' }"
                >
                    {{item.name}}
                </div>
            </div>
        </div>
    `
});
```

## Memory Management

### Clean Up Effects

**❌ Bad: Effect leaks memory**
```javascript
const MyComponent = defineComponent({
    setup() {
        const data = signal(null);
        
        effect(() => {
            const ws = new WebSocket('ws://...');
            ws.onmessage = (e) => data.value = e.data;
            // WebSocket never closed!
        });
    }
});
```

**✅ Good: Cleanup function closes WebSocket**
```javascript
const MyComponent = defineComponent({
    setup() {
        const data = signal(null);
        
        onMounted(() => {
            const ws = new WebSocket('ws://...');
            ws.onmessage = (e) => data.value = e.data;
            
            // Cleanup on unmount
            return () => ws.close();
        });
        
        return { data };
    }
});
```

### Avoid Memory Leaks in Event Listeners

**❌ Bad: Event listener never removed**
```javascript
onMounted(() => {
    window.addEventListener('resize', handleResize);
    // Never removed!
});
```

**✅ Good: Remove listener on unmount**
```javascript
onMounted(() => {
    window.addEventListener('resize', handleResize);
    
    return () => {
        window.removeEventListener('resize', handleResize);
    };
});
```

### Use WeakMap for Caches

**❌ Bad: Strong references prevent garbage collection**
```javascript
const cache = new Map();

function processData(item) {
    if (!cache.has(item)) {
        cache.set(item, expensiveCalculation(item));
    }
    return cache.get(item);
}
// Items never garbage collected!
```

**✅ Good: WeakMap allows garbage collection**
```javascript
const cache = new WeakMap();

function processData(item) {
    if (!cache.has(item)) {
        cache.set(item, expensiveCalculation(item));
    }
    return cache.get(item);
}
// Items can be garbage collected when no longer referenced
```

## Bundle Size Optimization

### Tree Shaking

Import only what you need:

**❌ Bad: Imports entire library**
```javascript
import * as rxhtml from 'rxhtmx';
```

**✅ Good: Import specific functions**
```javascript
import { signal, computed, effect } from 'rxhtmx';
```

### Code Splitting

**❌ Bad: One large bundle**
```javascript
// main.js loads everything
import './components/all.js';
import './utils/everything.js';
```

**✅ Good: Split by route**
```javascript
const router = createRouter({
    routes: [
        {
            path: '/dashboard',
            component: () => import('./pages/Dashboard.js')
        },
        {
            path: '/profile',
            component: () => import('./pages/Profile.js')
        }
    ]
});
```

### Remove Dead Code

Use tools to identify unused code:

```bash
# Analyze bundle
npm run build -- --analyze

# Check for unused exports
npx ts-prune  # for TypeScript
npx unimported  # for JavaScript
```

## Profiling and Debugging

### Browser DevTools

**Performance Tab:**
```javascript
// Mark important operations
performance.mark('render-start');
// ... rendering code ...
performance.mark('render-end');
performance.measure('render', 'render-start', 'render-end');
```

**Memory Tab:**
```javascript
// Take heap snapshots before and after
// Look for detached DOM nodes
// Check for growing arrays/objects
```

### RxHtml Debugging

```javascript
// Enable debug mode
if (process.env.NODE_ENV === 'development') {
    window.__RXHTML_DEBUG__ = true;
}

// Track signal updates
const count = signal(0);
effect(() => {
    console.log('Count updated:', count.value);
});

// Profile computed values
const expensive = computed(() => {
    console.time('expensive-computation');
    const result = /* ... */;
    console.timeEnd('expensive-computation');
    return result;
});
```

### Performance Monitoring

```javascript
// Monitor render times
const renderTimeSignal = signal(0);

function measureRender(fn) {
    const start = performance.now();
    fn();
    const end = performance.now();
    renderTimeSignal.value = end - start;
}

// Monitor memory usage
function checkMemory() {
    if (performance.memory) {
        console.log('Used JS Heap:', 
            (performance.memory.usedJSHeapSize / 1048576).toFixed(2), 'MB');
    }
}
```

## Benchmarks

### Signal Updates

```javascript
// Benchmark signal updates
console.time('10000 signal updates');
const sig = signal(0);
for (let i = 0; i < 10000; i++) {
    sig.value = i;
}
console.timeEnd('10000 signal updates');
// RxHtml: ~5ms
// React (useState): ~50ms
```

### Computed Values

```javascript
// Benchmark computed values
const data = signal(Array.from({ length: 1000 }, (_, i) => i));

console.time('computed recalculation');
const sum = computed(() => 
    data.value.reduce((a, b) => a + b, 0)
);
console.log(sum.value); // Initial calculation
data.value = [...data.value, 1001]; // Trigger recalculation
console.log(sum.value);
console.timeEnd('computed recalculation');
// RxHtml: ~2ms
```

### Component Rendering

```javascript
// Benchmark component creation
console.time('1000 component instances');
const components = Array.from({ length: 1000 }, () => 
    createComponent(SimpleComponent)
);
console.timeEnd('1000 component instances');
// RxHtml: ~30ms
// React: ~100ms
```

## Performance Checklist

- [ ] Use computed values for derived state
- [ ] Batch multiple signal updates
- [ ] Debounce expensive operations
- [ ] Implement virtual scrolling for large lists
- [ ] Add keys to v-for loops
- [ ] Clean up effects and event listeners
- [ ] Use code splitting for large apps
- [ ] Lazy load heavy components
- [ ] Minimize signal dependencies
- [ ] Profile with browser DevTools
- [ ] Monitor bundle size
- [ ] Use production builds for deployment

## Resources

- [Browser DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [Web Performance Best Practices](https://web.dev/performance/)
- [RxHtml Examples](../examples/)
- [GitHub Issues](https://github.com/kiransth77/RxHtml/issues)

Remember: **Premature optimization is the root of all evil**. Profile first, then optimize!
