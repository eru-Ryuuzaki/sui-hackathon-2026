# 数据访问策略：链上/链下混合架构设计

## 1. 执行摘要 (Executive Summary)

在构建 ENGRAM 时，我们面临一个经典的 Web3 架构挑战：如何在保持**去中心化数据主权**（Web3 的核心承诺）的同时，提供**毫秒级的查询响应和富媒体体验**（Web2 的用户期望）。

纯链上架构（Full On-Chain）虽然纯粹，但在处理复杂查询（如“筛选包含图片的历史记录”）时会导致严重的性能瓶颈；而纯中心化架构（Full Off-Chain）则违背了“数据属于用户”的初衷。

ENGRAM 采用**“链上作为真理源 (Source of Truth)，链下作为性能层 (Performance Layer)”**的双层架构。核心策略是：
*   **资产上链**：所有核心数据（内容哈希、情感值、媒体类型）必须在 Sui 链上永久存储。
*   **索引加速**：后端服务充当“高性能缓存”，仅通过监听链上事件构建查询视图，不持有任何私有状态。

这种设计确保了：即使 ENGRAM 的所有服务器关闭，用户依然可以通过区块链浏览器或第三方工具完整还原自己的记忆数据。

## 2. Web3 的“元数据悖论” (The Metadata Paradox)

在集成去中心化存储（如 Walrus）时，我们识别出了一个关键的痛点，我们称之为“元数据悖论”。

### 2.1 盲盒数据问题
当用户上传一张照片到 Walrus，得到一个 `Blob ID`。如果我们将这个 ID 存入链上，却不存储它的 `media_type`（如 `image/png`），链上数据实际上变成了一个“盲盒”。
- **后果**：任何第三方（或未来的自己）在没有后端数据库辅助的情况下，面对这个 Blob ID 将束手无策——它是文本？是图片？还是加密数据？
- **结论**：**解释性元数据 (Interpretative Metadata) 必须与资产本身一同上链**。

### 2.2 列表查询的性能黑洞
假设用户有 1000 条日记，前端需要展示“我的相册”（只看图片）。
- **纯链上做法**：前端必须并发请求 1000 个 Sui 对象，逐个检查字段。这会造成巨大的网络拥塞和页面卡顿。
- **纯后端做法**：后端存储 `media_type`。但这带来了“数据不一致”风险，且一旦后端丢失数据，链上数据将永久失去可筛选性。

## 3. 架构决策："Cache-First" 模式

为了解决上述悖论，我们实施了 **Cache-First Indexing Pattern**。

### 3.1 核心原则
1.  **Write to Chain (写链)**：所有的状态变更（包括 `media_type`）必须首先发生在 Sui 链上。
2.  **Read from Cache (读缓存)**：前端的列表展示、筛选、搜索操作，100% 走后端索引 API。
3.  **Verify on Load (加载验证)**：在查看单条详情或进行高价值操作时，前端直接与链上数据比对（可选），确保数据未被篡改。

### 3.2 数据流向图
```mermaid
graph LR
    User[用户] -->|1. Engrave (media_type)| Sui[Sui Blockchain]
    Sui -->|2. Emit Event| Indexer[后端 Indexer]
    Indexer -->|3. Sync| DB[(Postgres DB)]
    User -->|4. Query List| API[后端 API]
    API -->|5. Return JSON| User
```

## 4. 实施细节 (Implementation Details)

### 4.1 合约层改造 (`core.move`)
为了支持索引器，我们在 `engrave` 函数和 `ShardEngravedEvent` 事件中显式增加了元数据字段：
*   **`media_type: Option<String>`**：明确标识内容类型（MIME Type）。
*   **`is_granted: bool`**：链上防女巫标记（虽然后端有 Gas Station，但链上状态是最后一道防线）。

### 4.2 后端索引器 (`IndexerService`)
后端不再作为“数据库”，而是作为“链上状态的镜像”。
*   监听 `ShardEngravedEvent`。
*   将事件中的 `media_type`、`mood`、`timestamp` 同步到 `MemoryShard` 表。
*   **冗余剔除**：删除了后端的 `energy` 字段，因为它是纯动态的链上资产，无需在后端缓存。

## 5. API Design Specification

为了支撑上述混合架构，我们重新设计了后端 API，使其专注于**查询优化**和**Gas 赞助**。

### 5.1 记忆列表查询 (List Memories)
*   **Endpoint**: `GET /api/memories`
*   **Query Params**:
    *   `construct_id`: 目标角色 ID (必填)
    *   `limit`: 每页数量 (默认 20，最大 100)
    *   `cursor`: 分页游标 (上次返回的最后一条 ID)
    *   `type`: 筛选媒体类型 (如 `image`, `video`, `text`)
*   **Response (Lightweight)**:
    ```json
    {
      "data": [
        {
          "id": "shard_obj_id",
          "timestamp": 1715421234000,
          "mood": 80,
          "media_type": "image/png", // 关键筛选字段
          "is_encrypted": true
          // 注意：不返回 content，减少列表页带宽消耗
        }
      ],
      "next_cursor": "shard_obj_id_last"
    }
    ```

### 5.2 记忆详情查询 (Get Memory Detail)
*   **Endpoint**: `GET /api/memories/:id`
*   **Response (Full)**:
    ```json
    {
      "id": "shard_obj_id",
      "content": "EncryptedStringOrPlainText...",
      "blob_id": "walrus_blob_id",
      "tx_digest": "5A2...",
      "proof": { ... } // 可选：用于前端验证的 Merkle Proof
    }
    ```
*   **Client-Side Logic**: 前端获取详情后，可选择调用 `sui_getObject(id)` 直接与链上数据比对，确保内容未被后端篡改。

### 5.3 Gas Station (Sponsor Transaction)
*   **Endpoint**: `POST /api/gas/sponsor`
*   **Body**: `{ "tx_bytes": "Base64String..." }`
*   **Process**:
    1.  解析 `tx_bytes`。
    2.  验证合约调用是否在白名单 (`engrave`, `jack_in`)。
    3.  检查用户额度。
    4.  使用 Sponsor Key 签名。
*   **Response**: `{ "signature": "Base64String..." }`

## 6. Security & Trust Implications

### 6.1 抗审查性 (Censorship Resistance)
本架构最大的优势在于**灾难恢复能力**。
*   **场景**：假设 ENGRAM 后端服务被关停或数据库损毁。
*   **对策**：前端应用内置“直连模式 (Direct-to-Chain Mode)”。当 API 请求超时，前端自动切换逻辑，直接遍历链上的 `Construct` 对象及其 `Dynamic Fields`。
*   **结果**：虽然列表加载速度会变慢（从毫秒级变为秒级），但**用户数据依然完全可用**，没有任何丢失。

### 6.2 隐私保护 (Privacy)
*   **端到端加密**：对于标记为 `is_encrypted=true` 的内容，在上传到链上/Walrus 之前就已经在客户端完成了加密。
*   **盲态存储**：后端数据库和链上节点存储的都是密文。即便数据库管理员也无法窥探用户记忆。

### 6.3 防作弊与经济安全 (Anti-Gaming)
*   **双重验证**：
    *   **Layer 1 (Contract)**: `is_granted` 状态确保每个 ID 只能领取一次新手奖励。
    *   **Layer 2 (Backend)**: Gas Station 限制每个设备指纹/IP 的总 Gas 消耗额度，防止羊毛党通过创建大量小号耗尽赞助资金。

