# Project ENGRAM - 待开发功能列表 (TODO)

由于智能合约尚未部署，以下功能暂时使用 Mock 数据或占位逻辑，待合约上线后需进行对接。

## 0. 用户身份与首次登录 (User Identity & Onboarding)

- [ ] **首次登录流程 (First Contact Protocol)**:
  - [ ] 状态管理：实现 `LoginState` (Disconnected / Connected_Unknown / Connected_Verified)。
  - [ ] 终端交互：实现“打字机风格”的昵称输入与头像分配流程。
  - [ ] 头像生成：基于地址 Hash 的确定性随机头像分配算法。
  - [ ] 数据持久化：暂时使用 `localStorage` 模拟后端存储。
- [ ] **zkLogin 集成 (Google OAuth)**:
  - [ ] 申请 Google Cloud `CLIENT_ID` 并配置 OAuth 凭证。
  - [ ] 替换 `LoginSelector.tsx` 中的 Mock 逻辑为真实 OAuth 跳转。
  - [ ] 集成 `@mysten/zklogin` SDK 生成零知识证明。

## 1. 智能合约集成 (Smart Contract Integration)

- [ ] **合约部署**:
  - [ ] 部署 `engram::core` 模块到 Sui Testnet/Mainnet。
  - [ ] 获取 `Package ID`, `HiveState Object ID`, `TreasuryCap Object ID` 等关键配置。
  - [ ] 更新前端 `src/contracts/config.ts` 中的常量配置。

- [ ] **核心交易功能 (PTB Construction)**:
  - [ ] **Jack In (登录/注册)**: 实现 `jack_in` 函数的 Programmable Transaction Block (PTB) 构建与签名调用。
  - [ ] **Engrave (刻录)**: 实现 `engrave` 函数的 PTB，处理 `content`, `emotion_val`, `category` 等参数。
  - [ ] **Emergency Recover (逃生舱)**: 实现 `emergency_recover` 函数调用。

- [ ] **数据读取 (On-Chain Data Fetching)**:
  - [ ] **Construct 状态**: 根据用户地址查询其拥有的 `Construct` 对象，获取 Energy (余额), EXP, Level 等数据。
  - [ ] **Badge 查询**: 查询挂载在 `Construct` 下的 `NeuralBadge` 动态字段。
  - [ ] **Hive Mind**: 读取全局共享对象 `HiveState` 的统计数据。

- [ ] **事件监听 (Event Indexing)**:
  - [ ] 监听 `ShardEngravedEvent` 实现全网动态流 (Matrix Rain)。
  - [ ] 监听 `SubjectJackedInEvent`。

## 2. Walrus 协议集成 (Storage)

- [ ] **文件上传**:
  - [ ] 实现文件选择与读取。
  - [ ] 对文件进行客户端加密 (ECIES)。
  - [ ] 上传至 Walrus Aggregator 获取 `Blob ID`。
- [ ] **文件下载**:
  - [ ] 根据 `Blob ID` 从 Walrus 读取数据。
  - [ ] 客户端解密并展示。

## 3. 后端服务 (Next.js API)

- [ ] **Faucet 服务**:
  - [ ] 实现 `/api/faucet/claim` 接口，为新用户自动分发 Gas 费。
  - [ ] 集成 Google OpenID 校验。

## 4. 生产环境优化

- [ ] **RPC 优化**: 替换公共 RPC 节点为专用节点 (Shinami/Blockvision)。
- [ ] **SEO & Metadata**: 配置 Open Graph 标签。

## 5. 数据结构与逻辑优化 (Refinement)

- [x] **数据对齐**: 已修复前端 `category` (string -> u8) 和 `mood` (string -> u8) 的映射逻辑，与 Move 合约定义对齐。
- [x] **交易参数**: 已修复 `engrave` 函数的 PTB 构建，显式添加了 `media_type` 参数。
- [ ] **多附件支持 (Optional)**:
  - [ ] 当前方案仅支持单附件 (`blob_id: Option<String>`)。
  - [ ] 若未来需支持多图，需修改 Move 合约 `MemoryShard` 结构体为 `vector<String>` 并处理迁移。
  - [ ] 前端 `AttachmentUploader` 已支持多选，但提交逻辑目前仅取第一个。
- [ ] **Mood 映射优化**: 当前 `MOOD_MAP` 覆盖了基础 Emoji，需根据最终 UI 确定的 Mood 列表进行完善。

## 6. 未来规划 (Future Roadmap)

- [ ] **成就系统 (Achievements / NeuralBadge)**:
  - [ ] 恢复并实现 `NeuralBadge` 合约逻辑 (目前已从 `core.move` 中移除)。
  - [ ] 实现 `check_and_mint_badge` 逻辑 (如：First Awakening, 7-Day Streak)。
  - [ ] 前端展示用户获得的徽章。
  - [ ] 后端索引徽章数据。
