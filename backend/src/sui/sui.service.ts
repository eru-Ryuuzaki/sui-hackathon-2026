import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SuiJsonRpcClient as SuiClient } from '@mysten/sui/jsonRpc';
import type { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

@Injectable()
export class SuiService implements OnModuleInit {
  private readonly logger = new Logger(SuiService.name);
  private client: SuiClient;
  private signer: Ed25519Keypair | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const { SuiJsonRpcClient, getJsonRpcFullnodeUrl } = await import('@mysten/sui/jsonRpc');
    const { Transaction } = await import('@mysten/sui/transactions');
    // Note: If Ed25519Keypair is needed, import it dynamically too.
    // const { Ed25519Keypair } = await import('@mysten/sui/keypairs/ed25519');

    const network = this.configService.get<string>('SUI_NETWORK', 'testnet');
    let nodeUrl = this.configService.get<string>('SUI_NODE_URL');
    if (!nodeUrl) {
        nodeUrl = getJsonRpcFullnodeUrl(network as any);
    }
    
    // @ts-ignore
    this.client = new SuiJsonRpcClient({ url: nodeUrl });

    const privateKey = this.configService.get<string>('SUI_FAUCET_PRIVATE_KEY');
    if (privateKey) {
      try {
         // Placeholder for key loading
      } catch (e) {
        this.logger.error('Failed to load faucet key', e);
      }
    }
  }

  getClient(): SuiClient {
    return this.client;
  }

  async transferSui(to: string, amount: number): Promise<string> {
    if (!this.signer) {
      throw new Error('Faucet signer not configured');
    }

    // Dynamic import for Transaction class
    const { Transaction } = await import('@mysten/sui/transactions');

    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.transferObjects([coin], to);

    const res = await this.client.signAndExecuteTransaction({
      signer: this.signer,
      transaction: tx,
    });

    return res.digest;
  }

  getPackageId(): string {
    return this.configService.get<string>('SUI_PACKAGE_ID', '');
  }
}
