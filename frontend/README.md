# Project ENGRAM - Frontend

## Introduction
The On-Chain Memory Terminal. A cyberpunk-themed interface for interacting with the Sui blockchain to store memory shards.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 3 (Void High-Contrast Theme)
- **Web3**: @mysten/dapp-kit, @mysten/sui
- **Icons**: Lucide React

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure
- `src/components/ui`: Core UI components (Card, Button, Input) adhering to the design system.
- `src/pages`: Page components.
- `src/contracts`: Types and bindings for the Move contract.
- `src/hooks`: Custom React hooks.
- `src/styles`: Global styles.

## Design System
The UI follows the "Void High-Contrast" theme:
- Background: Void Black (#050505)
- Text: Neon Cyan (#00f3ff)
- Fonts: JetBrains Mono / Space Mono
- Effects: Matrix Rain, Scanlines, Glitch

## Web3 Integration
Configured for Devnet, Testnet, and Mainnet using `@mysten/dapp-kit`.
Supports wallet connection (Sui Wallet, etc.).
