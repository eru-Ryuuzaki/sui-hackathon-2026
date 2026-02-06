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

---

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

---

### 3. 产品功能需求 (Functional Requirements)

#### 3.1 接入层：混合神经链路 (Hybrid Neural Link)

- **功能**：**Jack In (登录)**。
- **实现**：
  - 默认使用 **zkLogin (Google OAuth)**，用户点击 "Link Neural Interface" (Google 按钮) 即可生成 **Construct**。
  - **逃生舱机制 (The Escape Pod)**：基于 **Shared Object** 架构。
    - **原理**：Construct 不再是地址独有的对象，而是带有 `owner` 字段的共享对象。
    - **操作**：用户可在设置页绑定一个备用地址 (Backup Controller)。若 zkLogin 账号丢失，可通过备用地址调用 `emergency_recover` 函数，强制接管 Construct 的所有权，实现无损重生。

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

#### 3.3 经济模型：普罗米修斯协议 (Project PROMETHEUS)

- **核心理念**：为了让 Subject 能够无缝接入系统，ENGRAM 启动了“普罗米修斯计划”，为新激活的 Construct 提供初始能源。
- **实现机制 (The Newbie Grant)**：
  - **激活判定**：当 Subject 首次通过 zkLogin 接入且链上余额为 0 时，触发 `System Initialization` 序列。
  - **自动充能**：后端服务验证身份后，自动向该地址发送 **0.01 SUI** 作为初始启动资金 (Starter Pack)。
  - **前端表现**：
    - 终端显示初始化日志：
      ```text
      > DETECTING NEURAL LINK... [OK]
      > ENERGY LEVEL CRITICAL... [REQUESTING GRANT]
      > ...
      > POWER RESTORED. ENERGY LEVEL: 100%
      ```
    - 用户感知不到“领水”过程，只觉得是系统启动成功。
- **能源管理 (Energy Bar)**：
  - 界面左下角常驻 **ENERGY** 进度条（对应 SUI 余额）。
  - 每次 Engrave 消耗微量 Energy。
  - **低能量预警**：当余额 < 0.002 SUI 时，进度条变红，并提示 `[RECHARGE REQUIRED]`，引导用户复制地址进行充值（法币充值入口作为 Future Feature）。

#### 3.4 资产协议：灵魂绑定 (Soulbound Protocol)

- **Construct (构造体)**：
  - `struct Construct has key` (无 store)。
  - **不可转移**。你的数字灵魂不能被买卖，只能被注销（Burn）。
- **Neural Badges (神经徽章)**：
  - `struct Badge has key` (无 store)。
  - 作为 Dynamic Object 挂载在 Construct 下。
  - **展示价值**：虽然不可交易，但用户可以生成一个只读的 `engram.link/u/subject_01` 页面，作为 Web3 时代的“人格证明”。

#### 3.4 资产协议：灵魂绑定 (Soulbound Protocol)

- **Construct (构造体)**：
  - `struct Construct has key` (无 store)。
  - **不可转移**。你的数字灵魂不能被买卖，只能被注销（Burn）。
- **Neural Badges (神经徽章)**：
  - `struct Badge has key` (无 store)。
  - 作为 Dynamic Object 挂载在 Construct 下。
  - **展示价值**：虽然不可交易，但用户可以生成一个只读的 `engram.link/u/subject_01` 页面，作为 Web3 时代的“人格证明”。

#### 3.5 全球同步：蜂巢意识 (Hive Mind)

- **功能**：展示全球 **Subject** 的实时活动。
- **实现**：
  - **Event Stream**: 利用 Sui 高性能事件系统 (ShardEngravedEvent)。
  - **Shared Object**: `HiveState` 仅用于统计全局计数 (Total Subjects/Shards)，避免高并发写入锁竞争。
  - **数据流**：前端监听 WebSocket 事件流，在首页背景实时渲染 "Matrix Code Rain" 效果：
    - `> [EVENT] Subject_0x8a...2f extracted a Memory Shard`

---

### 4. 技术架构与数据结构 (Technical Schema)

#### 4.1 Move 合约结构

```move
module engram::core {
    use std::string::{String};
    use std::option::{Option};
    use sui::object::{Self, UID};

    /// 核心构造体：用户的链上灵魂
    /// [Update]: 改为 Shared Object 以支持逃生舱机制
    struct Construct has key, store {
        id: UID,
        owner: address,           // 实际控制人
        backup_controller: Option<address>, // 逃生舱：备用控制人
        level: u64,
        exp: u64,
        vital_metrics: Metrics,
        shard_count: u64,
    }

    /// 记忆碎片
    struct MemoryShard has store, drop, copy {
        timestamp: u64,
        content: String,
        emotion_val: i8,
        category: u8,
        is_encrypted: bool, // [Update] 隐私开关
    }

    /// 神经徽章
    struct NeuralBadge has key, store {
        id: UID,
        name: String,
        description: String,
        rarity: u8,
        unlocked_at: u64
    }

    // [Update] 事件定义：用于 Hive Mind 数据流
    struct ShardEngravedEvent has copy, drop {
        subject: address,
        shard_id: u64,
        is_encrypted: bool,
    }
}
```

#### 4.3 后端服务架构 (Backend Architecture)

- **定位**：轻量级辅助服务，不保存用户私钥，仅负责公共资源调度。
- **技术栈**：Next.js API Routes (Serverless) + Redis (可选，用于限流)。
- **核心 API**:
  - `POST /api/faucet/claim`:
    - **Input**: `{ address: "0x...", jwt_token: "..." }`
    - **Logic**: 验证 Google JWT -> 检查该 Google Sub 是否已领过 -> 检查链上余额 -> 转账 0.01 SUI。
    - **Security**: 严格的 Rate Limit (单 IP 限制)，Google Sub 唯一性校验。
  - `GET /api/hive/status`:
    - **Input**: None
    - **Logic**: 缓存查询 `HiveState` 对象，减轻 RPC 压力。

#### 4.4 存储策略 (Storage Strategy)

- **文本 (Text)**: 100% On-Chain。利用 Sui 低廉的存储成本，确保记忆永存。
- **图片/媒体 (Media)**: **MVP 阶段不支持**。为了赶在 2/12 交付，我们砍掉图片上传功能，专注于文字的深邃感和 UI 的酷炫感。这符合“终端机”的设定。

#### 4.3 隐私与加密 (Privacy & Encryption)

- **可选加密**: 默认公开 (Public Manifesto)。用户可开启 "Private Mode"，此时：
  - 前端使用钱包公钥对 `content` 进行 ECIES 加密。
  - 链上仅存储 Ciphertext (密文)。
  - 仅持有私钥的 Subject 本人可在前端解密查阅。
  - **权衡**: 加密内容将失去 "Hive Mind" 的部分社交展示性，但在事件流中仍会显示 "[ENCRYPTED SHARD UPLOADED]"。

---

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

---

### 6. 风险规避 (Risk Mitigation)

- **Google 封号风险**：在 UI 显著位置提示“当前为托管模式，请勿存入大额资产”，并引导用户关注后续的“逃生舱”功能更新。
- **Sui 网络拥堵**：使用付费的专用 RPC 节点（如 Shinami 或 Blockvision），如果预算允许；否则在代码中增加重试逻辑。

---

**(文档结束)**
