# User Acquisition & Economic Strategy: "Sponsored Neural Link"

## 1. 核心理念：从 "Faucet" 到 "Gas Station"

在 ENGRAM 的迭代中，我们决定采用 Sui 原生的 **Sponsored Transaction (赞助交易)** 机制，替代传统的“水龙头 (Faucet)”直接转账。这一转变标志着我们从“Web3 原生思维”向“Web2 级别用户体验”的进化。

我们的目标是实现 **"Frictionless Onboarding" (无摩擦准入)**：用户只需通过 zkLogin (Google) 登录，无需理解什么是 Wallet、Gas 或 SUI，即可立即开始使用。

## 2. 战略价值：Sponsored Transaction 的多重优势

### A. 极致的无感体验 (Zero Friction)

- **旧模式**：注册 -> 等待 Faucet 到账 -> 签名交易 -> 扣除 Gas。
- **新模式**：注册 -> 签名交易 -> **系统代付 Gas**。
  用户感知的不是“我有钱了”，而是“这个应用竟然不需要钱就能玩”。这种体验上的震撼是黑客松中的杀手级亮点。

### B. 资产所有权与安全隔离 (Security & Isolation)

- **资产隔离**：赞助资金存放在后端的 Gas Station 钱包中，与用户的个人资产完全隔离。即使用户私钥泄露，黑客也无法盗取 Gas Station 的资金。
- **权限控制**：赞助者（后端）只能决定是否为某笔交易付款，**无法篡改**用户的交易内容（如刻录的记忆数据）。用户始终拥有对自己数据的绝对主权。

### C. 可视化的 "Energy" 系统

为了让用户感知到这份价值，我们将隐形的 Gas 抽象为 **"ENERGY" (神经能量)**。

- 用户在界面上看到的不是 `0.25 SUI`，而是 `ENERGY: 100% / 0.25 SUI`。
- 每次交互消耗 Energy，直观地展示“系统在为你赋能”。

## 3. 严格的限流与经济模型 (Strict Rate Limiting)

为了确保经济模型的可持续性，我们设计了基于 **"Total Lifetime Cap" (终身总额度)** 的严格限制策略，而非简单的每日重置。

### 策略：新手保护期 (Rookie Protection Period)

1.  **总量限制 (Total Cap)**：
    - 每个独立用户（基于 Address + Device Fingerprint）拥有 **0.25 SUI** 的终身免费赞助额度。
    - 这约等于 **50-100 笔** 标准交互（取决于网络拥堵状况）。

2.  **熔断机制 (Circuit Breaker)**：
    - 当用户的累计赞助 Gas 达到 0.25 SUI 上限时，Gas Station 将拒绝签名。
    - 前端将提示：`⚠️ NEURAL ENERGY DEPLETED. PLEASE RECHARGE.`
    - 此时用户必须自行充值 SUI，正式“毕业”成为付费用户。

3.  **防滥用设计**：
    - **交易白名单**：Gas Station 只赞助 `engram::create_log`, `engram::mint_badge` 等核心业务合约调用，严禁赞助 `sui::transfer` 等资产转移操作。
    - **异常检测**：若单个账户短时间内高频调用（如 1秒 5次），触发风控封锁。

## 4. 技术架构：Gas Station Service

我们将构建一个独立的微服务 `GasStationService`：

- **API**: `POST /api/gas/sponsor`
- **Input**: 未签名的 `TransactionBlock` (Bytes)。
- **Process**:
  1.  解析交易，验证调用的合约方法是否在白名单。
  2.  查询用户历史累计赞助额度。
  3.  若 `累计额度 < 0.25 SUI`，则使用 Sponsor Key 进行签名。
- **Output**: `SponsorSignature`。

## 5. 未来扩展：从补贴到自循环

长期的经济模型将从“单向补贴”转向“生态自循环”：

- **Energy Recovery (能量恢复)**：
  - 用户可以通过**社交邀请**、**高质量内容贡献**（被点赞/收藏）来恢复 Energy 额度，从而延长免费使用期。
- **Membership (会员制)**：
  - 引入 ENGRAM PLUS 订阅，每月支付少量 SUI，获得无限次 Gas 赞助特权。

---

_本文档阐述了 ENGRAM 采用 Sponsored Transaction 的战略考量，展示了我们在降低 Web3 门槛与保障经济安全之间的平衡艺术。_
