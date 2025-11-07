# Migration Guide: From HTMX to RxHtml

This guide helps HTMX developers understand how RxHtml extends and enhances HTMX with reactive programming.

## Table of Contents

- [Understanding the Relationship](#understanding-the-relationship)
- [Core Differences](#core-differences)
- [When to Use What](#when-to-use-what)
- [Hybrid Approach](#hybrid-approach)
- [Migration Examples](#migration-examples)
- [Best Practices](#best-practices)

## Understanding the Relationship

RxHtml **includes** HTMX and extends it with:

- **Signal-based Reactivity**: Fine-grained reactive updates
- **Component System**: Reusable UI components
- **Client-side Routing**: SPA capabilities
- **State Management**: Centralized application state
- **JavaScript Integration**: Seamless JS/HTML interop

**You don't have to choose** - RxHtml lets you use HTMX and reactive components together!

## Core Differences

| Aspect | HTMX | RxHtml |
|--------|------|---------|
| **Paradigm** | Hypermedia-driven | Reactive + Hypermedia |
| **State** | Server-side | Client-side + Server-side |
| **Updates** | HTML swaps | Signal-driven + HTML swaps |
| **Routing** | Server routes | Client + Server routes |
| **Components** | HTML templates | JavaScript components |
| **Reactivity** | Declarative HTML | Reactive signals |

## When to Use What

### Use HTMX When:
- Simple server-driven interactions
- Progressive enhancement is priority
- Minimal JavaScript desired
- Server renders HTML
- Traditional multi-page apps

### Use RxHtml Components When:
- Complex client-side state
- Real-time updates needed
- Building SPAs
- Rich interactivity required
- Data-intensive UIs

### Use Both When:
- **Best of both worlds!**
- Server renders initial content (HTMX)
- Client manages interactive widgets (RxHtml)
- Progressive enhancement with reactive islands

## Hybrid Approach

### Example: Server-Rendered List with Reactive Filters

**HTML (HTMX for server data):**
```html
<div id="products">
    <!-- HTMX loads initial products from server -->
    <div hx-get="/api/products" 
         hx-trigger="load"
         hx-target="#product-list">
    </div>
    
    <!-- RxHtml component for client-side filtering -->
    <div id="filter-controls"></div>
    
    <div id="product-list"></div>
</div>
```

**JavaScript (RxHtml for interactivity):**
```javascript
import { defineComponent, signal, effect } from 'rxhtmx';

const FilterControls = defineComponent({
    name: 'FilterControls',
    setup() {
        const searchTerm = signal('');
        const category = signal('all');
        
        // React to filter changes and update HTMX target
        effect(() => {
            const url = `/api/products?search=${searchTerm.value}&category=${category.value}`;
            htmx.ajax('GET', url, '#product-list');
        });
        
        return { searchTerm, category };
    },
    template: `
        <div class="filters">
            <input v-model="searchTerm" placeholder="Search..." />
            <select v-model="category">
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
            </select>
        </div>
    `
});
```

## Migration Examples

### Example 1: Simple Button Click

**Pure HTMX:**
```html
<button hx-post="/api/like" 
        hx-target="#like-count"
        hx-swap="innerHTML">
    Like
</button>
<span id="like-count">0</span>
```

**With RxHtml:**
```javascript
import { signal, effect } from 'rxhtmx';

const likes = signal(0);

// Bind signal to DOM
effect(() => {
    document.getElementById('like-count').textContent = likes.value;
});

// Handle click
document.querySelector('button').addEventListener('click', async () => {
    const result = await fetch('/api/like', { method: 'POST' });
    const data = await result.json();
    likes.value = data.count;
});
```

**Or as a Component:**
```javascript
const LikeButton = defineComponent({
    name: 'LikeButton',
    setup() {
        const likes = signal(0);
        
        const handleLike = async () => {
            const result = await fetch('/api/like', { method: 'POST' });
            const data = await result.json();
            likes.value = data.count;
        };
        
        return { likes, handleLike };
    },
    template: `
        <div>
            <button @click="handleLike">Like</button>
            <span>{{likes}} likes</span>
        </div>
    `
});
```

### Example 2: Form Submission

**Pure HTMX:**
```html
<form hx-post="/api/contact" 
      hx-target="#message"
      hx-swap="innerHTML">
    <input name="email" type="email" required />
    <textarea name="message" required></textarea>
    <button type="submit">Send</button>
</form>
<div id="message"></div>
```

**With RxHtml (Client-side Validation):**
```javascript
const ContactForm = defineComponent({
    name: 'ContactForm',
    setup() {
        const email = signal('');
        const message = signal('');
        const errors = signal({});
        const submitting = signal(false);
        const result = signal('');
        
        const validateEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            // Client-side validation
            const newErrors = {};
            if (!validateEmail(email.value)) {
                newErrors.email = 'Invalid email address';
            }
            if (message.value.length < 10) {
                newErrors.message = 'Message too short';
            }
            
            if (Object.keys(newErrors).length > 0) {
                errors.value = newErrors;
                return;
            }
            
            // Submit to server
            submitting.value = true;
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email.value,
                        message: message.value
                    })
                });
                const data = await response.json();
                result.value = data.message;
                
                // Reset form
                email.value = '';
                message.value = '';
                errors.value = {};
            } catch (error) {
                result.value = 'Error sending message';
            } finally {
                submitting.value = false;
            }
        };
        
        return { 
            email, message, errors, submitting, result,
            handleSubmit 
        };
    },
    template: `
        <form @submit="handleSubmit">
            <div>
                <input 
                    v-model="email" 
                    type="email" 
                    placeholder="Email"
                    :class="{ 'error': errors.email }"
                />
                <span v-if="errors.email" class="error-text">
                    {{errors.email}}
                </span>
            </div>
            
            <div>
                <textarea 
                    v-model="message" 
                    placeholder="Message"
                    :class="{ 'error': errors.message }"
                ></textarea>
                <span v-if="errors.message" class="error-text">
                    {{errors.message}}
                </span>
            </div>
            
            <button type="submit" :disabled="submitting">
                {{submitting ? 'Sending...' : 'Send'}}
            </button>
            
            <div v-if="result" class="result">{{result}}</div>
        </form>
    `
});
```

### Example 3: Real-time Updates

**HTMX with Polling:**
```html
<div hx-get="/api/notifications" 
     hx-trigger="every 5s"
     hx-target="#notifications">
</div>
<div id="notifications"></div>
```

**RxHtml with WebSocket:**
```javascript
const NotificationList = defineComponent({
    name: 'NotificationList',
    setup() {
        const notifications = signal([]);
        
        onMounted(() => {
            const ws = new WebSocket('ws://localhost:8080');
            
            ws.onmessage = (event) => {
                const notification = JSON.parse(event.data);
                notifications.value = [notification, ...notifications.value];
            };
            
            return () => ws.close();
        });
        
        return { notifications };
    },
    template: `
        <div class="notifications">
            <div v-for="notif in notifications" :key="notif.id" class="notification">
                <strong>{{notif.title}}</strong>
                <p>{{notif.message}}</p>
                <span class="time">{{notif.timestamp}}</span>
            </div>
            <div v-if="notifications.length === 0">
                No notifications
            </div>
        </div>
    `
});
```

### Example 4: Autocomplete Search

**HTMX:**
```html
<input type="search" 
       hx-get="/api/search" 
       hx-trigger="keyup changed delay:300ms"
       hx-target="#results"
       name="q" />
<div id="results"></div>
```

**RxHtml (with client-side caching):**
```javascript
const SearchAutocomplete = defineComponent({
    name: 'SearchAutocomplete',
    setup() {
        const query = signal('');
        const results = signal([]);
        const loading = signal(false);
        const cache = new Map();
        
        // Debounced search effect
        let debounceTimer;
        effect(() => {
            const q = query.value.trim();
            
            clearTimeout(debounceTimer);
            
            if (q.length < 2) {
                results.value = [];
                return;
            }
            
            // Check cache
            if (cache.has(q)) {
                results.value = cache.get(q);
                return;
            }
            
            debounceTimer = setTimeout(async () => {
                loading.value = true;
                try {
                    const response = await fetch(`/api/search?q=${q}`);
                    const data = await response.json();
                    results.value = data;
                    cache.set(q, data);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    loading.value = false;
                }
            }, 300);
        });
        
        return { query, results, loading };
    },
    template: `
        <div class="search">
            <input 
                v-model="query" 
                type="search" 
                placeholder="Search..."
            />
            <div v-if="loading" class="loading">Searching...</div>
            <div v-if="results.length > 0" class="results">
                <div v-for="result in results" :key="result.id" class="result">
                    {{result.title}}
                </div>
            </div>
        </div>
    `
});
```

## Integrating HTMX Events with Signals

RxHtml provides built-in HTMX integration:

```javascript
import { integrateHtmxWithSignals, effect } from 'rxhtmx';

// Create signal that listens to HTMX events
const htmxSignal = integrateHtmxWithSignals();

// React to HTMX events
effect(() => {
    const event = htmxSignal.value;
    if (event && event.type === 'afterSwap') {
        console.log('HTMX swapped content:', event.detail);
        // Update application state based on HTMX swap
    }
});
```

## Best Practices

### 1. Progressive Enhancement

Start with HTMX for basic functionality, enhance with RxHtml:

```html
<!-- Works without JavaScript -->
<form action="/api/submit" method="POST">
    <input name="data" required />
    <button type="submit">Submit</button>
</form>

<!-- Enhanced with HTMX -->
<form action="/api/submit" method="POST" 
      hx-post="/api/submit"
      hx-target="#result">
    <input name="data" required />
    <button type="submit">Submit</button>
</form>
```

Then add RxHtml for rich interactions:

```javascript
// Add client-side validation
const form = document.querySelector('form');
const dataInput = form.querySelector('input[name="data"]');

const inputValue = signal(dataInput.value);
const isValid = computed(() => inputValue.value.length >= 5);

// Show validation feedback
effect(() => {
    dataInput.classList.toggle('invalid', !isValid.value);
});
```

### 2. Server for Data, Client for UI

- Use HTMX to fetch data from server
- Use RxHtml to manage UI state and interactions
- Keep business logic on server
- Keep presentation logic on client

### 3. Leverage Both Strengths

**HTMX strengths:**
- Server-side rendering
- Simple HTML updates
- Progressive enhancement
- No build step

**RxHtml strengths:**
- Complex client state
- Real-time reactivity
- Component reusability
- Rich interactions

### 4. Communication Between Systems

```javascript
// Listen to HTMX and update RxHtml state
document.body.addEventListener('htmx:afterSwap', (event) => {
    if (event.detail.target.id === 'data-container') {
        // Update RxHtml signal with new data
        mySignal.value = parseDataFromHTML(event.detail.target);
    }
});

// Trigger HTMX from RxHtml
const MyComponent = defineComponent({
    setup() {
        const triggerRefresh = () => {
            htmx.trigger('#data-container', 'refresh');
        };
        
        return { triggerRefresh };
    }
});
```

## Migration Strategy

### Phase 1: Coexistence
1. Keep existing HTMX implementation
2. Add RxHtml for new features
3. Learn RxHtml patterns gradually

### Phase 2: Enhancement
1. Identify areas needing rich interactivity
2. Wrap with RxHtml components
3. Keep HTMX for server communication

### Phase 3: Integration
1. Use RxHtml for client state
2. Use HTMX for server updates
3. Integrate both systems seamlessly

## Conclusion

RxHtml doesn't replace HTMX - it **extends** it. You can:

- Use HTMX alone for simple cases
- Use RxHtml alone for SPAs
- Use both together for hybrid apps
- Migrate gradually without rewriting

**The best approach:** Use the right tool for each part of your application!

## Resources

- [HTMX Documentation](https://htmx.org/docs/)
- [RxHtml Documentation](../README.md)
- [Signal System Guide](./getting-started.md)
- [Examples](../examples/)
