# dsh-model-order-settings

A **Model order** page in DeepSeek Harness settings — a standalone plugin.

## What it does

Adds a "模型排序 / Model order" section to Settings where you can arrange providers and
the models inside each provider:

- **Drag to reorder** — every provider block and model row has a grip handle; an
  insertion line shows where the item will land.
- **Arrow buttons** — the keyboard-accessible path, kept alongside dragging.
- **Restore default order** — clears the saved order in one click.

Models reorder within their own provider group; providers reorder as whole blocks.
Changes apply immediately and are remembered.

## Independent by design

This plugin is fully standalone. It works with the reasoning-slider plugin installed or not:

- With it: the slider reads the order you set here.
- Without it: this page still reorders and remembers everything.

The two plugins share one `localStorage` key (`dsh-codex-slider-model-order-v1`) and a
`dsh-model-order-changed` window event that this plugin emits on every write.

## Install

```bash
dsh plugin --profile desktop add github:kyf778/dsh-model-order-settings
```

## License

MIT.
