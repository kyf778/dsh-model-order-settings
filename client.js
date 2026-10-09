window.__ModuleLoader__.load({
  id: '@local/dsh-model-order-settings',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useSyncExternalStore } = React;
    const NS = 'dsh-model-order-settings';
    const zh = {
      nav: '模型排序', title: '模型排序', desc: '调整模型与提供方的显示顺序，越靠上越先出现。可以直接拖动行排序，也可以用箭头按钮。设置会立即生效并记住。',
      provider: '提供方', up: '上移', down: '下移', resetOrder: '恢复默认顺序', drag: '拖动排序',
      loading: '正在加载模型',
      orderEmpty: '还没有可用的模型目录。打开一次模型选择器后回到这里即可。'
    };
    const en = {
      nav: 'Model order', title: 'Model order', desc: 'Reorder providers and models. Items higher in the list appear first. Drag rows to reorder, or use the arrow buttons. Changes apply immediately and are remembered.',
      provider: 'Provider', up: 'Move up', down: 'Move down', resetOrder: 'Restore default order', drag: 'Drag to reorder',
      loading: 'Loading models',
      orderEmpty: 'No model catalog yet. Open the model picker once, then come back here.'
    };
    // ---- user-defined model ordering (this plugin owns writes) ----
    // The slider reads the same key, so the two stay in sync; with only this
    // plugin installed you still get a working reorder page.
    const ORDER_KEY = 'dsh-codex-slider-model-order-v1';
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
    /** Cross-plugin signal; the slider is a separate module instance. */
    const ORDER_EVENT = 'dsh-model-order-changed';
    function subscribeOrder(listener) {
      orderListeners.add(listener);
      return () => { orderListeners.delete(listener); };
    }
    function setOrder(next) {
      orderSnapshot = next;
      try { localStorage.setItem(ORDER_KEY, JSON.stringify(next)); } catch {}
      orderListeners.forEach(listener => { try { listener(); } catch {} });
      // Tell the slider (same window); the storage event covers other windows.
      try { window.dispatchEvent(new Event(ORDER_EVENT)); } catch {}
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
    const styles = `
      .dsh-codex-order-icon{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
      .dsh-codex-order-small{width:14px;height:14px}
      .dsh-codex-order-root{padding:16px 20px;display:flex;flex-direction:column;gap:14px;color:var(--dsw-alias-label-primary)}
      .dsh-codex-order-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .dsh-codex-order-title{font-size:15px;font-weight:600;line-height:22px}
      .dsh-codex-order-desc{margin-top:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);max-width:520px}
      .dsh-codex-order-reset{flex:none;height:28px;padding:0 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer}
      .dsh-codex-order-reset:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
      .dsh-codex-order-group{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden}
      .dsh-codex-order-groupHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-codex-order-groupName{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dsh-codex-order-tag{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary)}
      .dsh-codex-order-row{display:flex;align-items:center;gap:10px;padding:7px 10px;border-top:1px solid var(--dsw-alias-border-l1)}
      .dsh-codex-order-name{flex:1;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dsh-codex-order-id{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dsh-codex-order-btns{display:flex;gap:4px;flex:none}
      .dsh-codex-order-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
      .dsh-codex-order-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
      .dsh-codex-order-btn:disabled{opacity:.3;cursor:default}
      .dsh-codex-order-group.dropAbove{border-top:2px solid var(--dsw-alias-label-primary)}
      .dsh-codex-order-group.dropBelow{border-bottom:2px solid var(--dsw-alias-label-primary)}
      .dsh-codex-order-group.dragging{opacity:.45}
      .dsh-codex-order-row.dropAbove{box-shadow:0 -2px 0 0 var(--dsw-alias-label-primary)}
      .dsh-codex-order-row.dropBelow{box-shadow:0 2px 0 0 var(--dsw-alias-label-primary)}
      .dsh-codex-order-row.dragging{opacity:.45}
      .dsh-codex-order-grip{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:26px;border-radius:4px;color:var(--dsw-alias-label-caption);cursor:grab;touch-action:none}
      .dsh-codex-order-grip:hover{color:var(--dsw-alias-label-secondary)}
      .dsh-codex-order-grip:active{cursor:grabbing}
      .dsh-codex-order-grip:focus-visible{outline:2px solid var(--dsw-focus-ring-color);outline-offset:1px}
      .dsh-codex-order-grip .dsh-codex-order-icon{width:14px;height:14px}
      .dsh-codex-order-empty{padding:12px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
    `;
    function icon(name, small = false) {
      const paths = {
        up: 'm6 15 6-6 6 6',
        down2: 'm6 9 6 6 6-6',
        grip: 'M9 5.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 18.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
      };
      return h('svg', { className: `dsh-codex-order-icon${small ? ' dsh-codex-order-small' : ''}`, viewBox: '0 0 24 24', 'aria-hidden': true },
        h('path', { d: paths[name] || paths.model }));
    }
    /**
     * Read a message off an unknown thrown value. Duck-typed rather than
     * `instanceof Error` because a rejection can cross a realm boundary (an
     * iframe or worker), where `instanceof` is false for a real Error.
     */
    function errorText(cause) {
      if (cause === null || cause === undefined) return 'unknown error';
      if (typeof cause === 'string') return cause;
      const message = cause.message;
      return typeof message === 'string' && message !== '' ? message : String(cause);
    }
    /**
     * A root-scoped snapshot store over the host's model catalog.
     *
     * A settings section has no session, so it cannot call
     * `modelDirectories.directoryFor(sessionId)`. It reads the same catalog
     * through the public `remote.session.modelCatalog()` RPC instead, keeping
     * the field names the shared picker components already read.
     */
    function makeCatalogStore(ctx) {
      let snapshot = { current: null, routable: null, groups: [], failures: [], status: 'idle', pending: null, error: null };
      const listeners = new Set();
      const notify = () => listeners.forEach(listener => { try { listener(); } catch {} });
      let inflight = null;
      function load() {
        if (inflight !== null) return inflight;
        snapshot = { ...snapshot, status: snapshot.groups.length ? 'ready' : 'loading', error: null };
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
              failures: Array.isArray(value.failures) ? value.failures : [],
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
    function moveItem(list, index, delta) {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    }
    /** Move an item to an arbitrary position (drag-and-drop reorder). */
    function arrayMove(list, from, to) {
      const next = [...list];
      const clamped = Math.max(0, Math.min(next.length - 1, to));
      const [item] = next.splice(from, 1);
      next.splice(clamped, 0, item);
      return next;
    }
    /**
     * The "Model order" settings page: reorder providers and the models inside
     * each. Rows and provider blocks are draggable (HTML5 drag-and-drop); the
     * arrow buttons remain for keyboard users. Writes go straight to the saved
     * order store, which the picker subscribes to, so a change shows up the
     * next time the picker opens.
     */
    /** Which half of the element the pointer is over — insert before or after. */
    function dropEdge(event) {
      const box = event.currentTarget.getBoundingClientRect();
      return event.clientY - box.top < box.height / 2 ? 'above' : 'below';
    }
    function OrderSettings({ directory, load, available, t }) {
      const state = useSyncExternalStore(fn => directory.subscribe(fn), () => directory.getSnapshot());
      const saved = useSyncExternalStore(subscribeOrder, () => orderSnapshot);
      const [loading, setLoading] = useState(false);
      // What is being dragged: { kind: 'provider'|'model', groupId?, from }.
      const [drag, setDrag] = useState(null);
      // Where it would land: { kind, groupId?, index, edge }. Drives the insert line.
      const [drop, setDrop] = useState(null);
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
      const dropProvider = (from, to) => {
        if (from === to) return;
        const ids = groups.map(group => group.id);
        commit(arrayMove(ids, from, to), saved.models);
      };
      const dropModel = (groupId, from, to) => {
        const group = groups.find(g => g.id === groupId);
        if (!group || from === to) return;
        const ids = group.models.map(model => model.id);
        commit(saved.providers, { ...saved.models, [groupId]: arrayMove(ids, from, to) });
      };
      const clearDrag = () => { setDrag(null); setDrop(null); };
      const rows = [];
      groups.forEach((group, groupIndex) => {
        const groupClasses = ['dsh-codex-order-group'];
        if (drag?.kind === 'provider' && drag.from === groupIndex) groupClasses.push('dragging');
        // drop.index may equal groups.length (below the last group).
        if (drop?.kind === 'provider' && drop.edge === 'above' && drop.index === groupIndex) groupClasses.push('dropAbove');
        else if (drop?.kind === 'provider' && drop.edge === 'below' && drop.index === groupIndex + 1 && groupIndex === groups.length - 1) groupClasses.push('dropBelow');
        rows.push(h('div', {
          className: groupClasses.join(' '), key: group.id, draggable: true,
          onDragStart: event => {
            // A model row dragstart must not also start a provider drag.
            event.stopPropagation();
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', `provider:${group.id}`);
            setDrag({ kind: 'provider', from: groupIndex });
          },
          onDragOver: event => {
            if (drag?.kind !== 'provider') return;
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
            const edge = dropEdge(event);
            const index = edge === 'above' ? groupIndex : groupIndex + 1;
            setDrop(prev => (prev?.kind === 'provider' && prev.index === index && prev.edge === edge) ? prev : { kind: 'provider', index, edge });
          },
          onDrop: event => {
            if (drag?.kind !== 'provider') return;
            event.preventDefault();
            event.stopPropagation();
            const edge = dropEdge(event);
            dropProvider(drag.from, edge === 'above' ? groupIndex : groupIndex + 1);
            clearDrag();
          },
          onDragEnd: clearDrag
        },
          h('div', { className: 'dsh-codex-order-groupHead' },
            h('span', { className: 'dsh-codex-order-grip', title: t('drag'), 'aria-hidden': true }, icon('grip', true)),
            h('span', { className: 'dsh-codex-order-groupName' }, group.name || group.id),
            h('span', { className: 'dsh-codex-order-tag' }, t('provider')),
            h('span', { className: 'dsh-codex-order-btns' },
              h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('up'), 'aria-label': `${t('up')}: ${group.name || group.id}`,
                disabled: groupIndex === 0, onClick: () => moveProvider(groupIndex, -1) }, icon('up', true)),
              h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('down'), 'aria-label': `${t('down')}: ${group.name || group.id}`,
                disabled: groupIndex === groups.length - 1, onClick: () => moveProvider(groupIndex, 1) }, icon('down2', true)))),
          ...group.models.map((model, modelIndex) => {
            const rowClasses = ['dsh-codex-order-row'];
            if (drag?.kind === 'model' && drag.groupId === group.id && drag.from === modelIndex) rowClasses.push('dragging');
            // drop.index may equal the model count (below the last row).
            if (drop?.kind === 'model' && drop.groupId === group.id && drop.edge === 'above' && drop.index === modelIndex) rowClasses.push('dropAbove');
            else if (drop?.kind === 'model' && drop.groupId === group.id && drop.edge === 'below' && drop.index === modelIndex + 1 && modelIndex === group.models.length - 1) rowClasses.push('dropBelow');
            return h('div', {
              className: rowClasses.join(' '), key: model.id, draggable: true,
              onDragStart: event => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', `model:${model.id}`);
                setDrag({ kind: 'model', groupId: group.id, from: modelIndex });
              },
              onDragOver: event => {
                // Models only reorder within their own provider group.
                if (drag?.kind !== 'model' || drag.groupId !== group.id) return;
                event.preventDefault();
                event.stopPropagation();
                event.dataTransfer.dropEffect = 'move';
                const edge = dropEdge(event);
                const index = edge === 'above' ? modelIndex : modelIndex + 1;
                setDrop(prev => (prev?.kind === 'model' && prev.groupId === group.id && prev.index === index && prev.edge === edge) ? prev : { kind: 'model', groupId: group.id, index, edge });
              },
              onDrop: event => {
                if (drag?.kind !== 'model' || drag.groupId !== group.id) return;
                event.preventDefault();
                event.stopPropagation();
                const edge = dropEdge(event);
                dropModel(group.id, drag.from, edge === 'above' ? modelIndex : modelIndex + 1);
                clearDrag();
              },
              onDragEnd: clearDrag
            },
              h('span', { className: 'dsh-codex-order-grip', title: t('drag'), 'aria-hidden': true }, icon('grip', true)),
              h('span', { className: 'dsh-codex-order-name', title: model.name || model.id }, model.name || model.id),
              h('span', { className: 'dsh-codex-order-id', title: model.id }, model.id),
              h('span', { className: 'dsh-codex-order-btns' },
                h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('up'), 'aria-label': `${t('up')}: ${model.name || model.id}`,
                  disabled: modelIndex === 0, onClick: () => moveModel(group, modelIndex, -1) }, icon('up', true)),
                h('button', { className: 'dsh-codex-order-btn', type: 'button', title: t('down'), 'aria-label': `${t('down')}: ${model.name || model.id}`,
                  disabled: modelIndex === group.models.length - 1, onClick: () => moveModel(group, modelIndex, 1) }, icon('down2', true))));
          })));
      });
      return h('div', { className: 'dsh-codex-order-root',
          onDragLeave: event => {
            // Leaving the list entirely: drop the insert line.
            const to = event.relatedTarget;
            if (to && event.currentTarget.contains(to)) return;
            setDrop(null);
          } },
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
