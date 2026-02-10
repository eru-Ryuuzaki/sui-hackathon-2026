import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromB64 } from '@mysten/sui.js/utils';
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
        nodeUrl = getFullnodeUrl(network as 'mainnet' | 'testnet' | 'devnet' | 'localnet');
    }
    
    this.client = new SuiClient({ url: nodeUrl });

    const privateKey = this.configService.get<string>('SUI_FAUCET_PRIVATE_KEY');
    if (privateKey) {
      try {
        this.signer = Ed25519Keypair.fromSecretKey(fromB64(privateKey));
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

    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    tx.transferObjects([coin], tx.pure(to));

    const res = await this.client.signAndExecuteTransactionBlock({
      signer: this.signer,
      transactionBlock: tx,
    });

    return res.digest;
  }

  getPackageId(): string {
    return this.configService.get<string>('SUI_PACKAGE_ID', '');
  }

  async buildEngraveTransaction(dto: EngraveDto): Promise<string> {
    const tx = new TransactionBlock();
    tx.setSender(dto.sender);

    const packageId = this.getPackageId();
    const hiveId = this.configService.get<string>('HIVE_OBJECT_ID');

    if (!hiveId || !packageId) {
        throw new Error("Configuration missing: HIVE_OBJECT_ID or SUI_PACKAGE_ID");
    }

    tx.moveCall({
      target: `${packageId}::core::engrave`,
      arguments: [
        tx.object(dto.construct_id),
        tx.object(hiveId),
        tx.object('0x6'), // Clock
        tx.pure(dto.content),
        tx.pure(dto.emotion_val),
        tx.pure(dto.category),
        tx.pure(dto.is_encrypted),
        tx.pure(dto.blob_id ? [dto.blob_id] : []),
      ],
    });

    const txBytes = await tx.build({ client: this.client });
    return Buffer.from(txBytes).toString('base64');
  }
}
