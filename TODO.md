# Project ENGRAM - 待开发功能列表 (TODO)

由于智能合约尚未部署，以下功能暂时使用 Mock 数据或占位逻辑，待合约上线后需进行对接。

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
