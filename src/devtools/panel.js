/**
 * RxHtmx DevTools Panel
 * Minimal in-app developer tools for inspecting signals, components, and state
 */

import { isSignal } from '../core/signal.js';

class DevToolsPanel {
  constructor() {
    this.enabled = false;
    this.panel = null;
    this.signals = new Map();
    this.components = new Map();
    this.selectedSignal = null;
  }

  /**
   * Initialize and show the DevTools panel
   */
  init() {
    if (this.enabled || typeof document === 'undefined') return;

    this.enabled = true;
    this.createPanel();
    this.attachKeyboardShortcut();
  }

  /**
   * Create the panel DOM structure
   */
  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = '__rxhtmx_devtools';
    this.panel.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 400px;
      height: 300px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      border: 1px solid #3c3c3c;
      border-radius: 4px 0 0 0;
      box-shadow: -2px -2px 10px rgba(0,0,0,0.3);
      z-index: 999999;
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: #007acc;
      color: white;
      padding: 8px 12px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>🛠️ RxHtmx DevTools</span>
      <button id="__rxhtmx_devtools_close" style="background:none;border:none;color:white;cursor:pointer;font-size:18px;">×</button>
    `;

    const tabs = document.createElement('div');
    tabs.style.cssText = `
      display: flex;
      background: #252526;
      border-bottom: 1px solid #3c3c3c;
    `;
    tabs.innerHTML = `
      <button class="devtools-tab active" data-tab="signals" style="flex:1;padding:8px;background:#1e1e1e;border:none;color:#d4d4d4;cursor:pointer;">Signals</button>
      <button class="devtools-tab" data-tab="components" style="flex:1;padding:8px;background:#252526;border:none;color:#d4d4d4;cursor:pointer;">Components</button>
      <button class="devtools-tab" data-tab="performance" style="flex:1;padding:8px;background:#252526;border:none;color:#d4d4d4;cursor:pointer;">Performance</button>
    `;

    const content = document.createElement('div');
    content.id = '__rxhtmx_devtools_content';
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    `;

    this.panel.appendChild(header);
    this.panel.appendChild(tabs);
    this.panel.appendChild(content);
    document.body.appendChild(this.panel);

    // Event listeners
    header
      .querySelector('#__rxhtmx_devtools_close')
      .addEventListener('click', () => this.hide());
    tabs.querySelectorAll('.devtools-tab').forEach(tab => {
      tab.addEventListener('click', e => {
        tabs.querySelectorAll('.devtools-tab').forEach(t => {
          t.style.background = '#252526';
          t.classList.remove('active');
        });
        e.target.style.background = '#1e1e1e';
        e.target.classList.add('active');
        this.renderTab(e.target.dataset.tab);
      });
    });

    this.renderTab('signals');
  }

  /**
   * Attach keyboard shortcut (Ctrl+Shift+D)
   */
  attachKeyboardShortcut() {
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Register a signal for inspection
   * @param {string} name - Signal name
   * @param {Signal} signal - Signal instance
   */
  registerSignal(name, signal) {
    if (!isSignal(signal)) return;
    this.signals.set(name, signal);
  }

  /**
   * Register a component for inspection
   * @param {string} id - Component ID
   * @param {object} component - Component instance
   */
  registerComponent(id, component) {
    this.components.set(id, component);
  }

  /**
   * Render a specific tab
   * @param {string} tab - Tab name
   */
  renderTab(tab) {
    const content = document.getElementById('__rxhtmx_devtools_content');
    if (!content) return;

    switch (tab) {
      case 'signals':
        this.renderSignals(content);
        break;
      case 'components':
        this.renderComponents(content);
        break;
      case 'performance':
        this.renderPerformance(content);
        break;
    }
  }

  /**
   * Render signals tab
   */
  renderSignals(container) {
    if (this.signals.size === 0) {
      container.innerHTML =
        '<div style="color:#808080;text-align:center;padding:20px;">No signals registered</div>';
      return;
    }

    let html = '<div style="display:flex;flex-direction:column;gap:8px;">';

    for (const [name, signal] of this.signals.entries()) {
      const value =
        typeof signal.value === 'object'
          ? JSON.stringify(signal.value, null, 2)
          : String(signal.value);

      html += `
        <div style="background:#252526;padding:8px;border-radius:4px;border-left:3px solid #007acc;">
          <div style="color:#4ec9b0;font-weight:bold;margin-bottom:4px;">${name}</div>
          <div style="color:#ce9178;font-family:monospace;font-size:11px;white-space:pre-wrap;">${this.escapeHtml(value)}</div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Render components tab
   */
  renderComponents(container) {
    if (this.components.size === 0) {
      container.innerHTML =
        '<div style="color:#808080;text-align:center;padding:20px;">No components registered</div>';
      return;
    }

    let html = '<div style="display:flex;flex-direction:column;gap:8px;">';

    for (const [id, component] of this.components.entries()) {
      const props = component.props
        ? Object.keys(component.props).join(', ')
        : 'none';

      html += `
        <div style="background:#252526;padding:8px;border-radius:4px;border-left:3px solid #4ec9b0;">
          <div style="color:#4ec9b0;font-weight:bold;margin-bottom:4px;">${id}</div>
          <div style="color:#808080;font-size:10px;">Props: ${this.escapeHtml(props)}</div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Render performance tab
   */
  renderPerformance(container) {
    container.innerHTML = `
      <div style="color:#808080;text-align:center;padding:20px;">
        Performance metrics available via <code style="color:#ce9178;">window.__RXHTMX_PERF__</code>
        <br><br>
        Enable with: <code style="color:#ce9178;">perf.enable()</code>
      </div>
    `;
  }

  /**
   * Escape HTML for display
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Show the panel
   */
  show() {
    if (this.panel) {
      this.panel.style.display = 'flex';
      this.renderTab('signals');
    }
  }

  /**
   * Hide the panel
   */
  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (!this.panel) {
      this.init();
      this.show();
    } else {
      this.panel.style.display === 'none' ? this.show() : this.hide();
    }
  }
}

// Global singleton
export const devtools = new DevToolsPanel();

// Auto-initialize in dev mode
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.__RXHTMX_DEVTOOLS__ = devtools;
}

export default devtools;
