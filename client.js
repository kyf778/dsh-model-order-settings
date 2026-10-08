window.__ModuleLoader__.load({
  id: '@local/dsh-model-order-settings',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useSyncExternalStore } = React;
    const NS = 'dsh-model-order-settings';
    const zh = {
      nav: '模型排序', title: '模型排序', desc: '调整模型与提供方的显示顺序，越靠上越先出现。设置会立即生效并记住。',
      provider: '提供方', up: '上移', down: '下移', resetOrder: '恢复默认顺序',
      orderEmpty: '还没有可用的模型目录。打开一次模型选择器后回到这里即可。',
      loading: '正在加载模型'
    };
    const en = {
      nav: 'Model order', title: 'Model order', desc: 'Reorder providers and models. Items higher in the list appear first. Changes apply immediately and are remembered.',
      provider: 'Provider', up: 'Move up', down: 'Move down', resetOrder: 'Restore default order',
      orderEmpty: 'No model catalog yet. Open the model picker once, then come back here.',
      loading: 'Loading models'
    };
    // ---- shared user-defined model ordering (this plugin is the editor) ----
    // The same key is read by the "dsh-codex-reasoning-slider" plugin, so the two
    // stay in sync. If only this plugin is installed, you still get a working
    // reorder page; the slider simply will not be present to consume it.
    const ORDER_KEY = 'dsh-codex-model-order-v1';
    function readOrder() {
      try {
        const raw = localStorage.getItem(ORDER_KEY);
        if (!raw) return { providers: [], models: {} };
        const parsed = JSON.parse(raw);
        return {
          providers: Array.isArray(parsed?.providers) ? parsed.providers.filter(x => typeof x === 'string') : [],
          models: parsed && typeof parsed.models === 'object' && parsed.models !== null ? parsed.models : {}
        };
      } catch { return { providers: [], models: {} }; }
    }
    let orderSnapshot = readOrder();
    const orderListeners = new Set();
    function subscribeOrder(listener) {
      orderListeners.add(listener);
      return () => { orderListeners.delete(listener); };
    }
    function setOrder(next) {
      orderSnapshot = next;
      try { localStorage.setItem(ORDER_KEY, JSON.stringify(next)); } catch {}
      orderListeners.forEach(listener => { try { listener(); } catch {} });
      // Notify the separate "dsh-codex-reasoning-slider" plugin (same window).
      try { window.dispatchEvent(new Event('dsh-model-order-changed')); } catch {}
    }
    /** Rank of an id in a saved order list; unknown ids sort last, stably. */
    function rankOf(list, id) {
      const index = list.indexOf(id);
      return index < 0 ? Number.MAX_SAFE_INTEGER : index;
    }
    /** Apply the saved provider/model order; unknown entries keep their relative order. */
    function applyOrder(groups, saved) {
      const providers = saved?.providers ?? [];
      const models = saved?.models ?? {};
      const sorted = groups.map(group => {
        const wanted = models[group.id] ?? [];
        return { ...group, models: [...group.models].sort((a, b) => rankOf(wanted, a.id) - rankOf(wanted, b.id)) };
      });
      return sorted.sort((a, b) => rankOf(providers, a.id) - rankOf(providers, b.id));
    }
    function moveItem(list, index, delta) {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    }
    function icon(name, outline) {
      switch (name) {
        case 'up': return h('svg', { className: 'dsh-codex-order-ico', viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M12 19V5M5 12l7-7 7 7' }));
        case 'down2': return h('svg', { className: 'dsh-codex-order-ico', viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M12 5v14M19 12l-7 7-7-7' }));
        default: return null;
      }
    }
    const styles = `
.dsh-codex-order-root{max-width:720px;}
.dsh-codex-order-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;}
.dsh-codex-order-title{font:700 18px/1.3 system-ui,sans-serif;color:var(--dsh-text,#1c2330);}
.dsh-codex-order-desc{font:500 13px/1.5 system-ui,sans-serif;color:var(--dsh-muted,#8a93a6);margin-top:4px;max-width:520px;}
.dsh-codex-order-reset{border:1px solid var(--dsh-border,#d7dbe3);background:var(--dsh-control,#fff);color:var(--dsh-text,#1c2330);border-radius:9px;padding:8px 12px;font:600 13px system-ui,sans-serif;cursor:pointer;white-space:nowrap;}
.dsh-codex-order-reset:hover{border-color:var(--dsh-accent,#3988f6);color:var(--dsh-accent,#3988f6);}
.dsh-codex-order-group{margin-bottom:10px;border:1px solid var(--dsh-border,#d7dbe3);border-radius:12px;overflow:hidden;}
.dsh-codex-order-groupHead{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--dsh-hover,#f3f6fb);}
.dsh-codex-order-groupName{font:700 14px system-ui,sans-serif;color:var(--dsh-text,#1c2330);}
.dsh-codex-order-groupHead .dsh-codex-order-groupName{flex:1;}
.dsh-codex-order-tag{font:600 11px system-ui,sans-serif;color:var(--dsh-muted,#8a93a6);background:var(--dsh-control,#fff);border:1px solid var(--dsh-border,#d7dbe3);border-radius:6px;padding:2px 8px;}
.dsh-codex-order-btns{display:flex;gap:6px;}
.dsh-codex-order-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--dsh-border,#d7dbe3);background:var(--dsh-control,#fff);color:var(--dsh-text,#1c2330);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
.dsh-codex-order-btn:hover:not(:disabled){border-color:var(--dsh-accent,#3988f6);color:var(--dsh-accent,#3988f6);}
.dsh-codex-order-btn:disabled{opacity:.4;cursor:not-allowed;}
.dsh-codex-order-ico{width:16px;height:16px;}
.dsh-codex-order-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-top:1px solid var(--dsh-border,#d7dbe3);}
.dsh-codex-order-row .dsh-codex-order-name{flex:1;font:500 13px system-ui,sans-serif;color:var(--dsh-text,#1c2330);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsh-codex-order-id{font:500 11px system-ui,sans-serif;color:var(--dsh-muted,#8a93a6);}
.dsh-codex-order-empty{font:500 13px system-ui,sans-serif;color:var(--dsh-muted,#8a93a6);padding:16px;border:1px dashed var(--dsh-border,#d7dbe3);border-radius:12px;}
`;
    /**
     * A root-scoped snapshot store over the host's model catalog.
     *
     * A settings section has no session, so it cannot call
     * `modelDirectories.directoryFor(sessionId)`. It reads the same catalog
     * through the public `remote.session.modelCatalog()` RPC instead, keeping
     * the field names the shared picker components already read.
     */
    function makeCatalogStore(ctx) {
      function errorText(cause) {
        if (cause === null || cause === undefined) return 'unknown error';
        if (typeof cause === 'string') return cause;
        const message = cause.message;
        return typeof message === 'string' && message !== '' ? message : String(cause);
      }
      let snapshot = { groups: [], status: 'idle', error: null };
      const listeners = new Set();
      const notify = () => listeners.forEach(listener => { try { listener(); } catch {} });
      let inflight = null;
      function load() {
        if (inflight !== null) return inflight;
        snapshot = { ...snapshot, status: 'loading', error: null };
        notify();
        const remote = ctx.get('remote');
        const session = remote?.session;
        if (session === undefined || typeof session.modelCatalog !== 'function') {
          snapshot = { ...snapshot, status: 'error', error: 'model catalog is unavailable' };
          notify();
          return Promise.resolve(snapshot);
        }
        inflight = Promise.resolve(session.modelCatalog()).then(response => {
          if (!response || response.ok !== true) {
            const message = response?.error?.message ?? 'model catalog request failed';
            snapshot = { ...snapshot, status: 'error', error: message };
          } else {
            const value = response.value ?? {};
            snapshot = {
              ...snapshot,
              groups: Array.isArray(value.groups) ? value.groups : [],
              status: 'ready',
              error: null
            };
          }
          notify();
          return snapshot;
        }, cause => {
          snapshot = { ...snapshot, status: 'error', error: errorText(cause) };
          notify();
          return snapshot;
        }).finally(() => { inflight = null; });
        return inflight;
      }
      return {
        subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
        getSnapshot() { return snapshot; },
        load
      };
    }
    /**
     * The "Model order" settings page: reorder providers and the models inside
     * each. Writes go straight to the saved order store, which the picker
     * subscribes to, so a change shows up the next time the picker opens.
     */
    function OrderSettings({ directory, load, available, t }) {
      const state = useSyncExternalStore(fn => directory.subscribe(fn), () => directory.getSnapshot());
      const saved = useSyncExternalStore(subscribeOrder, () => orderSnapshot);
      const [loading, setLoading] = useState(false);
      useEffect(() => {
        if (!available) return;
        setLoading(true);
        Promise.resolve(load()).catch(() => {}).then(() => setLoading(false), () => setLoading(false));
      }, [available]);
      const groups = applyOrder(state.groups, saved);
      const total = groups.reduce((count, group) => count + group.models.length, 0);
      const commit = (providers, models) => setOrder({ providers, models });
      const moveProvider = (index, delta) => {
        const ids = groups.map(group => group.id);
        const next = moveItem(ids, index, delta);
        // Persist the full provider order so it survives later catalog changes.
        commit(next, saved.models);
      };
      const moveModel = (group, index, delta) => {
        const ids = group.models.map(model => model.id);
        const next = moveItem(ids, index, delta);
        commit(saved.providers, { ...saved.models, [group.id]: next });
      };
      const rows = [];
      groups.forEach((group, groupIndex) => {
        rows.push(h('div', { className: 'dsh-codex-order-group', key: group.id },
          h('div', { className: 'dsh-codex-order-groupHead' },
            h('span', { className: 'dsh-codex-order-groupName' }, group.name || group.id),
            h('span', { className: 'dsh-codex-order-tag' }, t('provider')),
            h('span', { className: 'dsh-codex-order-btns' },
              h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('up'), 'aria-label': `${t('up')}: ${group.name || group.id}`,
                disabled: groupIndex === 0, onClick: () => moveProvider(groupIndex, -1) }, icon('up', true)),
              h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('down'), 'aria-label': `${t('down')}: ${group.name || group.id}`,
                disabled: groupIndex === groups.length - 1, onClick: () => moveProvider(groupIndex, 1) }, icon('down2', true)))),
          ...group.models.map((model, modelIndex) => h('div', { className: 'dsh-codex-order-row', key: model.id },
            h('span', { className: 'dsh-codex-order-name', title: model.name || model.id }, model.name || model.id),
            h('span', { className: 'dsh-codex-order-id', title: model.id }, model.id),
            h('span', { className: 'dsh-codex-order-btns' },
              h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('up'), 'aria-label': `${t('up')}: ${model.name || model.id}`,
                disabled: modelIndex === 0, onClick: () => moveModel(group, modelIndex, -1) }, icon('up', true)),
              h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('down'), 'aria-label': `${t('down')}: ${model.name || model.id}`,
                disabled: modelIndex === group.models.length - 1, onClick: () => moveModel(group, modelIndex, 1) }, icon('down2', true)))))));
      });
      return h('div', { className: 'dsh-codex-order-root' },
        h('style', null, styles),
        h('div', { className: 'dsh-codex-order-head' },
          h('div', null,
            h('div', { className: 'dsh-codex-order-title' }, t('title')),
            h('div', { className: 'dsh-codex-order-desc' }, t('desc'))),
          h('button', { className: 'dsh-codex-order-reset', type: 'button',
            onClick: () => setOrder({ providers: [], models: {} }) }, t('resetOrder'))),
        total === 0
          ? h('div', { className: 'dsh-codex-order-empty' }, loading ? t('loading') : t('orderEmpty'))
          : rows);
    }
    return {
      inject: ['slots', 'locale', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }));
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'dsh-model-order-settings',
          order: 12,
          label: () => ctx.locale.bind(NS)('nav'),
          locale: NS,
          inject: () => {
            const store = makeCatalogStore(ctx);
            return {
              available: true,
              directory: store,
              load: () => store.load(),
              t: ctx.locale.bind(NS)
            };
          }
        }, OrderSettings));
      }
    };
  }
});
