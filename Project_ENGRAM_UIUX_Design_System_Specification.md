这是一份为 **Project ENGRAM** 量身定制的 UI/UX 设计规范。这份文档不仅是视觉指南，更是“沉浸式终端”体验的构建蓝图。

------

# Project ENGRAM: UI/UX Design System Specification

**Version**: 1.0 (MVP Sprint)

**Theme Code**: `NEURAL_TERMINAL_V1`

**Core Concept**: "Your life, engraved in the digital void." (你的生活，刻录于数字虚空。)

## 1. 设计哲学 (Design Philosophy)

- **Diegetic UI (叙事内界面)**: 界面本身就是故事的一部分。用户不是在操作一个网页，而是在操作一台直接连接到 Sui 区块链的“神经终端机”。
- **Brutalism x High-Tech (粗野主义 x 高科技)**: 拒绝圆角、阴影和柔和的渐变。拥抱硬边框、高对比度、纯黑背景和单色荧光。
- **Glitch as Feedback (故障即反馈)**: 利用“故障艺术 (Glitch Art)”来掩盖区块链的交互延迟。当数据正在上链时，不是显示“加载中”，而是显示“信号不稳”的视觉干扰。

------

## 2. 色彩系统 (Color Palette)

我们采用 **"Void High-Contrast"**（虚空高反差）配色方案。背景必须是纯黑，以最大化 OLED 屏幕的节能优势和沉浸感。

| **用途**      | **颜色名称**      | **Hex 代码** | **对应 Tailwind 类** | **应用场景**                               |
| ------------- | ----------------- | ------------ | -------------------- | ------------------------------------------ |
| **背景**      | **Void Black**    | `#050505`    | `bg-neutral-950`     | 全局背景，CRT 关闭时的颜色。               |
| **主色**      | **Neon Cyan**     | `#00f3ff`    | `text-cyan-400`      | 主文本、光标、正常状态的边框。             |
| **辅色**      | **Matrix Green**  | `#00ff41`    | `text-green-500`     | 成功提示 (Success)、经验值获得、代码雨。   |
| **警告**      | **Acid Yellow**   | `#f0ff00`    | `text-yellow-400`    | 警告信息、高亮关键词 (Tag)。               |
| **危险/故障** | **Glitch Red**    | `#ff003c`    | `text-red-500`       | 错误报错、生命值过低、不可逆操作（Burn）。 |
| **次要文本**  | **Titanium Grey** | `#3d3d3d`    | `text-neutral-700`   | 占位符、非激活状态的 UI 元素。             |

------

## 3. 排版系统 (Typography)

全站强制使用 **等宽字体 (Monospace)**，模拟终端机的输出效果。

- **Primary Font**: `JetBrains Mono` 或 `Space Mono` (Google Fonts)
  - *理由*: 极佳的可读性，带有“代码感”。
- **Heading Font**: `Orbitron` (仅用于 Logo 和极少数的大标题)
  - *理由*: 带有强烈的科幻几何感。

**字体样式规范**:

- **H1 (Page Title)**: Size 24px, Bold, Uppercase, Tracking-widest (字间距大).
- **Body (Log Text)**: Size 14px/16px, Regular.
- **Meta (Timestamp)**: Size 12px, Color: Titanium Grey.

------

## 4. 核心组件库 (Component Library)

### 4.1 容器：The Frame (神经框架)

- **外观**: 所有容器（Card, Input）使用 `1px` 实线边框。
- **装饰**: 边框的四角可以有特殊的“切角”设计，或者在左上角添加装饰性的 `[+]` 符号。
- **CSS 实现思路**:

.engram-card {

border: 1px solid #3d3d3d;

background: rgba(0, 0, 0, 0.8); /* 微微透出背景的代码雨 */ position: relative; } .engram-card::after { content: ''; position: absolute; top: -1px; left: -1px; width: 10px; height: 10px; border-top: 2px solid #00f3ff; /* 角落高亮 */

border-left: 2px solid #00f3ff;

}

\```

### 4.2 输入框：The Command Line (命令行)

这是用户与系统交互的核心。

- **状态**:
  - *Default*: 只有闪烁的光标 `_`。
  - *Typing*: 文本颜色为 `Neon Cyan`。
  - *Focus*: 输入框外围发光 (Glow Effect)。
- **前缀**: 始终显示 `user@sui:~$` 或简单的 `>`。
- **交互音效**: 每次按键播放轻微的机械键盘声（可选，需提供静音开关）。

### 4.3 按钮：The Trigger (触发器)

- **样式**: 纯文字按钮，带有 `[ ]` 包裹。例如 ``。
- **Hover 效果**:
  - 背景变为 `Neon Cyan`。
  - 文字变为 `Void Black`。
  - 瞬间的“位移”故障效果（向右偏移 2px 再回来）。

### 4.4 HUD 状态栏 (Head-Up Display)

- **血条/能量条**: 不使用圆角进度条。使用“分段式”方块。
  - `[■■■■■■■■□□]` (80%)
  - 每个方块之间有 `2px` 间距。

------

## 5. 特效与动效 (VFX & Motion)

### 5.1 背景：The Void Rain (虚空雨)

- 使用 `HTML5 Canvas` 在背景绘制下落的绿色或灰色字符（Matrix style）。
- **优化**: 字符不是随机的乱码，而是实时的 Log Hash（截取前8位）。这暗示了背景就是链上数据流。

### 5.2 故障效果 (Glitch Effect)

- **触发场景**: 页面加载时、数据上链中、获得成就时。
- **视觉**: RGB 色彩分离（红青偏移）、横向撕裂线。
- **CSS**: 使用 `clip-path` 动画或 `text-shadow` 偏移。

### 5.3 CRT 扫描线 (Scanlines)

- 在整个屏幕最上层覆盖一层半透明的横向纹理 `pointer-events-none`。
- 添加微弱的“屏幕闪烁 (Flicker)”动画，模拟旧式显示器的不稳定性。

------

## 6. 响应式布局策略 (Responsiveness)

- **Desktop**:
  - 三栏布局。左侧 HUD（固定），中间 Log Stream（滚动），右侧 Global Activity（代码雨）。
- **Mobile**:
  - 单栏流式布局。
  - HUD 折叠为顶部的一行紧凑状态条。
  - 键盘弹出时，输入框必须固定在键盘上方（Sticky），防止遮挡。

------

## 7. AI 生成辅助指令 (For Coding Assistant)

当你使用 Cursor 或 V0.dev 生成代码时，请附带以下 Style Instructions：

> "Use a cyberpunk aesthetics with a black background (#050505) and neon cyan (#00f3ff) accents. Use 'JetBrains Mono' for all text. Borders should be 1px solid with no border-radius. Buttons should invert colors on hover. Add a subtle CRT scanline overlay effect to the entire screen. The UI should feel like a retro-futuristic terminal interface."