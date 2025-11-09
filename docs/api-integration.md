# API Integration Guide

This guide shows how to integrate RxHtml with various backend APIs and services.

## Table of Contents

- [REST APIs](#rest-apis)
- [GraphQL](#graphql)
- [WebSockets](#websockets)
- [Server-Sent Events](#server-sent-events)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Caching Strategies](#caching-strategies)
- [Real-world Examples](#real-world-examples)

## REST APIs

### Basic Fetch Integration

```javascript
import { signal, computed, effect } from 'rxhtmx';
import { createStore } from 'rxhtmx/state';

// Create a store for API data
const apiStore = createStore({
  state: {
    data: null,
    loading: false,
    error: null
  },
  
  mutations: {
    setData(state, data) {
      state.data = data;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setError(state, error) {
      state.error = error;
    }
  },
  
  actions: {
    async fetchData({ commit }, url) {
      commit('setLoading', true);
      commit('setError', null);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        commit('setData', data);
      } catch (error) {
        commit('setError', error.message);
      } finally {
        commit('setLoading', false);
      }
    }
  }
});
```

### API Service Class

```javascript
class ApiService {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = options.headers || {};
    this.timeout = options.timeout || 10000;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...options.headers
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
  
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Usage
const api = new ApiService('https://api.example.com', {
  headers: {
    'Authorization': 'Bearer ' + getToken()
  }
});

// In component
const UserList = defineComponent({
  name: 'UserList',
  setup() {
    const users = signal([]);
    const loading = signal(false);
    
    onMounted(async () => {
      loading.value = true;
      try {
        users.value = await api.get('/users');
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        loading.value = false;
      }
    });
    
    return { users, loading };
  }
});
```

## GraphQL

### Apollo-like GraphQL Client

```javascript
class GraphQLClient {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.defaultHeaders = options.headers || {};
  }
  
  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders
      },
      body: JSON.stringify({ query, variables })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    return result.data;
  }
  
  async mutate(mutation, variables = {}) {
    return this.query(mutation, variables);
  }
}

// Usage
const graphql = new GraphQLClient('https://api.example.com/graphql', {
  headers: {
    'Authorization': 'Bearer ' + getToken()
  }
});

// In component
const UserProfile = defineComponent({
  name: 'UserProfile',
  props: {
    userId: { type: String, required: true }
  },
  setup(props) {
    const user = signal(null);
    const loading = signal(false);
    
    const fetchUser = async () => {
      loading.value = true;
      try {
        const data = await graphql.query(`
          query GetUser($id: ID!) {
            user(id: $id) {
              id
              name
              email
              avatar
              posts {
                id
                title
                createdAt
              }
            }
          }
        `, { id: props.userId });
        
        user.value = data.user;
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(fetchUser);
    
    return { user, loading };
  }
});
```

### GraphQL with Subscriptions

```javascript
import { signal, effect } from 'rxhtmx';

class GraphQLSubscriptionClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.subscriptions = new Map();
  }
  
  subscribe(query, variables, callback) {
    const ws = new WebSocket(this.wsUrl);
    const id = Math.random().toString(36);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'start',
        id,
        payload: { query, variables }
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'data' && message.id === id) {
        callback(message.payload.data);
      }
    };
    
    this.subscriptions.set(id, ws);
    
    return () => {
      ws.send(JSON.stringify({ type: 'stop', id }));
      ws.close();
      this.subscriptions.delete(id);
    };
  }
}

// Usage
const subscriptionClient = new GraphQLSubscriptionClient('wss://api.example.com/graphql');

const LiveMessages = defineComponent({
  name: 'LiveMessages',
  setup() {
    const messages = signal([]);
    
    onMounted(() => {
      const unsubscribe = subscriptionClient.subscribe(
        `subscription { messageAdded { id text user createdAt } }`,
        {},
        (data) => {
          messages.value = [data.messageAdded, ...messages.value];
        }
      );
      
      return unsubscribe;
    });
    
    return { messages };
  }
});
```

## WebSockets

### WebSocket Integration

```javascript
import { signal, effect } from 'rxhtmx';

class WebSocketService {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const listeners = this.listeners.get(message.type) || [];
      listeners.forEach(callback => callback(message.payload));
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }
  
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
    
    return () => {
      const listeners = this.listeners.get(type);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Usage
const wsService = new WebSocketService('wss://api.example.com/ws');
wsService.connect();

const ChatRoom = defineComponent({
  name: 'ChatRoom',
  setup() {
    const messages = signal([]);
    const newMessage = signal('');
    
    onMounted(() => {
      const unsubscribe = wsService.on('message', (message) => {
        messages.value = [...messages.value, message];
      });
      
      return () => {
        unsubscribe();
      };
    });
    
    const sendMessage = () => {
      if (newMessage.value.trim()) {
        wsService.send('message', {
          text: newMessage.value,
          timestamp: Date.now()
        });
        newMessage.value = '';
      }
    };
    
    return { messages, newMessage, sendMessage };
  }
});
```

## Server-Sent Events

### SSE Integration

```javascript
import { signal, onMounted, onUnmounted } from 'rxhtmx';

const EventStreamComponent = defineComponent({
  name: 'EventStream',
  setup() {
    const events = signal([]);
    const connected = signal(false);
    let eventSource = null;
    
    onMounted(() => {
      eventSource = new EventSource('/api/events');
      
      eventSource.onopen = () => {
        connected.value = true;
      };
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        events.value = [data, ...events.value];
      };
      
      eventSource.onerror = () => {
        connected.value = false;
      };
    });
    
    onUnmounted(() => {
      if (eventSource) {
        eventSource.close();
      }
    });
    
    return { events, connected };
  }
});
```

## Authentication

### JWT Authentication

```javascript
import { signal } from 'rxhtmx';
import { createStore } from 'rxhtmx/state';

const authStore = createStore({
  state: {
    token: localStorage.getItem('token'),
    user: null,
    isAuthenticated: false
  },
  
  mutations: {
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const { token, user } = await response.json();
      commit('setToken', token);
      commit('setUser', user);
    },
    
    async logout({ commit }) {
      commit('setToken', null);
      commit('setUser', null);
    },
    
    async validateToken({ state, commit }) {
      if (!state.token) return false;
      
      try {
        const response = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        });
        
        if (response.ok) {
          const { user } = await response.json();
          commit('setUser', user);
          return true;
        }
      } catch (error) {
        commit('setToken', null);
        commit('setUser', null);
      }
      
      return false;
    }
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user
  }
});

// API interceptor
class AuthenticatedApiService extends ApiService {
  async request(endpoint, options = {}) {
    const token = authStore.state.token;
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    try {
      return await super.request(endpoint, options);
    } catch (error) {
      if (error.message.includes('401')) {
        // Unauthorized - token expired
        await authStore.dispatch('logout');
        // Redirect to login
        router.push('/login');
      }
      throw error;
    }
  }
}
```

## Error Handling

### Global Error Handler

```javascript
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleApiRequest(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    // Network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    
    // Timeout
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please try again.', 0);
    }
    
    // Re-throw as ApiError
    if (!(error instanceof ApiError)) {
      throw new ApiError(error.message, 500);
    }
    
    throw error;
  }
}

// Usage in component
const MyComponent = defineComponent({
  setup() {
    const error = signal(null);
    const loading = signal(false);
    
    const fetchData = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        await handleApiRequest(async () => {
          const data = await api.get('/data');
          // Process data
        });
      } catch (err) {
        if (err instanceof ApiError) {
          error.value = err.message;
        } else {
          error.value = 'An unexpected error occurred';
        }
      } finally {
        loading.value = false;
      }
    };
    
    return { error, loading, fetchData };
  }
});
```

## Caching Strategies

### Simple In-Memory Cache

```javascript
class CachedApiService extends ApiService {
  constructor(baseURL, options = {}) {
    super(baseURL, options);
    this.cache = new Map();
    this.cacheDuration = options.cacheDuration || 5 * 60 * 1000; // 5 minutes
  }
  
  async get(endpoint, params = {}, useCache = true) {
    const cacheKey = `${endpoint}?${JSON.stringify(params)}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheDuration) {
        return data;
      }
    }
    
    const data = await super.get(endpoint, params);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}
```

## Real-world Examples

See the [examples directory](../examples/) for complete implementations:

- [Data Table with API](../examples/data-table/) - Complex data fetching and caching
- [Chat Application](../examples/chat/) - WebSocket real-time communication
- [Search with Autocomplete](../examples/search/) - Debounced API requests

## Resources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [RxHtml Documentation](../README.md)
