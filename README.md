# DSH Model order settings

DeepSeek Harness 设置页里的「模型排序」页面。独立插件。

A **Model order** settings page for DeepSeek Harness. Standalone plugin.

## 功能 / Features

在 设置 → 模型排序 里调整提供方与模型的显示顺序：

- **拖动排序** —— 每个提供方整块、每个模型行都有抓手，拖动时显示插入位置指示线
- **箭头按钮** —— 键盘可达的操作方式，与拖动并存
- **恢复默认顺序** —— 一键清除已保存的顺序

模型在各自的提供方组内重排，提供方作为整块重排。改动立即生效并被记住。

## 独立性 / Standalone

本插件可单独使用，不依赖滑块插件：

- 装了滑块插件：滑块会读取你在这里设定的顺序
- 没装：这个页面依然可以正常排序和记忆

两个插件通过同一个 `localStorage` 键（`dsh-codex-slider-model-order-v1`）和一个
`dsh-model-order-changed` 窗口事件通信，本插件在每次写入时发出该事件。

## 安装 / Install

在 Harness 的 **插件 → 添加插件** 里粘贴本仓库地址，或：

```bash
dsh plugin --profile desktop add github:kyf778/dsh-model-order-settings
```

## 许可证 / License

MIT。见 [LICENSE](./LICENSE)。
