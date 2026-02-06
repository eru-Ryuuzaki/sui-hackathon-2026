# Project ENGRAM: 链上记忆终端 (The On-Chain Memory Terminal)

## —— 2026 Vibe Sui Hackathon 参赛执行文档

### 1. 执行摘要 (Executive Summary)

**项目代号**：ENGRAM (印痕)

**文档日期**：2026年2月6日

**交付截止**：2026年2月12日 (6天冲刺)

**核心愿景**：

在“地球 Online”这场没有存档的游戏中，**Project ENGRAM** 提供了唯一的“即时存档 (SaveState)”。我们利用 Sui 区块链的不可篡改性，将用户的生命体验转化为链上的 **“记忆碎片 (Memory Shards)”**，构建一个永久的、属于用户的数字灵魂印痕。

**核心差异化**：

1. **叙事升级**：从“日记”升级为“记忆提取与刻录”。
2. **技术原生**：深度利用 Sui 的 Object 模型，实现无限扩容的链上存储。
3. **极致体验**：结合 zkLogin 与 PTB，实现 Web2 般的丝滑入场与交互。

------

### 2. 核心概念字典 (The Engram Lexicon)

为了强化品牌心智，全站文案将进行如下替换：

| **原概念 (Generic)** | **ENGRAM 概念 (Cyberpunk)**  | **定义与隐喻**                                             |
| -------------------- | ---------------------------- | ---------------------------------------------------------- |
| 用户 (User)          | **Subject (实验体/主体)**    | 每一个使用系统的人都是正在经历人生实验的主体。             |
| 账号 (Account/NFT)   | **Construct (构造体)**       | 你的链上化身，承载你所有属性的容器 (Soulbound Object)。    |
| 日记 (Log)           | **Memory Shard (记忆碎片)**  | 具体的某一段经历，被提取并结晶化的数据块 (Dynamic Field)。 |
| 属性 (Stats)         | **Vital Metrics (生命指标)** | 生命力、精力、专注度等实时状态。                           |
| 成就 (Achievement)   | **Neural Badge (神经徽章)**  | 行为模式触发的永久性烙印 (Soulbound Token)。               |
| 登录 (Login)         | **Jack In (接入)**           | 连接到 Engram 网络的动作。                                 |

------

### 3. 产品功能需求 (Functional Requirements)

#### 3.1 接入层：混合神经链路 (Hybrid Neural Link)

- **功能**：**Jack In (登录)**。
- **实现**：
  - 默认使用 **zkLogin (Google OAuth)**，用户点击 "Link Neural Interface" (Google 按钮) 即可生成 **Construct**。
  - **逃生舱机制 (The Escape Pod)**：在设置页提供“绑定备用密钥”选项。允许 Subject 将一个传统的助记词钱包添加为多签控制者，防止 Google 封号导致的人格丢失。

#### 3.2 核心交互：记忆刻录 (Shard Engraving)

- **界面**：纯黑背景的终端窗口 (Terminal)，光标闪烁。
- **输入指令**：
  - `> engrave "今天完成了Hackathon的核心代码，感觉肾上腺素飙升 #coding"`
- **链上逻辑 (PTB 原子化交易)**：
  1. **Mint Shard**: 将文本内容打包为 `Memory Shard` 结构体。
  2. **Attach**: 使用 `dynamic_field::add` 将 Shard 挂载到 **Construct** 的 ID 下。
  3. **Update Metrics**: 消耗 Energy，增加 EXP。
  4. **Check Badges**: 自动检测是否满足“连续刻录”条件，若满足，铸造 **Neural Badge**。
- **反馈**：
  - 屏幕瞬间闪烁绿色代码雨。
  - 显示：` MEMORY SHARD #402 SECURED ON-CHAIN.`

#### 3.3 资产协议：灵魂绑定 (Soulbound Protocol)

- **Construct (构造体)**：
  - `struct Construct has key` (无 store)。
  - **不可转移**。你的数字灵魂不能被买卖，只能被注销（Burn）。
- **Neural Badges (神经徽章)**：
  - `struct Badge has key` (无 store)。
  - 作为 Dynamic Object 挂载在 Construct 下。
  - **展示价值**：虽然不可交易，但用户可以生成一个只读的 `engram.link/u/subject_01` 页面，作为 Web3 时代的“人格证明”。

#### 3.4 全球同步：蜂巢意识 (Hive Mind)

- **功能**：展示全球 **Subject** 的实时活动。
- **实现**：
  - **Shared Object**: `HiveState`。
  - **数据流**：前端轮询 `HiveState`，在首页背景滚动显示匿名日志哈希：
    - `> Subject_0x8a...2f extracted a Memory Shard`
    - `> Subject_0x1c...99 upgraded to Level 7`

------

### 4. 技术架构与数据结构 (Technical Schema)

#### 4.1 Move 合约结构

代码段

```
module engram::core {
    use sui::object::{Self, UID};
    use std::string::{String};

    /// 核心构造体：用户的链上灵魂
    struct Construct has key { // 注意：没有 store，灵魂绑定
        id: UID,
        level: u64,
        exp: u64,
        vital_metrics: Metrics,
        shard_count: u64, // 用于生成下一个 Shard 的 Key
    }

    /// 记忆碎片：存储在动态字段中的内容
    struct MemoryShard has store, drop, copy {
        timestamp: u64,
        content: String, // 纯文本上链
        emotion_val: i8, // -100 to 100
        category: u8,
    }

    /// 神经徽章：成就 NFT
    struct NeuralBadge has key {
        id: UID,
        name: String,
        rarity: u8,
        unlocked_at: u64
    }
}
```

#### 4.2 存储策略 (Storage Strategy)

- **文本 (Text)**: 100% On-Chain。利用 Sui 低廉的存储成本，确保记忆永存。
- **图片/媒体 (Media)**: **MVP 阶段不支持**。为了赶在 2/12 交付，我们砍掉图片上传功能，专注于文字的深邃感和 UI 的酷炫感。这符合“终端机”的设定。

------

### 5. 6天极速冲刺计划 (The Crunch Sprint)

**当前时间**：2月6日

**目标**：2月12日上线 + 提交视频

- **Day 1 (2.07): The Kernel (合约)**
  - 编写 `engram::core` 模块。
  - 重点测试 `Construct` 的不可转移性和 `Memory Shard` 的动态字段挂载。
  - 部署 Devnet/Testnet。
- **Day 2 (2.08): The Interface (前端 & zkLogin)**
  - 搭建 Next.js + Tailwind 项目。
  - 集成 `@mysten/zklogin`。实现 "Jack In with Google"。
  - **关键点**：处理好 Salt 的本地缓存，确保存档不丢失。
- **Day 3 (2.09): The Link (交互)**
  - 联调 PTB。实现“输入 -> 签名 -> 上链”全流程。
  - 解决 RPC 读取延迟问题，前端先做“假成功”动画，后台再确认。
- **Day 4 (2.10): The Aesthetic (视觉)**
  - **Cyberpunk UI 注入**：
    - 字体：`Space Mono` 或 `Courier Prime`。
    - 特效：CRT 扫描线 CSS，文字输入的打字机效果。
    - Logo：将新设计的 ENGRAM Logo 放入首页。
- **Day 5 (2.11): The Polish (打磨)**
  - 实现 `Hive Mind` 全球动态流（读取 Shared Object）。
  - **录制 Demo 视频**：
    - 脚本：“In a world of ephemeral data, only ENGRAM is forever.” -> 展示 Google 登录 -> 快速输入 -> 链上确认。
- **Day 6 (2.12): Launch**
  - 部署 Vercel。
  - 提交 Hackathon 表单。

------

### 6. 风险规避 (Risk Mitigation)

- **Google 封号风险**：在 UI 显著位置提示“当前为托管模式，请勿存入大额资产”，并引导用户关注后续的“逃生舱”功能更新。
- **Sui 网络拥堵**：使用付费的专用 RPC 节点（如 Shinami 或 Blockvision），如果预算允许；否则在代码中增加重试逻辑。

------

**(文档结束)**