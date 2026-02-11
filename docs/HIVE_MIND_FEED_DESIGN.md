# HIVE MIND FEED & NEURAL OSCILLOSCOPE 设计方案

## 1. 概述

HIVE MIND FEED 是 ENGRAM 系统的核心组件之一，用于可视化全网用户的集体意识活动。本方案旨在通过引入“神经示波器（Neural Oscilloscope）”和优化现有的 Feed 列表，增强用户的沉浸感和连接感，充分发挥 Sui 区块链的实时特性。

## 2. 核心架构变更：数据源分离 (Data Source Separation)

为了强化“集体意识”的概念，我们将数据流分为两层：

1.  **Local Memory (个人小我)**：
    - **组件**：HiveMindCalendar (左侧日历)
    - **数据源**：`useMemoryStore` (本地 Zustand 存储)
    - **用途**：记录和回顾用户自己的操作历史。
2.  **Global Hive Mind (集体大我)**：
    - **组件**：HiveMindFeed (右侧信息流) & NeuralOscilloscope (神经示波器)
    - **数据源**：`useGlobalHiveMind` (全网事件订阅 Hook)
    - **用途**：监听全网其他用户的活动，营造“连接感”。

## 3. 核心组件：Neural Oscilloscope (神经示波器)

### 3.1 设计理念

将全网的每一次交互（Trace Engraving）视为 Hive Mind（蜂巢思维）的一次神经脉冲。示波器实时监测并可视化这些脉冲，形成一种“生命体征监测”的视觉隐喻。**只有全网产生新动态时（不一定是当前用户），示波器才会跳动。**

### 3.2 视觉表现

- **风格**：复古赛博朋克示波器，结合 CRT 扫描线和高对比度霓虹色。
- **基准线 (Baseline)**：
  - 一条持续的、微弱的低频正弦波，代表 Hive Mind 的“待机心跳”或“背景噪音”。
  - 颜色：淡钛灰 (`titanium-grey/30`)。
- **脉冲 (Pulse)**：
  - 当全网任意用户产生新 Trace 时，触发一次强烈的波形跳动。
  - **振幅 (Amplitude)**：由 Trace 的情绪强度 (`emotion_val`) 决定。
  - **颜色 (Color)**：根据情绪类型 (`Mood`) 动态变化。
    - 🔵 **Routine / Calm**: Neon Cyan (`#00f3ff`) - 平滑正弦波
    - 🔴 **Alert / Anger**: Glitch Red (`#ff003c`) - 尖锐锯齿波
    - 🟣 **Creative / Manual**: Neon Purple (`#bc13fe`) - 复杂复合波
- **衰减 (Decay)**：
  - 脉冲从右向左移动（或原地淡出），形成短暂的历史轨迹，随后回归基准线。

### 3.3 交互逻辑

- **实时性**：前端通过 WebSocket 订阅 Sui 链上 `EngraveEvent`，确保毫秒级响应。
- **位置**：嵌入 HIVE MIND FEED 容器顶部，作为 Feed 的“动态头部”。

## 4. 组件优化：System Feed List

### 4.1 列表精简

为了聚焦视觉重心并减少信息过载，Feed 列表的显示条数将大幅缩减。

- **显示数量**：固定为 **3条**。
- **视觉层级**：
  1.  **高亮 (Highlight)**：最新的一条 Trace。
      - 完全不透明 (`opacity-100`)。
      - 带有发光效果 (`text-shadow`)。
      - 包含完整细节。
  2.  **普通 (Normal)**：第 2、3 条 Trace。
      - 半透明 (`opacity-60`)。
      - 无发光，仅作为上下文背景。
  3.  **移除 (Removed)**：不再显示更早的“低亮”或“暗淡”条目，保持界面整洁。

### 4.2 布局调整

- Feed 列表位于 Neural Oscilloscope 下方。
- 整体容器高度自适应，保持紧凑，不占据过多屏幕空间。

## 5. 技术实现路径

1.  **Hook 封装**：
    - `useGlobalHiveMind.ts`: 负责订阅全网事件（模拟或真实 Sui Event）。
2.  **组件拆分**：
    - `<NeuralOscilloscope />`: 负责 Canvas 绘图或 SVG 动画。
    - `<HiveMindFeed />`: 消费 `useGlobalHiveMind` 数据并渲染。
3.  **Sui 集成**：
    - 使用 Sui Client SDK 的 `subscribeEvent` 方法监听合约事件。

## 6. 总结

该方案通过“动态波形 + 精简列表”以及“全网数据分离”的策略，将 HIVE MIND FEED 从一个简单的文本流升级为一个有生命力的、可视化的神经中枢，极大地增强了 ENGRAM 的赛博朋克氛围。
