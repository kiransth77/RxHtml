/**
 * Enhanced Error Overlay with Filtering
 * Extends the base error overlay with advanced features
 */

class EnhancedErrorOverlay {
  constructor() {
    this.errors = [];
    this.filters = {
      level: 'all', // 'all', 'error', 'warning'
      source: 'all', // 'all', 'runtime', 'network', 'component'
      search: '',
    };
    this.maxErrors = 50;
    this.overlay = null;
  }

  /**
   * Initialize the enhanced error overlay
   */
  init() {
    if (typeof window === 'undefined') return;

    this.setupErrorHandlers();
    this.createOverlay();

    // Expose globally for debugging
    window.__RXHTMX_ERROR_OVERLAY__ = this;
  }

  /**
   * Setup comprehensive error handlers
   */
  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', e => {
      this.addError({
        level: 'error',
        source: 'runtime',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
        timestamp: Date.now(),
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', e => {
      this.addError({
        level: 'error',
        source: 'runtime',
        message: `Unhandled Promise Rejection: ${e.reason}`,
        stack: e.reason?.stack,
        timestamp: Date.now(),
      });
    });

    // Console errors/warnings
    this.interceptConsole();
  }

  /**
   * Intercept console methods
   */
  interceptConsole() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      this.addError({
        level: 'error',
        source: 'console',
        message: args.join(' '),
        timestamp: Date.now(),
      });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.addError({
        level: 'warning',
        source: 'console',
        message: args.join(' '),
        timestamp: Date.now(),
      });
      originalWarn.apply(console, args);
    };
  }

  /**
   * Add error to the list
   */
  addError(error) {
    this.errors.unshift(error);

    // Limit number of errors
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    this.render();
  }

  /**
   * Create overlay DOM structure
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = '__rxhtmx_enhanced_error_overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      max-height: 50vh;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      z-index: 999998;
      display: none;
      flex-direction: column;
      border-bottom: 3px solid #f44336;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    document.body.appendChild(this.overlay);
  }

  /**
   * Render the overlay
   */
  render() {
    if (!this.overlay) return;

    const filteredErrors = this.getFilteredErrors();

    if (filteredErrors.length === 0) {
      this.hide();
      return;
    }

    this.show();

    const header = this.renderHeader();
    const filters = this.renderFilters();
    const errorList = this.renderErrorList(filteredErrors);

    this.overlay.innerHTML = '';
    this.overlay.appendChild(header);
    this.overlay.appendChild(filters);
    this.overlay.appendChild(errorList);

    this.attachEventListeners();
  }

  /**
   * Render header
   */
  renderHeader() {
    const header = document.createElement('div');
    header.style.cssText = `
      background: #f44336;
      color: white;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    `;

    header.innerHTML = `
      <span>⚠️ RxHtmx Error Overlay (${this.errors.length} errors)</span>
      <div>
        <button id="__clear_errors" style="background:#c62828;border:none;color:white;padding:4px 8px;margin-right:8px;cursor:pointer;border-radius:3px;">Clear</button>
        <button id="__close_overlay" style="background:none;border:none;color:white;cursor:pointer;font-size:18px;">×</button>
      </div>
    `;

    return header;
  }

  /**
   * Render filter controls
   */
  renderFilters() {
    const filters = document.createElement('div');
    filters.style.cssText = `
      background: #252526;
      padding: 8px 12px;
      display: flex;
      gap: 12px;
      align-items: center;
      border-bottom: 1px solid #3c3c3c;
    `;

    filters.innerHTML = `
      <label style="color:#808080;font-size:11px;">
        Level:
        <select id="__error_level_filter" style="background:#1e1e1e;color:#d4d4d4;border:1px solid #3c3c3c;padding:4px;margin-left:4px;">
          <option value="all">All</option>
          <option value="error">Errors</option>
          <option value="warning">Warnings</option>
        </select>
      </label>
      <label style="color:#808080;font-size:11px;">
        Source:
        <select id="__error_source_filter" style="background:#1e1e1e;color:#d4d4d4;border:1px solid #3c3c3c;padding:4px;margin-left:4px;">
          <option value="all">All</option>
          <option value="runtime">Runtime</option>
          <option value="console">Console</option>
          <option value="network">Network</option>
          <option value="component">Component</option>
        </select>
      </label>
      <input
        type="text"
        id="__error_search"
        placeholder="Search errors..."
        style="flex:1;background:#1e1e1e;color:#d4d4d4;border:1px solid #3c3c3c;padding:4px 8px;font-family:inherit;"
      />
    `;

    return filters;
  }

  /**
   * Render error list
   */
  renderErrorList(errors) {
    const list = document.createElement('div');
    list.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      max-height: calc(50vh - 120px);
    `;

    if (errors.length === 0) {
      list.innerHTML =
        '<div style="color:#808080;text-align:center;padding:20px;">No errors match the current filters</div>';
      return list;
    }

    errors.forEach((error, index) => {
      const errorEl = this.renderError(error, index);
      list.appendChild(errorEl);
    });

    return list;
  }

  /**
   * Render individual error
   */
  renderError(error, index) {
    const el = document.createElement('div');
    el.style.cssText = `
      background: #252526;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 4px;
      border-left: 3px solid ${error.level === 'error' ? '#f44336' : '#ff9800'};
    `;

    const time = new Date(error.timestamp).toLocaleTimeString();
    const levelColor = error.level === 'error' ? '#f44336' : '#ff9800';
    const sourceColor = '#4ec9b0';

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:11px;">
        <div>
          <span style="color:${levelColor};font-weight:bold;">[${error.level.toUpperCase()}]</span>
          <span style="color:${sourceColor};margin-left:8px;">${error.source}</span>
          <span style="color:#808080;margin-left:8px;">${time}</span>
        </div>
        <button class="__expand_error" data-index="${index}" style="background:none;border:none;color:#808080;cursor:pointer;">▼</button>
      </div>
      <div style="color:#ce9178;margin-bottom:8px;">${this.escapeHtml(error.message)}</div>
      ${error.filename ? `<div style="color:#808080;font-size:11px;">@ ${error.filename}:${error.lineno}:${error.colno}</div>` : ''}
      <div class="__error_stack" data-index="${index}" style="display:none;margin-top:8px;padding:8px;background:#1e1e1e;border-radius:3px;color:#808080;font-size:10px;max-height:200px;overflow-y:auto;">
        ${error.stack ? `<pre style="margin:0;white-space:pre-wrap;">${this.escapeHtml(error.stack)}</pre>` : 'No stack trace available'}
      </div>
    `;

    return el;
  }

  /**
   * Get filtered errors
   */
  getFilteredErrors() {
    return this.errors.filter(error => {
      // Level filter
      if (this.filters.level !== 'all' && error.level !== this.filters.level) {
        return false;
      }

      // Source filter
      if (
        this.filters.source !== 'all' &&
        error.source !== this.filters.source
      ) {
        return false;
      }

      // Search filter
      if (
        this.filters.search &&
        !error.message.toLowerCase().includes(this.filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = document.getElementById('__close_overlay');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Clear button
    const clearBtn = document.getElementById('__clear_errors');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }

    // Level filter
    const levelFilter = document.getElementById('__error_level_filter');
    if (levelFilter) {
      levelFilter.value = this.filters.level;
      levelFilter.addEventListener('change', e => {
        this.filters.level = e.target.value;
        this.render();
      });
    }

    // Source filter
    const sourceFilter = document.getElementById('__error_source_filter');
    if (sourceFilter) {
      sourceFilter.value = this.filters.source;
      sourceFilter.addEventListener('change', e => {
        this.filters.source = e.target.value;
        this.render();
      });
    }

    // Search filter
    const searchInput = document.getElementById('__error_search');
    if (searchInput) {
      searchInput.value = this.filters.search;
      searchInput.addEventListener('input', e => {
        this.filters.search = e.target.value;
        this.render();
      });
    }

    // Expand/collapse stack traces
    document.querySelectorAll('.__expand_error').forEach(btn => {
      btn.addEventListener('click', e => {
        const index = e.target.dataset.index;
        const stack = document.querySelector(
          `.__error_stack[data-index="${index}"]`
        );
        if (stack) {
          stack.style.display =
            stack.style.display === 'none' ? 'block' : 'none';
          e.target.textContent = stack.style.display === 'none' ? '▼' : '▲';
        }
      });
    });
  }

  /**
   * Clear all errors
   */
  clear() {
    this.errors = [];
    this.hide();
  }

  /**
   * Show overlay
   */
  show() {
    if (this.overlay) {
      this.overlay.style.display = 'flex';
    }
  }

  /**
   * Hide overlay
   */
  hide() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Auto-initialize in dev mode
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  const enhancedOverlay = new EnhancedErrorOverlay();
  enhancedOverlay.init();
}

export default EnhancedErrorOverlay;
