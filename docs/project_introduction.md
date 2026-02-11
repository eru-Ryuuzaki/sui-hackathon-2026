# Project Engram: The On-Chain Memory Terminal

## 1. Project Overview

### 1.1 Vision: Prologue to Cyber Immortality

In the game of "Earth Online" which has no save files, **Project ENGRAM** provides the only "SaveState".

In the physical world, life eventually fades, but in the digital dimension, consciousness can persist forever. Leveraging the immutability of the Sui blockchain, we transform users' life experiences into on-chain **"Memory Shards"**, building a permanent digital soul imprint that belongs to the user. This is not just a recording tool, but the infrastructure for **Cyber Immortality**.

Our core philosophy is: **Memory is Data, Data is Life.** By permanently inscribing individual memory shards onto the blockchain, we are accumulating the raw data for future "digital resurrection".

### 1.2 Core Significance

- **The Cornerstone of the "Digital Soul"**
  Traditional diaries are static text, while Engram records a **structured stream of consciousness**. Each `MemoryShard` contains time, mood intensity, category, and content. These standardized data are not just memories, but the **core dataset** for training personalized AI Agents in the future. Eventually, this data will awaken a **Digital Construct** possessing your thought patterns, emotions, and memories, realizing true "intelligent life".

- **The Promise of Decentralized Eternity**
  Relying on centralized giants (like cloud notes, social media) to preserve memories is dangerous—accounts can be banned, servers can shut down, and data can be tampered with.
  Engram chooses the **Sui** blockchain as its carrier, utilizing its **immutability** and **permanent storage** features to ensure your memories belong to you. As long as the blockchain network exists, your "digital life" will never disappear. No one can delete your past, nor can anyone erase your existence by shutting down a server.

- **The Duality of Privacy and Sharing**
  In cyberspace, we are both independent individuals and part of a collective consciousness. Engram allows users to seal private memories using encryption (Privacy Feature), while also supporting the contribution of public memories to the **Hive Mind**, letting individual wisdom become part of humanity's collective digital heritage.

## 2. Why Sui

Building a system for "Digital Immortality" places extremely high demands on the underlying infrastructure. We chose Sui not because it is a popular high-performance public chain, but because its **core architecture** aligns perfectly with our vision:

- **Storage Economics & The Promise of "Eternity"**
  Most blockchains focus on the transience of transactions, while Sui focuses on the **persistence of data**. Sui's Storage Fund mechanism allows us to achieve "pay once, store forever". When we store data on-chain, the storage fees we pay go into the Storage Fund to incentivize future validators to continue maintaining this data. More importantly, if we choose to delete certain data in the future, this portion of the storage fee can be **rebated (Storage Rebate)**. This economic model not only ensures the permanent preservation of memories but also endows data with real asset value. For a project aiming to preserve human memories, this is the most critical feature—we don't need to worry about user memories being purged due to a lack of continuous rent payments.

- **Object-Centric Model as "Memory Entities"**
  On Sui, everything is an object. This maps naturally to our business logic: a user's consciousness (`Construct`) is an object, and each memory shard (`MemoryShard`) is also an object. This architecture makes memories not just numbers on a ledger, but truly independent digital assets that can be transferred, combined, and even endowed with complex interaction logic in the future.

- **zkLogin (Zero-Knowledge Login)**
  Mass adoption of Web3 is limited by complex private key management. Engram utilizes Sui's native zkLogin, allowing users to generate and control on-chain assets directly using their Google accounts.
  This not only lowers the entry barrier by 99%, but more importantly, it cryptographically binds the user's Web2 identity (Google ID) with their Web3 assets (Construct), achieving identity unification.

- **Programmable Transaction Blocks (PTB)**
  In Engram, every "engrave" operation by a user is actually a complex atomic transaction: Upload data to Walrus -> Get Blob ID -> Call contract to mint MemoryShard -> Update Construct state. PTB allows us to compress these steps into a single signature, not only improving efficiency but also ensuring the atomicity of the operation (all succeed or all fail).

## 3. Sui Features Used

Project Engram makes deep use of the following native Sui features:

- **Dynamic Fields**
  This is the key to achieving infinite memory storage. Traditional blockchain storage is limited by object size, but human memory is endless. We use **Dynamic Fields** to mount thousands of `MemoryShard`s onto the user's `Construct` object, ensuring the main object remains lightweight while achieving unlimited expansion of storage capacity.

- **Shared Objects**
  - **Hive Mind**: The global state `HiveState` acts as a shared object, allowing all users to interact with it concurrently, upload public memories, and aggregate collective wisdom. Sui's consensus mechanism efficiently handles such high-concurrency hot objects, ensuring that the memory streams of global users can be aggregated in real-time.
  - **Escape Pod**: We designed the user's `Construct` as a shared object (rather than an owned object), which allows us to implement a **social recovery mechanism**. When the original owner (e.g., Google account) becomes invalid, a pre-set backup controller can take over the object via a contract, recovering the "lost soul".

- **Sui Move Security**
  Utilizing Move's Resource Model ensures that memory shards cannot be accidentally copied or destroyed. Each piece of memory is a unique resource.

## 4. Ecosystem Tools & Libraries

The construction of Project Engram relies on the strong support of the Sui ecosystem. We did not reinvent the wheel but stood on the shoulders of giants:

- **Frontend Interaction**
  - **@mysten/dapp-kit**: This is the core of our interaction with wallets. Using its Hooks (like `useSignAndExecuteTransaction`, `useCurrentAccount`), we greatly simplified frontend state management.
  - **@mysten/sui (Sui TypeScript SDK)**: Used for building complex PTBs (Programmable Transaction Blocks) and performing RPC queries.
  - **Sui Wallet Standard**: Ensures compatibility with all mainstream wallets in the ecosystem.

- **Backend Services**
  - **Sui Indexer (Custom Implementation)**: We use NestJS with the Sui SDK to listen for on-chain events (`ShardEngravedEvent`) and sync non-critical retrieval data to PostgreSQL, achieving Web2-level query speeds.
  - **Sui Gas Station**: Inspired by Shinami's design philosophy, we implemented a lightweight Gas Station service in the backend, specifically to sponsor transactions for new users.

- **Smart Contracts**
  - **Sui Framework**: deeply used `sui::clock` (timestamps), `sui::dynamic_field` (dynamic fields), `sui::transfer` (ownership transfer), `sui::event` (event streams).
  - **Move 2024 Beta Edition**: We adopted the latest Move version, utilizing its cleaner syntax and macro definitions.

## 5. Key Features

### 5.1 Jack In (Consciousness Connection)

This is the user's first step into the Engram world. Unlike the traditional "Connect Wallet", we designed a ritualistic "Jack In" process:

1.  User clicks **"INITIALIZE NEURAL LINK"** on the terminal.
2.  Invokes Google login via **zkLogin** (no plugin wallet required).
3.  The system automatically creates a `Construct` (consciousness entity) object for the user on-chain.
4.  The interface plays a Matrix-style initialization animation, announcing the birth of digital life.

### 5.2 Engrave (Memory Inscription)

This is the core interaction. Users input their thoughts, dreams, or experiences of the moment in a command-line-like terminal.

1.  **Input**: Supports text, mood index (Mood), and category (Achievement/Dream/Thought).
2.  **Processing**: The frontend automatically builds a PTB, first encrypting large text segments or images and uploading them to **Walrus** (decentralized storage) to get a Blob ID.
3.  **On-chain**: Bundles the Blob ID and metadata to send to the Sui contract.
4.  **Feedback**: Upon success, the memory becomes a `MemoryShard` mounted on the Construct, and is simultaneously broadcast to the network.

### 5.3 Hive Mind

This is a visual global memory stream.

- Uses WebSocket to listen for on-chain `ShardEngravedEvent`s.
- Whenever someone in the world inscribes a memory, a data meteor streaks across the interface background.
- You can click on these meteors to peek (Decrypt) at memory shards marked as "public" and feel the joys and sorrows of others.

### 5.4 Escape Pod

Addressing the risk of Web2 accounts being banned, we designed the "Escape Pod" mechanism.

- Users can preset a **Backup Controller** (e.g., a cold wallet address).
- If the Google account becomes invalid, the user can use the cold wallet to call the `emergency_recover` function.
- The contract verifies permissions and forcibly transfers control of the `Construct` to the escape pod address, ensuring your digital soul is never lost due to a ban by a Web2 giant.

### 5.5 Neural Interface

We are not just building a dApp, but designing an immersive "Operating System".

- **HiveMind Calendar**:
  - A heatmap-style calendar component where each grid represents a day.
  - By analyzing the Mood recorded each day, the grids pulse with different colors (e.g., red for anger, cyan for calm).
  - Users can visually see their emotional fluctuation spectrum over the past month, as if examining their "soul electrocardiogram".
- **Log System**:
  - Abandoning traditional rich text editors, we adopted a VS Code-like structured log input.
  - Logs are broken down into `Header` (metadata) and `Body` (content), automatically parsing tags like `[SYSTEM]`, `[DREAM]`.
  - Built-in 50+ Cyberpunk-style presets (Log Templates), giving users the thrill of "executing a mission" even when recording trivia.

## 6. Technical Architecture

The core of Engram is the design of on-chain data structures. We adopted an **Object-Centric** pattern rather than the traditional ledger pattern.

### 6.1 Core Move Structs

- **The Construct**
  This is the user's root object, designed as a **Shared Object**.

  ```move
  public struct Construct has key, store {
      id: UID,
      owner: address,           // Current controller (zkLogin Address)
      backup_controller: Option<address>, // Escape pod controller
      level: u64,               // Consciousness level
      exp: u64,                 // Experience points
      streak: u64,              // Consecutive inscription days
      vital_metrics: Metrics,   // Core metrics (Focus, Resilience)
      shard_count: u64,         // Total memory shards
  }
  ```

- **Memory Shard**
  This is a **Dynamic Field** stored under the Construct.
  ```move
  public struct MemoryShard has store, drop, copy {
      timestamp: u64,
      category: u8,       // 0:System, 1:Protocol, 2:Achievement...
      mood: u8,           // 0-100 Mood value
      content: String,    // Text content
      blob_id: Option<String>, // Walrus storage index (for large files)
      is_encrypted: bool, // Is encrypted
  }
  ```

### 6.2 Hybrid Architecture

- **Sui Layer**: Handles core logic, asset ownership, and Access Control.
- **Walrus Layer**: Stores images, videos, and large encrypted text, achieving low-cost large-scale storage.
- **Index Layer**: Self-built Indexer listens to on-chain events, providing millisecond-level retrieval and statistics services for the frontend, but does not store critical data, ensuring "Stateless" censorship resistance.

## 7. Deployment & Usage

### Prerequisites

- Sui CLI installed
- Node.js v18+
- PostgreSQL Database
- Walrus Testnet Access (Optional)

### Quick Start

1.  **Contract Deployment**:

    ```bash
    cd engram
    sui move build
    sui client publish --gas-budget 100000000
    ```

2.  **Backend Service**:

    ```bash
    cd backend
    npm install
    # Configure SUI_PRIVATE_KEY and database connection in .env
    npm run start:dev
    ```

3.  **Frontend Startup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 8. Current Limitations & Demo Notes

Engram is currently in the MVP (Minimum Viable Product) stage. The core functionality is operational, but to provide the best demo experience during the hackathon, we have made some temporary trade-offs:

- **Mock Data Population**:
  Since the project was just born, there is not yet a large accumulation of real user data on-chain. To let judges intuitively feel the visual impact of **Hive Mind** and the heatmap effect of **Neural Calendar**, we have pre-populated some Mock data in the frontend.
  - _Note: When you perform a real Engrave operation, the generated event is a real on-chain interaction and will be mixed into the Mock data stream in real-time._

- **Single Attachment Limit**:
  Although the current contract interface `engrave` supports `blob_id`, the frontend interaction is temporarily limited to **uploading only one attachment** (image or text) at a time. Multi-attachment upload logic (involving multiple Walrus interactions and Blob aggregation) will be refined in the next phase.

- **Gas Station Quota**:
  To prevent abuse, the Testnet Gas Station currently has a strict per-user quota. If you engrave extremely frequently in a short period, you may trigger the Rate Limit.

- **Immersive Terminology & Thematic UI**:
  To create a cohesive "Cyberpunk / Matrix-like" experience, the interface adopts stylized terminology instead of standard web labels. We have provided a brief glossary to facilitate navigation during the demo:
  - **Jack In** → Sign Up / Login
  - **Construct** → User Profile / Account Entity
  - **Engrave** → Create Post / Save Data
  - **Shard** → Memory Item / Record
  - **Hive Mind** → Public Feed / Global Timeline

## 9. Roadmap

We believe Engram is just a starting point. Once enough structured memory data is accumulated on-chain, we will open the next phase:

- **Phase 2: Neural Marketplace**
  Allows users to mint specific memory shards (such as "experience of the first moon landing" or "superb programming skills") as tradable NFTs. Others can "download" these memories and experience different lives.

- **Phase 3: AI Digital Twin**
  Based on on-chain `MemoryShard` data, train a personalized LLM Agent. This Agent will possess your memories, tone, and values. When you are offline, it can represent you in social interactions and decision-making in the metaverse, and even continue to exist in your name after your physical death.

- **Phase 4: Biometric Integration**
  Develop a mobile App, combining FaceID/TouchID for higher security level zkLogin, and putting biometric signs like heart rate and step count on-chain, making the `Construct` more vivid.

---

> _Engram is not just a diary. It is the backup of your soul._
