# DSH Model order settings

**English** | [简体中文](./README.md)

Adds a **Model order** page to DeepSeek Harness settings, where you arrange providers and
the models inside them.

> A standalone plugin you can install on its own. The slider plugin,
> [dsh-codex-reasoning-slider](https://github.com/kyf778/dsh-codex-reasoning-slider),
> reads the order set here.

## Features

In Settings → Model order you can rearrange providers and their models:

- **Drag to reorder** — every provider block and model row has a grip handle, and an
  insertion line shows where the item will land
- **Arrow buttons** — the keyboard-accessible path, kept alongside dragging
- **Restore default order** — clears the saved order in one click

Models reorder within their own provider group; providers reorder as whole blocks.
Changes apply immediately and are remembered.

## Standalone

This plugin **works on its own and does not depend on** the slider plugin:

- Slider plugin installed: the slider reads the order you set here
- Not installed: this page still reorders and remembers everything, and works fully

The two plugins communicate through one `localStorage` key
(`dsh-codex-slider-model-order-v1`) and a `dsh-model-order-changed` window event that
this plugin emits on every write.

## Install

In Harness, open **Plugins → Add plugin** and paste this repository's URL. Or:

```bash
dsh plugin --profile desktop add github:kyf778/dsh-model-order-settings
```

Then open **Settings → Model order** to find it.

## Compatibility

Tested only on DeepSeek Harness Desktop **0.2.0-rc.2** (Windows 11).

## License

MIT. See [LICENSE](./LICENSE).
