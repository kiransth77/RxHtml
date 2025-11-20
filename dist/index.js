Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let t = null,
  e = null;
function n(t) {
  e = t;
}
function o(e) {
  let n = e;
  const o = new Set(),
    r = {
      get value() {
        return (t && (o.add(t), t.deps.add(r)), n);
      },
      set value(t) {
        if (n !== t) {
          n = t;
          Array.from(o).forEach(t => {
            t && 'function' === typeof t.run
              ? t.run()
              : 'function' === typeof t && t(n);
          });
        }
      },
      subscribe: t => (o.add(t), t(n), () => o.delete(t)),
      _addSubscriber(t) {
        o.add(t);
      },
      _removeSubscriber(t) {
        o.delete(t);
      },
    };
  return r;
}
function r(e) {
  let n,
    o = !0,
    r = !1;
  const s = new Set(),
    i = new Set(),
    a = {
      get value() {
        if (r)
          return (
            console.warn('Computed recursion detected, returning cached value'),
            n
          );
        if (o) {
          r = !0;
          try {
            (s.forEach(t => {
              t._removeSubscriber(a);
            }),
              s.clear());
            const r = t;
            t = {
              deps: s,
              run: () => {
                o = !0;
                Array.from(i).forEach(t => {
                  t && 'function' === typeof t.run
                    ? t.run()
                    : 'function' === typeof t && t(a.value);
                });
              },
            };
            try {
              ((n = e()),
                (o = !1),
                s.forEach(e => {
                  e._addSubscriber(t);
                }));
            } finally {
              t = r;
            }
          } finally {
            r = !1;
          }
        }
        return (t && (i.add(t), t.deps.add(a)), n);
      },
      _addSubscriber(t) {
        i.add(t);
      },
      _removeSubscriber(t) {
        i.delete(t);
      },
    };
  return a;
}
function s(n, o = {}) {
  const { immediate: r = !0 } = o,
    s = new Set();
  let i = !0;
  const a = {
    run() {
      if (!i) return;
      (s.forEach(t => t._removeSubscriber(a)), s.clear());
      const e = t;
      ((t = a), (a.deps = s));
      try {
        return n();
      } finally {
        t = e;
      }
    },
    stop() {
      ((i = !1), s.forEach(t => t._removeSubscriber(a)), s.clear());
    },
    deps: s,
  };
  return (e && e.effects.push(a), r && a.run(), a);
}
const i = new Set();
let a = !1;
function u(t) {
  return (
    t &&
    'object' === typeof t &&
    'value' in t &&
    ('subscribe' in t || '_addSubscriber' in t)
  );
}
class c {
  constructor(t, e = {}, n = []) {
    ((this.tag = t),
      (this.props = e),
      (this.children = Array.isArray(n) ? n : [n]),
      (this.element = null),
      (this.key = e.key || null));
  }
}
function l(t, e = {}, ...n) {
  return new c(t, e, n.flat());
}
function h(t, e) {
  if ('string' === typeof t || 'number' === typeof t) {
    const n = document.createTextNode(t);
    return (e.appendChild(n), n);
  }
  if ('#text' === t.tag) {
    const n = document.createTextNode(t.children[0] || '');
    return ((t.element = n), e.appendChild(n), n);
  }
  if ('#fragment' === t.tag) {
    const n = document.createDocumentFragment();
    return (
      t.children.forEach(t => h(t, n)),
      (t.element = n),
      e.appendChild(n),
      n
    );
  }
  const n = document.createElement(t.tag);
  return (
    (t.element = n),
    (function (t, e) {
      for (const n in e) f(t, n, e[n]);
    })(n, t.props),
    t.children &&
      Array.isArray(t.children) &&
      t.children.forEach(t => {
        t && h(t, n);
      }),
    e.appendChild(n),
    n
  );
}
function d(t, e, n) {
  if (t.tag !== e.tag) {
    const o = h(e, n);
    return void n.replaceChild(o, t.element);
  }
  ((e.element = t.element),
    '#text' !== e.tag
      ? ((function (t, e, n) {
          for (const o in e) o in n || p(t, o, e[o]);
          for (const o in n) {
            const r = e[o],
              s = n[o];
            r !== s && f(t, o, s, r);
          }
        })(t.element, t.props, e.props),
        (function (t, e) {
          const n = t.children,
            o = e.children,
            r = Math.min(n.length, o.length);
          for (let s = 0; s < r; s++) d(n[s], o[s], t.element);
          for (let s = r; s < n.length; s++)
            t.element.removeChild(n[s].element);
          for (let s = r; s < o.length; s++) h(o[s], t.element);
        })(t, e))
      : t.children[0] !== e.children[0] &&
        (t.element.textContent = e.children[0] || ''));
}
function f(t, e, n, o) {
  if ('key' !== e && 'ref' !== e)
    if (e.startsWith('on') && 'function' === typeof n) {
      const r = e.slice(2).toLowerCase();
      (o && t.removeEventListener(r, o), t.addEventListener(r, n));
    } else if ('style' === e && 'object' === typeof n)
      for (const r in n) t.style[r] = n[r];
    else
      'class' === e || 'className' === e
        ? (t.className = n)
        : e in t
          ? (t[e] = n)
          : t.setAttribute(e, n);
}
function p(t, e, n) {
  if (e.startsWith('on') && 'function' === typeof n) {
    const o = e.slice(2).toLowerCase();
    t.removeEventListener(o, n);
  } else
    'style' === e
      ? (t.style.cssText = '')
      : 'class' === e || 'className' === e
        ? (t.className = '')
        : e in t
          ? (t[e] = '')
          : t.removeAttribute(e);
}
const m = new Map();
function y(t, e, n) {
  return t.animate(e, n);
}
const g = new Map();
let b = null;
class x {
  constructor(t, e = {}, n = null) {
    ((this.definition = t),
      (this.props = this.processProps(e)),
      (this.parent = n),
      (this.children = []),
      (this.element = null),
      (this.isMounted = !1),
      (this.isUnmounted = !1),
      (this.effects = []),
      (this.setupResult = null),
      (this.renderFn = null),
      (this.hooks = {
        beforeMount: [],
        mounted: [],
        beforeUpdate: [],
        updated: [],
        beforeUnmount: [],
        unmounted: [],
      }),
      this.setup());
  }
  processProps(t) {
    const { props: e = {} } = this.definition,
      n = {};
    for (const [o, r] of Object.entries(e)) {
      const { type: e, default: s, required: i = !1, validator: a } = r,
        u = t[o];
      void 0 === u
        ? (i && console.warn(`Required prop '${o}' is missing`),
          (n[o] = 'function' === typeof s ? s() : s))
        : (e &&
            !this.validateType(u, e) &&
            console.warn(`Prop '${o}' expected ${e.name}, got ${typeof u}`),
          a && !a(u) && console.warn(`Prop '${o}' validation failed`),
          (n[o] = u));
    }
    return n;
  }
  validateType(t, e) {
    return e === String
      ? 'string' === typeof t
      : e === Number
        ? 'number' === typeof t
        : e === Boolean
          ? 'boolean' === typeof t
          : e === Array
            ? Array.isArray(t)
            : e === Object
              ? 'object' === typeof t && null !== t
              : e === Function
                ? 'function' === typeof t
                : t instanceof e;
  }
  setup() {
    const t = b;
    ((b = this), n(this));
    try {
      (this.definition.setup &&
        (this.setupResult = this.definition.setup(this.props, {
          emit: this.emit.bind(this),
          slots: this.slots || {},
          expose: this.expose.bind(this),
        })),
        this.definition.template
          ? (this.renderFn = this.compileTemplate(this.definition.template))
          : this.definition.render && (this.renderFn = this.definition.render));
    } finally {
      (n(t), (b = t));
    }
  }
  compileTemplate(t) {
    return () => {
      let e = t;
      e = e.replace(/\{\{([^}]+)\}\}/g, (t, e) => {
        try {
          const t = this.evaluateExpression(e.trim());
          return String(t);
        } catch (n) {
          return (console.warn(`Error evaluating expression: ${e}`, n), t);
        }
      });
      const n = document.createElement('div');
      n.innerHTML = e;
      const o = n.firstElementChild;
      return (this.bindEventDirectives(o), o);
    };
  }
  bindEventDirectives(t) {
    [t, ...t.querySelectorAll('*')].forEach(t => {
      Array.from(t.attributes || []).forEach(e => {
        if (e.name.startsWith('@')) {
          const n = e.name.slice(1),
            o = e.value,
            r = { ...this.setupResult, ...this.props };
          if (o.includes('(') && o.includes(')')) {
            const e = o.split('(')[0],
              s = o.slice(e.length + 1, -1);
            r[e] &&
              'function' === typeof r[e] &&
              t.addEventListener(n, t => {
                try {
                  const t = s
                    ? s
                        .split(',')
                        .map(t =>
                          ((t = t.trim()).startsWith('"') && t.endsWith('"')) ||
                          (t.startsWith("'") && t.endsWith("'"))
                            ? t.slice(1, -1)
                            : isNaN(t)
                              ? r[t]
                              : Number(t)
                        )
                    : [];
                  r[e](...t);
                } catch (n) {
                  console.error('Error executing event handler:', n);
                }
              });
          } else
            r[o] && 'function' === typeof r[o] && t.addEventListener(n, r[o]);
          t.removeAttribute(e.name);
        }
      });
    });
  }
  evaluateExpression(t) {
    const e = { ...this.setupResult, ...this.props };
    try {
      const n = t.split('.');
      let o = e;
      for (let e = 0; e < n.length; e++) {
        const r = n[e];
        if (!o || 'object' !== typeof o || !(r in o)) return t;
        ((o = o[r]), u(o) && e < n.length - 1 && (o = o.value));
      }
      if (u(o)) {
        return o.value;
      }
      return o;
    } catch (n) {
      if (t.includes('(') && t.includes(')')) {
        const n = t.split('(')[0];
        if (e[n] && 'function' === typeof e[n]) return e[n]();
      }
      return t;
    }
  }
  mount(t) {
    if (!this.isMounted) {
      if ((this.runHooks('beforeMount'), this.renderFn)) {
        let e = !0;
        const n = s(() => {
          const n = this.renderFn();
          e
            ? ((this.element = n), t.appendChild(n), (e = !1))
            : this.element &&
              this.element.parentNode &&
              this.updateElement(this.element, n);
        });
        this.effects.push(n);
      }
      ((this.isMounted = !0), this.runHooks('mounted'));
    }
  }
  updateElement(t, e) {
    if (t.tagName !== e.tagName)
      return (t.parentNode.replaceChild(e, t), void (this.element = e));
    (t.textContent !== e.textContent &&
      (0 === t.children.length && 0 === e.children.length
        ? (t.textContent = e.textContent)
        : this.updateChildren(t, e)),
      Array.from(e.attributes || []).forEach(e => {
        t.getAttribute(e.name) !== e.value && t.setAttribute(e.name, e.value);
      }));
  }
  updateChildren(t, e) {
    const n = Array.from(t.children),
      o = Array.from(e.children);
    for (let r = 0; r < Math.max(n.length, o.length); r++)
      r < n.length &&
        r < o.length &&
        n[r].tagName === o[r].tagName &&
        (0 === n[r].children.length
          ? (n[r].textContent = o[r].textContent)
          : this.updateChildren(n[r], o[r]));
  }
  unmount() {
    this.isUnmounted ||
      (this.runHooks('beforeUnmount'),
      this.effects.forEach(t => t.stop()),
      (this.effects.length = 0),
      this.element &&
        this.element.parentNode &&
        this.element.parentNode.removeChild(this.element),
      (this.isUnmounted = !0),
      this.runHooks('unmounted'));
  }
  runHooks(t) {
    this.hooks[t].forEach(t => t.call(this));
  }
  emit(t, e) {
    this.parent && this.parent.handleEvent && this.parent.handleEvent(t, e);
  }
  expose(t) {
    this.exposedAPI = t;
  }
}
function w(t, e = {}, n = null) {
  return new x(t, e, n);
}
function v(t, e) {
  if (('string' === typeof e && (e = document.querySelector(e)), !e))
    throw new Error('Mount container not found');
  return (t.mount(e), t);
}
const E = new Map();
function S(t, e) {
  E.set(t, e);
}
(S('if', {
  mounted(t, e) {
    e.value || (t.style.display = 'none');
  },
  updated(t, e) {
    t.style.display = e.value ? '' : 'none';
  },
}),
  S('show', {
    mounted(t, e) {
      t.style.display = e.value ? '' : 'none';
    },
    updated(t, e) {
      t.style.display = e.value ? '' : 'none';
    },
  }));
class _ {
  constructor(t = {}) {
    ((this.routes = t.routes || []),
      (this.mode = t.mode || 'history'),
      (this.base = t.base || '/'),
      (this.guards = t.guards || {}),
      (this.currentRoute = o(null)),
      (this.isReady = o(!1)),
      (this.currentComponent = null),
      (this.container = null),
      (this.beforeEachHooks = []),
      (this.afterEachHooks = []),
      this.init());
  }
  init() {
    ('history' === this.mode
      ? window.addEventListener('popstate', this.handlePopState.bind(this))
      : window.addEventListener('hashchange', this.handleHashChange.bind(this)),
      this.handleRoute(this.getCurrentPath()),
      (this.isReady.value = !0));
  }
  getCurrentPath() {
    return 'history' === this.mode
      ? window.location.pathname + window.location.search
      : window.location.hash.slice(1) || '/';
  }
  handlePopState() {
    this.handleRoute(this.getCurrentPath());
  }
  handleHashChange() {
    this.handleRoute(this.getCurrentPath());
  }
  async handleRoute(t) {
    const e = this.matchRoute(t);
    if (!e) return void console.warn(`No route found for path: ${t}`);
    if (!(await this.runBeforeGuards(e, this.currentRoute.value))) return;
    const n = this.currentRoute.value;
    ((this.currentRoute.value = e),
      e.path,
      e.component && this.container && this.mountRouteComponent(e),
      this.runAfterHooks(e, n));
  }
  matchRoute(t) {
    for (const e of this.routes) {
      const n = this.matchPath(t, e.path);
      if (n)
        return {
          ...e,
          path: t,
          params: n.params,
          query: this.parseQuery(t),
          fullPath: t,
        };
    }
    return null;
  }
  matchPath(t, e) {
    const n = t.split('?')[0],
      o = e.replace(/:([^/]+)/g, '([^/]+)'),
      r = new RegExp(`^${o}$`),
      s = n.match(r);
    if (!s) return null;
    const i = {},
      a = e.match(/:([^/]+)/g);
    return (
      a &&
        a.forEach((t, e) => {
          const n = t.slice(1);
          i[n] = s[e + 1];
        }),
      { params: i }
    );
  }
  parseQuery(t) {
    const e = t.split('?')[1];
    if (!e) return {};
    const n = {};
    return (
      e.split('&').forEach(t => {
        const [e, o] = t.split('=');
        n[decodeURIComponent(e)] = decodeURIComponent(o || '');
      }),
      n
    );
  }
  async runBeforeGuards(t, e) {
    for (const n of this.beforeEachHooks) {
      if (!1 === (await n(t, e))) return !1;
    }
    if (t.beforeEnter) {
      const n = Array.isArray(t.beforeEnter) ? t.beforeEnter : [t.beforeEnter];
      for (const o of n) {
        if (!1 === (await o(t, e))) return !1;
      }
    }
    return !0;
  }
  runAfterHooks(t, e) {
    this.afterEachHooks.forEach(n => {
      try {
        n(t, e);
      } catch (o) {
        console.error('Error in after hook:', o);
      }
    });
  }
  mountRouteComponent(t) {
    (this.currentComponent && this.currentComponent.unmount(),
      t.component &&
        ((this.currentComponent = w(t.component, { route: t, router: this })),
        v(this.currentComponent, this.container)));
  }
  push(t) {
    'history' === this.mode
      ? (window.history.pushState(null, '', t), this.handleRoute(t))
      : (window.location.hash = t);
  }
  replace(t) {
    'history' === this.mode
      ? (window.history.replaceState(null, '', t), this.handleRoute(t))
      : window.location.replace(`#${t}`);
  }
  go(t) {
    window.history.go(t);
  }
  back() {
    window.history.back();
  }
  forward() {
    window.history.forward();
  }
  beforeEach(t) {
    return (
      this.beforeEachHooks.push(t),
      () => {
        const e = this.beforeEachHooks.indexOf(t);
        e > -1 && this.beforeEachHooks.splice(e, 1);
      }
    );
  }
  afterEach(t) {
    return (
      this.afterEachHooks.push(t),
      () => {
        const e = this.afterEachHooks.indexOf(t);
        e > -1 && this.afterEachHooks.splice(e, 1);
      }
    );
  }
  mount(t) {
    ('string' === typeof t && (t = document.querySelector(t)),
      (this.container = t),
      this.currentRoute.value &&
        this.mountRouteComponent(this.currentRoute.value));
  }
}
const C = {
    name: 'RouterLink',
    props: {
      to: { type: String, required: !0 },
      replace: { type: Boolean, default: !1 },
      tag: { type: String, default: 'a' },
    },
    setup(t, { slots: e }) {
      const n = H(),
        o = e => {
          (e.preventDefault(), t.replace ? n.replace(t.to) : n.push(t.to));
        };
      return () => l(t.tag, { href: t.to, onClick: o }, e.default?.());
    },
  },
  R = {
    name: 'RouterView',
    setup() {
      const t = H();
      return () => {
        const e = t.currentRoute.value;
        return e && e.component
          ? l(e.component, { route: e, router: t })
          : null;
      };
    },
  };
let k = null;
function H() {
  return k;
}
class A {
  constructor(t = {}) {
    ((this._state = {}),
      (this.getters = {}),
      (this.actions = {}),
      (this.mutations = {}),
      (this.middleware = t.middleware || []),
      (this.strict = !1 !== t.strict),
      t.state && this.initState(t.state),
      t.getters && this.initGetters(t.getters),
      t.actions && (this.actions = { ...t.actions }),
      t.mutations && (this.mutations = { ...t.mutations }),
      (this.state = this.createStateProxy()),
      this.applyMiddleware());
  }
  initState(t) {
    for (const [e, n] of Object.entries(t)) this._state[e] = o(n);
  }
  createStateProxy() {
    return new Proxy(
      {},
      {
        get: (t, e) => {
          const n = this._state[e];
          return n;
        },
        set: (t, e, n) => (
          this._state[e] &&
          'object' === typeof this._state[e] &&
          'value' in this._state[e]
            ? (this._state[e].value = n)
            : (this._state[e] = o(n)),
          !0
        ),
        has: (t, e) => e in this._state,
        ownKeys: t => Object.keys(this._state),
      }
    );
  }
  initGetters(t) {
    const e = new Proxy(
      {},
      {
        get: (t, e) => {
          const n = this._state[e];
          if (n && 'object' === typeof n && 'value' in n) {
            return n.value;
          }
          return n;
        },
      }
    );
    for (const [n, o] of Object.entries(t))
      this.getters[n] = r(() => o(e, this.getters));
  }
  applyMiddleware() {
    ((this.dispatch = this.middleware.reduceRight(
      (t, e) => e(this)(t),
      this.baseDispatch.bind(this)
    )),
      (this.commit = this.middleware.reduceRight(
        (t, e) => (e.commit ? e.commit(this)(t) : t),
        this.baseCommit.bind(this)
      )));
  }
  baseDispatch(t, e) {
    if ('string' === typeof t) {
      const n = this.actions[t];
      if (!n) throw new Error(`Action '${t}' not found`);
      return n.call(
        this,
        { state: this._state, commit: this.commit, dispatch: this.dispatch },
        e
      );
    }
    if ('object' === typeof t && t.type)
      return this.dispatch(t.type, t.payload);
    throw new Error('Invalid action format');
  }
  baseCommit(t, e) {
    if ('string' === typeof t) {
      const n = this.mutations[t];
      if (!n) throw new Error(`Mutation '${t}' not found`);
      n(
        new Proxy(
          {},
          {
            get: (t, e) => {
              const n = this._state[e];
              return n && 'object' === typeof n && 'value' in n ? n.value : n;
            },
            set: (t, e, n) => (
              this._state[e] &&
              'object' === typeof this._state[e] &&
              'value' in this._state[e]
                ? (this._state[e].value = n)
                : (this._state[e] = o(n)),
              !0
            ),
          }
        ),
        e
      );
    } else {
      if ('object' !== typeof t || !t.type)
        throw new Error('Invalid mutation format');
      this.commit(t.type, t.payload);
    }
  }
  subscribe(t) {
    const e = Object.values(this._state).map(e =>
      e.subscribe(() => t(this._state))
    );
    return () => {
      e.forEach(t => t());
    };
  }
  watch(t, e) {
    if (!(t in this._state)) throw new Error(`State property '${t}' not found`);
    return this._state[t].subscribe(e);
  }
  getState() {
    const t = {};
    for (const [e, n] of Object.entries(this._state)) t[e] = n.value;
    return t;
  }
  replaceState(t) {
    for (const [e, n] of Object.entries(t))
      e in this.state ? (this.state[e].value = n) : (this.state[e] = o(n));
  }
}
function O(t) {
  return new A(t);
}
function N(t) {
  return e => (n, o) => {
    (console.group(`Action: ${n}`), t.getState());
    const r = e(n, o);
    return (t.getState(), console.groupEnd(), r);
  };
}
function L(t = {}) {
  const { key: e = 'rxhtmx-store', storage: n = localStorage } = t;
  return t => {
    try {
      const o = n.getItem(e);
      o && t.replaceState(JSON.parse(o));
    } catch (o) {
      console.warn('Failed to load persisted state:', o);
    }
    return (
      t.subscribe(r => {
        try {
          n.setItem(e, JSON.stringify(t.getState()));
        } catch (o) {
          console.warn('Failed to persist state:', o);
        }
      }),
      t => (e, n) => t(e, n)
    );
  };
}
function M(t = {}) {
  const { name: e = 'RxHtmx Store' } = t;
  return t => {
    if ('undefined' !== typeof window && window.__REDUX_DEVTOOLS_EXTENSION__) {
      const n = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name: e });
      (n.init(t.getState()),
        t.subscribe(e => {
          n.send('STATE_CHANGE', t.getState());
        }));
    }
    return n => (o, r) => {
      const s = n(o, r);
      if (
        'undefined' !== typeof window &&
        window.__REDUX_DEVTOOLS_EXTENSION__
      ) {
        window.__REDUX_DEVTOOLS_EXTENSION__
          .connect({ name: e })
          .send(o, t.getState());
      }
      return s;
    };
  };
}
class T {
  constructor(t = {}) {
    ((this.namespaced = t.namespaced || !1),
      (this.state = t.state || {}),
      (this.getters = t.getters || {}),
      (this.actions = t.actions || {}),
      (this.mutations = t.mutations || {}),
      (this.modules = t.modules || {}));
  }
}
const j = N,
  P = L,
  $ = M;
function D(t) {
  let e = t;
  const n = new Set();
  return {
    get value() {
      return e;
    },
    set value(t) {
      e !== t && ((e = t), n.forEach(t => t(e)));
    },
    subscribe: t => (n.add(t), t(e), () => n.delete(t)),
  };
}
let U;
('undefined' !== typeof window &&
  (async function () {
    try {
      if ('undefined' !== typeof window) {
        if (
          ((U = await Promise.resolve()
            .then(() => require('./chunks/htmxWrapper.3eaa5693.js'))
            .then(t => t.default)),
          !U)
        )
          throw new Error('HTMX failed to load.');
        console.info('[RxHtmx] HTMX loaded successfully.');
      }
    } catch (t) {
      console.error('[RxHtmx] HTMX not available or failed to load:', t);
    }
  })(),
  (exports.$ = function (t, e = document) {
    return e.querySelector(t);
  }),
  (exports.$$ = function (t, e = document) {
    return Array.from(e.querySelectorAll(t));
  }),
  (exports.Component = x),
  (exports.Router = _),
  (exports.RouterLink = C),
  (exports.RouterView = R),
  (exports.Store = A),
  (exports.StoreModule = T),
  (exports.VNode = c),
  (exports.addClass = function (t, e) {
    t.classList.add(e);
  }),
  (exports.animate = y),
  (exports.asyncMiddleware = function (t) {
    return e => (n, o) =>
      'function' === typeof n ? n(t.dispatch, t.getState) : e(n, o);
  }),
  (exports.authGuard = function (t, e) {
    return (
      !(!localStorage.getItem('auth-token') && t.meta?.requiresAuth) || '/login'
    );
  }),
  (exports.batch = function (t) {
    const e = a;
    a = !0;
    try {
      t();
    } finally {
      e ||
        (!(function () {
          const t = Array.from(i);
          (i.clear(),
            t.forEach(t => {
              'function' === typeof t.run && t.run();
            }));
        })(),
        (a = !1));
    }
  }),
  (exports.bindSignalToDom = function (t, e, n) {
    if (!t || 'function' !== typeof t.subscribe)
      throw new Error('[RxHtmx] bindSignalToDom: sig must be a signal');
    let o = null;
    return t.subscribe(t => {
      const r = document.querySelector(e);
      if (!r)
        return (
          null !== o &&
            console.warn(
              `[RxHtmx] Element for selector '${e}' is no longer in the DOM.`
            ),
          void (o = null)
        );
      o = r;
      try {
        n(r, t);
      } catch (s) {
        console.error('[RxHtmx] Error in updateFn:', s);
      }
    });
  }),
  (exports.combineStores = function (t) {
    const e = {},
      n = {},
      o = {},
      r = {};
    for (const [s, i] of Object.entries(t))
      ((e[s] = i.state),
        (n[s] = i.getters),
        (o[s] = i.actions),
        (r[s] = i.mutations));
    return O({ state: e, getters: n, actions: o, mutations: r });
  }),
  (exports.computed = r),
  (exports.createApp = function (t, e = {}) {
    return {
      component: null,
      mount(n) {
        return ((this.component = w(t, e)), v(this.component, n));
      },
      unmount() {
        this.component && (this.component.unmount(), (this.component = null));
      },
    };
  }),
  (exports.createComponent = w),
  (exports.createModule = function (t) {
    return new T(t);
  }),
  (exports.createRouter = function (t) {
    return new _(t);
  }),
  (exports.createRoutes = function (t) {
    return t.map(t => ({ ...t }));
  }),
  (exports.createStore = O),
  (exports.createStream = function (t) {
    const e = document.querySelector(t),
      n = D((e && e.value) || '');
    if (!e)
      return (console.warn(`[RxHtmx] Element not found for selector: ${t}`), n);
    const o = t => {
      n.value = t.target.value;
    };
    return (
      e.addEventListener('input', o),
      (n.unsubscribe = () => {
        e.removeEventListener('input', o);
      }),
      n
    );
  }),
  (exports.createWebHashHistory = function () {
    return { mode: 'hash' };
  }),
  (exports.createWebHistory = function (t = '/') {
    return { mode: 'history', base: t };
  }),
  (exports.defineComponent = function (t) {
    return (t.name && g.set(t.name, t), t);
  }),
  (exports.delegate = function (t, e, n, o) {
    const r = `${e}:${n}`;
    if (!m.has(r)) {
      const s = e => {
        const r = e.target.closest(n);
        r && t.contains(r) && o.call(r, e);
      };
      (t.addEventListener(e, s), m.set(r, s));
    }
    return () => {
      const n = m.get(r);
      n && (t.removeEventListener(e, n), m.delete(r));
    };
  }),
  (exports.devToolsMiddleware = $),
  (exports.devtools = M),
  (exports.effect = s),
  (exports.fadeIn = function (t, e = 300) {
    return y(t, [{ opacity: 0 }, { opacity: 1 }], {
      duration: e,
      fill: 'forwards',
    });
  }),
  (exports.fadeOut = function (t, e = 300) {
    return y(t, [{ opacity: 1 }, { opacity: 0 }], {
      duration: e,
      fill: 'forwards',
    });
  }),
  (exports.fragment = function (...t) {
    return new c('#fragment', {}, t.flat());
  }),
  (exports.getComponent = function (t) {
    return g.get(t);
  }),
  (exports.getCurrentInstance = function () {
    return b;
  }),
  (exports.getCurrentRouter = H),
  (exports.getDirective = function (t) {
    return E.get(t);
  }),
  (exports.h = l),
  (exports.hasClass = function (t, e) {
    return t.classList.contains(e);
  }),
  (exports.integrateHtmxWithSignals = function () {
    const t = D(null);
    if ('undefined' === typeof window || !document.body)
      return (
        console.warn(
          '[RxHtmx] integrateHtmxWithSignals called outside browser environment.'
        ),
        t
      );
    const e = e => {
        t.value = { type: 'afterSwap', detail: e.detail };
      },
      n = e => {
        t.value = { type: 'beforeRequest', detail: e.detail };
      };
    return (
      document.body.addEventListener('htmx:afterSwap', e),
      document.body.addEventListener('htmx:beforeRequest', n),
      (t.unsubscribe = () => {
        (document.body.removeEventListener('htmx:afterSwap', e),
          document.body.removeEventListener('htmx:beforeRequest', n));
      }),
      t
    );
  }),
  (exports.isSignal = u),
  (exports.logger = N),
  (exports.loggingMiddleware = j),
  (exports.mountComponent = v),
  (exports.nextTick = function (t) {
    return Promise.resolve().then(t);
  }),
  (exports.onBeforeMount = function (t) {
    b && b.hooks.beforeMount.push(t);
  }),
  (exports.onBeforeUnmount = function (t) {
    b && b.hooks.beforeUnmount.push(t);
  }),
  (exports.onBeforeUpdate = function (t) {
    b && b.hooks.beforeUpdate.push(t);
  }),
  (exports.onMounted = function (t) {
    b && b.hooks.mounted.push(t);
  }),
  (exports.onUnmounted = function (t) {
    b && b.hooks.unmounted.push(t);
  }),
  (exports.onUpdated = function (t) {
    b && b.hooks.updated.push(t);
  }),
  (exports.persistence = L),
  (exports.persistenceMiddleware = P),
  (exports.reactive = function (t) {
    if ('object' !== typeof t || null === t) return t;
    const e = {};
    for (const n in t)
      if (Object.prototype.hasOwnProperty.call(t, n)) {
        const r = o(t[n]);
        Object.defineProperty(e, n, {
          get: () => r.value,
          set(t) {
            r.value = t;
          },
          enumerable: !0,
          configurable: !0,
        });
      }
    return e;
  }),
  (exports.ready = function (t) {
    'loading' === document.readyState
      ? document.addEventListener('DOMContentLoaded', t)
      : t();
  }),
  (exports.ref = function (t) {
    return o(t);
  }),
  (exports.registerDirective = S),
  (exports.removeClass = function (t, e) {
    t.classList.remove(e);
  }),
  (exports.render = function (t, e) {
    (e._vnode ? d(e._vnode, t, e) : h(t, e), (e._vnode = t));
  }),
  (exports.setCurrentComponentInstance = n),
  (exports.setCurrentRouter = function (t) {
    k = t;
  }),
  (exports.signal = o),
  (exports.text = function (t) {
    return new c('#text', {}, [String(t)]);
  }),
  (exports.toggleClass = function (t, e) {
    t.classList.toggle(e);
  }),
  (exports.useActions = function (t, e) {
    if (Array.isArray(e)) {
      const n = {};
      return (
        e.forEach(e => {
          n[e] = n => t.dispatch(e, n);
        }),
        n
      );
    }
    if ('string' === typeof e) return n => t.dispatch(e, n);
    throw new Error('Invalid action names format');
  }),
  (exports.useGetter = function (t, e) {
    if (!(e in t.getters)) throw new Error(`Getter '${e}' not found`);
    return t.getters[e];
  }),
  (exports.useRoute = function () {
    const t = H();
    return t ? t.currentRoute : o(null);
  }),
  (exports.useRouter = function () {
    return H();
  }),
  (exports.useState = function (t, e) {
    if (!(e in t.state)) throw new Error(`State property '${e}' not found`);
    return t.state[e];
  }),
  (exports.useStore = function (t) {
    return t;
  }),
  (exports.validation = function (t = {}) {
    return e => e => (n, o) => {
      if (t[n]) {
        if (!t[n](o)) throw new Error(`Invalid payload for action '${n}'`);
      }
      return e(n, o);
    };
  }),
  (exports.watch = function (t, e, n = {}) {
    const { immediate: o = !1 } = n;
    let r = o ? void 0 : t.value;
    return s(
      () => {
        const n = t.value;
        (r !== n || o) && (e(n, r), (r = n));
      },
      { immediate: o }
    );
  }));
//# sourceMappingURL=index.js.map
