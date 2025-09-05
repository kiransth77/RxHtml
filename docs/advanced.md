# Advanced RxHtmx Patterns

## Complex Stream Compositions

### Multi-Step Form Validation

```javascript
import { createStream, bindSignalToDom } from 'rxhtmx';
import { combineLatest, map, startWith } from 'rxjs';

// Create streams for each form field
const nameStream = createStream('#name').pipe(startWith(''));
const emailStream = createStream('#email').pipe(startWith(''));
const passwordStream = createStream('#password').pipe(startWith(''));

// Validation logic
const validationStream = combineLatest([
    nameStream,
    emailStream,
    passwordStream
]).pipe(
    map(([name, email, password]) => ({
        name: name.length >= 2,
        email: email.includes('@') && email.includes('.'),
        password: password.length >= 8,
        isValid: name.length >= 2 && 
                email.includes('@') && 
                email.includes('.') && 
                password.length >= 8
    }))
);

// Bind validation results to UI
bindSignalToDom(validationStream, '#submit-btn', (btn, validation) => {
    btn.disabled = !validation.isValid;
    btn.className = validation.isValid ? 'btn-success' : 'btn-disabled';
});
```

### Real-time Data Synchronization

```javascript
import { integrateHtmxWithSignals } from 'rxhtmx';
import { filter, map, merge } from 'rxjs';

// Listen to HTMX updates
const htmxSignal = integrateHtmxWithSignals();

// Filter for specific content updates
const dataUpdates = htmxSignal.pipe(
    filter(event => event.type === 'afterSwap'),
    filter(event => event.detail.target.id === 'data-container'),
    map(event => event.detail.xhr.response)
);

// Merge with manual refresh signals
const manualRefresh = createStream('#refresh-btn').pipe(
    map(() => 'manual-refresh')
);

const allUpdates = merge(dataUpdates, manualRefresh);

allUpdates.subscribe(update => {
    console.log('Data updated:', update);
    // Trigger additional processing
});
```

## State Management Patterns

### Centralized Application State

```javascript
import { BehaviorSubject, combineLatest } from 'rxjs';
import { bindSignalToDom } from 'rxhtmx';

class AppState {
    constructor() {
        this.user$ = new BehaviorSubject(null);
        this.notifications$ = new BehaviorSubject([]);
        this.loading$ = new BehaviorSubject(false);
        
        // Derived state
        this.isLoggedIn$ = this.user$.pipe(
            map(user => !!user)
        );
        
        this.notificationCount$ = this.notifications$.pipe(
            map(notifications => notifications.length)
        );
    }
    
    setUser(user) {
        this.user$.next(user);
    }
    
    addNotification(notification) {
        const current = this.notifications$.value;
        this.notifications$.next([...current, notification]);
    }
    
    setLoading(loading) {
        this.loading$.next(loading);
    }
}

const appState = new AppState();

// Bind state to UI components
bindSignalToDom(appState.isLoggedIn$, '#login-status', (el, isLoggedIn) => {
    el.textContent = isLoggedIn ? 'Logged In' : 'Please Log In';
});

bindSignalToDom(appState.notificationCount$, '#notification-badge', (el, count) => {
    el.textContent = count;
    el.style.display = count > 0 ? 'block' : 'none';
});
```

## Error Handling Strategies

### Graceful Degradation

```javascript
import { createStream } from 'rxhtmx';
import { catchError, retry, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

const searchStream = createStream('#search-input').pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => 
        fetch(`/api/search?q=${query}`)
            .then(response => response.json())
            .pipe(
                timeout(5000), // 5 second timeout
                retry(2), // Retry failed requests twice
                catchError(error => {
                    console.error('Search failed:', error);
                    return of({ results: [], error: 'Search temporarily unavailable' });
                })
            )
    )
);

bindSignalToDom(searchStream, '#search-results', (el, data) => {
    if (data.error) {
        el.innerHTML = `<div class="error">${data.error}</div>`;
    } else {
        el.innerHTML = data.results.map(result => 
            `<div class="result">${result.title}</div>`
        ).join('');
    }
});
```

## Performance Optimization

### Virtual Scrolling with RxJS

```javascript
import { fromEvent, combineLatest } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

class VirtualList {
    constructor(container, itemHeight = 50) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.data = [];
        
        this.scroll$ = fromEvent(container, 'scroll').pipe(
            map(() => container.scrollTop),
            startWith(0)
        );
        
        this.resize$ = fromEvent(window, 'resize').pipe(
            map(() => container.clientHeight),
            startWith(container.clientHeight)
        );
        
        this.visible$ = combineLatest([this.scroll$, this.resize$]).pipe(
            map(([scrollTop, containerHeight]) => {
                const startIndex = Math.floor(scrollTop / this.itemHeight);
                const endIndex = Math.min(
                    startIndex + Math.ceil(containerHeight / this.itemHeight) + 1,
                    this.data.length
                );
                return { startIndex, endIndex };
            }),
            distinctUntilChanged((prev, curr) => 
                prev.startIndex === curr.startIndex && prev.endIndex === curr.endIndex
            )
        );
        
        this.visible$.subscribe(({ startIndex, endIndex }) => {
            this.renderItems(startIndex, endIndex);
        });
    }
    
    setData(data) {
        this.data = data;
        this.container.style.height = `${data.length * this.itemHeight}px`;
        this.visible$.pipe(take(1)).subscribe(range => {
            this.renderItems(range.startIndex, range.endIndex);
        });
    }
    
    renderItems(start, end) {
        const items = this.data.slice(start, end).map((item, index) => 
            `<div class="item" style="position: absolute; top: ${(start + index) * this.itemHeight}px; height: ${this.itemHeight}px;">
                ${item.content}
            </div>`
        ).join('');
        
        this.container.innerHTML = items;
    }
}
```

## Testing Patterns

### Integration Testing

```javascript
// test-utils.js
import { JSDOM } from 'jsdom';

export function setupTestEnvironment() {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="test-container"></div>
        </body>
        </html>
    `);
    
    global.document = dom.window.document;
    global.window = dom.window;
    global.HTMLElement = dom.window.HTMLElement;
    global.Event = dom.window.Event;
    global.CustomEvent = dom.window.CustomEvent;
    
    return dom;
}

export function createTestElement(html) {
    const container = document.getElementById('test-container');
    container.innerHTML = html;
    return container.firstElementChild;
}

// usage in tests
import { setupTestEnvironment, createTestElement } from './test-utils.js';
import { createStream } from 'rxhtmx';

describe('Form Integration', () => {
    beforeEach(() => {
        setupTestEnvironment();
    });
    
    test('should validate form inputs', () => {
        const input = createTestElement('<input id="email" type="email">');
        const stream = createStream('#email');
        
        const values = [];
        stream.subscribe(value => values.push(value));
        
        input.value = 'test@example.com';
        input.dispatchEvent(new Event('input'));
        
        expect(values).toContain('test@example.com');
    });
});
```

## Deployment Considerations

### Bundle Optimization

```javascript
// webpack.config.js
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                rxjs: {
                    test: /[\\/]node_modules[\\/]rxjs[\\/]/,
                    name: 'rxjs',
                    priority: 10,
                },
                htmx: {
                    test: /[\\/]node_modules[\\/]htmx.org[\\/]/,
                    name: 'htmx',
                    priority: 10,
                }
            }
        }
    }
};
```

### Progressive Enhancement

```javascript
// Graceful degradation for older browsers
if (typeof window !== 'undefined' && window.fetch && window.Promise) {
    import('rxhtmx').then(({ createStream, integrateHtmxWithSignals }) => {
        // Initialize reactive features
        initializeReactiveFeatures();
    });
} else {
    // Fallback to traditional event handling
    initializeFallbackFeatures();
}
```

This advanced guide covers complex patterns and real-world scenarios you might encounter when building applications with RxHtmx.
