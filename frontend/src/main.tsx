import React from 'react'
import ReactDOM from 'react-dom/client'
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getJsonRpcFullnodeUrl, JsonRpcHTTPTransport } from '@mysten/sui/jsonRpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import '@mysten/dapp-kit/dist/index.css'

const { networkConfig } = createNetworkConfig({
  devnet: { 
    transport: new JsonRpcHTTPTransport({ url: getJsonRpcFullnodeUrl('devnet') }),
    network: 'devnet'
  },
  testnet: { 
    transport: new JsonRpcHTTPTransport({ url: getJsonRpcFullnodeUrl('testnet') }),
    network: 'testnet'
  },
  mainnet: { 
    transport: new JsonRpcHTTPTransport({ url: getJsonRpcFullnodeUrl('mainnet') }),
    network: 'mainnet'
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
        <WalletProvider 
          autoConnect={true} 
          storageKey="engram_wallet_state"
          stashedWallet={{
            name: 'ENGRAM Stashed Wallet'
          }}
        >
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
