import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';
import { EngraveDto } from '../dto/engrave.dto';

@Injectable()
export class SuiService implements OnModuleInit {
  private readonly logger = new Logger(SuiService.name);
  private client: SuiClient;
  private signer: Ed25519Keypair | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const network = this.configService.get<string>('SUI_NETWORK', 'testnet');
    let nodeUrl = this.configService.get<string>('SUI_NODE_URL');

    if (!nodeUrl) {
      nodeUrl = getFullnodeUrl(
        network as 'mainnet' | 'testnet' | 'devnet' | 'localnet',
      );
    }

    this.client = new SuiClient({ url: nodeUrl });

    // Sponsor Key (Used for Gas Station)
    const privateKey = this.configService.get<string>('SUI_FAUCET_PRIVATE_KEY');
    if (privateKey) {
      try {
        const { secretKey } = decodeSuiPrivateKey(privateKey);
        this.signer = Ed25519Keypair.fromSecretKey(secretKey);
      } catch (e) {
        this.logger.error('Failed to load sponsor key', e);
      }
    }
  }

  getSigner(): Ed25519Keypair | null {
    return this.signer;
  }

  getClient(): SuiClient {
    return this.client;
  }

  getPackageId(): string {
    return this.configService.get<string>('SUI_PACKAGE_ID', '');
  }
}
