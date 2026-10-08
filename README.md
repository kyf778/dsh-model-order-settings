# dsh-model-order-settings

A **standalone** DeepSeek Harness (DSH) plugin that adds a **Model order**
settings page where you can reorder providers and the models inside each.

This is one of two independent plugins split out from the original combined
`dsh-codex-reasoning-effort-slider`:

- [`dsh-codex-reasoning-slider`](https://github.com/kyf778/dsh-codex-reasoning-slider) — the slider.
- **`dsh-model-order-settings`** (this repo) — the model/provider ordering page.

They are fully decoupled: you can install **either one by itself** and it works,
or install **both** together — they never depend on each other. The only thing
they share is one localStorage key (`dsh-codex-model-order-v1`) so the slider
(the other plugin) respects the order configured here when both are present.
If you only install this page, it still works perfectly on its own.

## Features

- A **Model order** section in Settings.
- Reorder providers and individual models with up/down buttons.
- Changes apply immediately and are remembered in localStorage.
- "Restore default order" resets everything.

## How it links with the slider

This plugin writes to `localStorage["dsh-codex-model-order-v1"]`. The slider
reads the same key, so when both are installed the picker shows models in the
order you set here. Cross-window updates use the `storage` event; same-window
live updates use a `dsh-model-order-changed` event.

## Install

In DeepSeek Harness, open **Settings → Plugins** and install from this GitHub
repo (`kyf778/dsh-model-order-settings`).

Or, for local development, link the folder into your DSH desktop profile:

```yaml
# ~/.dsh/profiles/desktop/package.json  (dependencies)
"@local/dsh-model-order-settings": "link:/path/to/this/folder"
```

and add `@local/dsh-model-order-settings` to `dsh.profile.bundles`.

## Compatibility

- DeepSeek Harness `>= 0.2.0-rc.2`.
- Injects `settings.section`.

## License

MIT
