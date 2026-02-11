# Project ENGRAM: The On-Chain Memory Terminal
> *Immutable. Cyberpunk. Eternal.*

## 1. Executive Summary

**Project ENGRAM** is a decentralized application (DApp) built on the **Sui Blockchain** that reimagines the concept of a digital diary as a permanent, immutable "Memory Terminal." 

Set in a cyberpunk dystopian future where corporate servers are unreliable and censorship is rampant, ENGRAM offers "Subjects" (users) a way to upload their consciousness (memories) directly to the blockchain. By leveraging Sui's unique object model and the **Walrus Protocol** for decentralized storage, ENGRAM ensures that these memories are censorship-resistant and eternally preserved.

**Key Innovation:**
We bridge the gap between Web2 usability and Web3 philosophy by using **zkLogin** (Google Sign-In) and **Sponsored Transactions** (Gasless), allowing users to "Jack In" without owning a wallet or buying crypto, while secretly onboarding them into the Sui ecosystem.

---

## 2. Technical Architecture

The project follows a **Hybrid Decentralized Architecture**, utilizing Sui for logic/assets, Walrus for heavy data, and a lightweight Indexer for query performance.

### 2.1 The "Neural Link" (Frontend)
* **Framework**: React 18 + Vite + TypeScript
* **Styling**: Tailwind CSS + Custom WebGL Shaders (for Matrix Rain & CRT effects)
* **Key Components**:
    * **Identity Modal**: A "glitch-art" styled registration flow.
    * **Terminal Interface**: Command-line style input for "engraving" memories.
    * **Visualizers**: Real-time rendering of global activity (Hive Mind) using WebSocket events.

### 2.2 The "Core" (Sui Move Smart Contracts)
* **Package**: `engram`
* **Address**: (To be deployed)
* **Design Pattern**: Shared Object Model & Dynamic Fields

### 2.3 The "Cortex" (Backend & Indexer)
* **Framework**: NestJS (Node.js)
* **Database**: PostgreSQL (via TypeORM)
* **Role**: 
    * **Gas Station**: Relayer for sponsored transactions.
    * **Oracle/Salt Provider**: Deterministic salt generation for zkLogin.
    * **Indexer**: Listens to Sui events to power the "Search" and "Analytics" features.

---

## 3. Module Breakdown & Analysis

### 3.1 On-Chain Logic (`engram::core`)

The Move contract is the heart of the system, designed with **account abstraction** and **storage optimization** in mind.

#### **A. The Construct (User Identity)**
Instead of a simple profile, the user's identity is a **Shared Object** named `Construct`.
```move
public struct Construct has key, store {
    id: UID,
    owner: address,           
    backup_controller: Option<address>, // The "Escape Pod"
    level: u64,
    exp: u64,
    streak: u64,              
    vital_metrics: Metrics,
    shard_count: u64,
}
```
*   **Design Choice**: Why `Shared Object`?
    *   Standard "Owned Objects" are locked to a specific address. If a user loses their zkLogin (Google) access, the object is lost forever.
    *   By making it Shared, we implement an **"Escape Pod" (Emergency Recovery)** mechanism. The `backup_controller` (a cold wallet or trusted friend) can initiate a transaction to forcibly transfer ownership (`emergency_recover`) if the main account is compromised.

#### **B. Memory Shards (Data Storage)**
Memories are not stored in a `vector`. They are attached as **Dynamic Fields**.
```move
public struct MemoryShard has store, drop, copy {
    timestamp: u64,
    category: u8,       
    mood: u8,           
    content: String,    
    blob_id: Option<String>, // Pointer to Walrus Storage
    is_encrypted: bool, 
}
```
*   **Design Choice**: **Dynamic Fields vs. Vector**
    *   Vectors have size limits and increasing gas costs for deserialization.
    *   Dynamic Fields allow infinite scalability. A user can have 10,000 memories without increasing the gas cost of adding the 10,001st one.

#### **C. The Hive Mind (Global State)**
A singleton `HiveState` object tracks global statistics (Total Subjects, Total Memories).
*   **Gamification**: The `engrave` function calculates a "Daily Streak" on-chain. If the user posts every 24 hours, their `streak` counter increases, granting higher XP rewards.

---

### 3.2 Storage Strategy (Walrus Integration)

We do not store images or large text blobs directly on Sui (too expensive). Instead, we use **Walrus**.

1.  **Upload Phase**: Frontend uploads the file to a Walrus Publisher node via HTTP PUT.
2.  **Verification**: Walrus returns a `blob_id` (content-addressable hash).
3.  **Commitment**: This `blob_id` is passed to the `engram::engrave` Move function.
4.  **Result**: The blockchain holds the *proof of existence* and *ownership* (the NFT), while Walrus holds the *data*.

---

### 3.3 User Onboarding (Zero Friction)

We utilize **Sui zkLogin** and **Sponsored Transactions** to remove all barriers.

#### **A. Deterministic Salt Provider**
The backend (`ZkLoginController`) generates a salt based on the user's JWT `sub` (Subject ID) and a server-side `MASTER_SEED`.
*   **Benefit**: Users always get the same Sui Address when logging in with the same Google account, without needing to remember a separate password or seed phrase.

#### **B. Gas Station**
The backend (`GasStationController`) exposes a `/gas/sponsor` endpoint.
*   **Flow**:
    1.  Frontend builds a Transaction Block (PTB).
    2.  Frontend sends the transaction bytes to Backend.
    3.  Backend signs it with a "Sponsor Key" (paying the gas).
    4.  Frontend signs it with the User's zkLogin signature.
    5.  Transaction is executed.
*   **Result**: User pays $0 gas fees.

---

## 4. Why Sui? (Ecosystem Fit)

ENGRAM is impossible to build on other chains with the same level of UX/Security.

1.  **Storage Model**: Sui's storage rebate mechanism and low storage costs make it feasible to store thousands of text-based memories directly on-chain.
2.  **Programmable Transaction Blocks (PTB)**: We use PTBs to atomically "Upload to Walrus" (via client-side orchestration) and "Mint NFT" in a seamless flow. *Note: In the future, this can be even tighter.*
3.  **Object-Centricity**: The "Construct" as a mutable, evolving NFT that accumulates history (XP, Streak) is a perfect use case for Sui Objects.
4.  **Move Security**: The `backup_controller` logic leverages Move's strict ownership types to prevent unauthorized access while allowing authorized recovery.

---

## 5. Deployment & Setup

### Prerequisites
*   Sui CLI installed
*   Node.js v18+
*   PostgreSQL Database
*   Walrus Testnet Access

### Installation Steps

1.  **Contracts**:
    ```bash
    cd engram
    sui move build
    sui client publish --gas-budget 100000000
    ```
2.  **Backend**:
    ```bash
    cd backend
    npm install
    # Set .env with SUI_PRIVATE_KEY and DB_CREDENTIALS
    npm run start:dev
    ```
3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 6. Future Roadmap

*   **Phase 2**: **Neural Marketplace** - Allow users to "mint" specific memories as tradable NFTs (if they choose to make them public).
*   **Phase 3**: **AI Integration** - Use an on-chain LLM agent to analyze the user's "Memory Shards" and generate a psychological profile or "Digital Twin."
*   **Phase 4**: **Mobile App** - Native mobile wrapper with biometric zkLogin integration.
