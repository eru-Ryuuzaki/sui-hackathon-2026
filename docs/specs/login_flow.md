# Project ENGRAM - 首次登录与身份识别设计方案

## 1. 概述 (Overview)
本文档详细描述了 Project ENGRAM 的首次登录识别与信息收集机制。旨在在不打断用户沉浸感的前提下，完成必要的用户信息收集。

## 2. 核心逻辑 (Core Logic)
- **身份判定**：采用 **方案 A (轻量级链下绑定)**。
  - 唯一标识：Wallet Address。
  - 判定规则：后端（或 Mock 的 LocalStorage）检查是否存在该 Address 的 `UserProfile`。若无，则视为新用户。
- **交互模式**：采用 **方案 X (终端对话式)**。
  - 利用现有的 Terminal 组件，通过“剧情对话”引导用户完成设置。
  - 拒绝传统的 Web2 弹窗，保持 Cyberpunk 叙事的一致性。

## 3. 详细流程 (Detailed Flow)

### 3.1 状态机 (State Machine)
引入全局状态 `LoginState`：
1.  **DISCONNECTED**: 钱包未连接。
2.  **CONNECTED_UNKNOWN**: 钱包已连接，但在数据库/本地存储中未找到记录。 -> **触发首次登录流程**。
3.  **CONNECTED_VERIFIED**: 钱包已连接，且已获取用户昵称/头像。 -> **进入正常操作模式**。

### 3.2 交互脚本 (The Script)

**场景**：用户点击 "Connect Wallet" 并授权成功后。

**Step 1: 系统检测**
终端清屏，显示系统日志：
```text
> [SYSTEM] NEURAL LINK ESTABLISHED.
> [SYSTEM] UNIDENTIFIED SIGNAL DETECTED.
> 
> PROTOCOL 101: IDENTIFY YOURSELF.
> PLEASE ENTER YOUR CODENAME:
> _
```
此时，底部的输入框锁定，仅接受昵称输入。

**Step 2: 用户输入**
用户输入 `Neo` 并回车。

**Step 3: 头像分配与确认**
系统根据地址哈希自动分配头像：
```text
> CODENAME "NEO" ACCEPTED.
> ASSIGNING RANDOM AVATAR... [################] 100%
> AVATAR #07 (CYBER_PUNK_V1) ASSIGNED.
>
> WELCOME TO THE VOID, NEO.
> TYPE 'HELP' TO BEGIN.
```
此时，HUD 左侧状态栏刷新，显示新头像和昵称。状态切换为 `CONNECTED_VERIFIED`。

## 4. 数据结构 (Data Structure)

### UserProfile (TypeScript Interface)
```typescript
interface UserProfile {
  address: string;      // 主键
  codename: string;     // 昵称
  avatarId: number;     // 头像ID (0-10)
  createdAt: number;    // 注册时间
  isNewUser: boolean;   // 是否为本次会话新注册（用于显示特效）
}
```

## 5. 技术实现 (Implementation)

### 5.1 前端 Mock 实现
在后端 API 就绪前，使用 `localStorage` 模拟数据库。
- Key: `engram_users`
- Value: `Record<Address, UserProfile>`

### 5.2 确定性随机算法
用于头像分配，确保同一地址每次登录分配到相同的默认头像。
```typescript
const avatarId = parseInt(address.slice(2, 8), 16) % TOTAL_AVATARS;
```

## 6. 后续扩展 (Future Scope)
- **阶段二**：在用户完成第 5 次 Engrave 时，侧边栏弹出提示，引导绑定 Twitter。
- **阶段三**：设置页提供完整的 Profile 编辑功能。
