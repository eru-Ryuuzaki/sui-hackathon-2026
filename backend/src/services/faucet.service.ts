import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { FaucetRecord } from '../entities/faucet-record.entity';
import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';

@Injectable()
export class FaucetService {
  private readonly logger = new Logger(FaucetService.name);
  private suiClient: SuiClient;
  private adminKeypair: Ed25519Keypair;
  
  // Claim Amount: 0.25 SUI
  private readonly CLAIM_AMOUNT_SUI = 0.25;
  private readonly CLAIM_AMOUNT_MIST = 250_000_000; // 0.25 * 10^9

  constructor(
    @InjectRepository(FaucetRecord)
    private faucetRepo: Repository<FaucetRecord>,
    private configService: ConfigService,
  ) {
    // Initialize Sui Client
    const network = this.configService.get<string>('SUI_NETWORK') || 'testnet';
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network as any) });

    // Initialize Admin Keypair
    const privateKey = this.configService.get<string>('SUI_FAUCET_PRIVATE_KEY');
    if (!privateKey) {
      this.logger.warn('SUI_FAUCET_PRIVATE_KEY is not set. Faucet service will not work.');
    } else {
      try {
        const { secretKey } = decodeSuiPrivateKey(privateKey);
        this.adminKeypair = Ed25519Keypair.fromSecretKey(secretKey);
        this.logger.log(`Faucet Admin initialized: ${this.adminKeypair.getPublicKey().toSuiAddress()}`);
      } catch (e) {
        this.logger.error('Failed to load Faucet Private Key', e);
      }
    }
  }

  async claim(address: string, ipAddress?: string): Promise<{ status: string; txHash: string; amount: number }> {
    if (!this.adminKeypair) {
      throw new InternalServerErrorException('Faucet service is not configured correctly.');
    }

    // 1. Check if already claimed
    const existing = await this.faucetRepo.findOne({ where: { address } });
    if (existing) {
      throw new BadRequestException(`Address ${address} has already claimed the faucet.`);
    }

    // 2. Perform Transfer (MOCKED FOR DEV)
    let txDigest = 'MOCK_TX_HASH_' + Date.now();
    /* 
    // REAL TRANSFER LOGIC - UNCOMMENT WHEN READY
    try {
      const tx = new TransactionBlock();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(this.CLAIM_AMOUNT_MIST)]);
      tx.transferObjects([coin], tx.pure(address));

      const result = await this.suiClient.signAndExecuteTransactionBlock({
        signer: this.adminKeypair,
        transactionBlock: tx,
      });

      txDigest = result.digest;
      this.logger.log(`Faucet transfer success: ${txDigest} -> ${address}`);
    } catch (e) {
      this.logger.error(`Faucet transfer failed for ${address}`, e);
      throw new InternalServerErrorException('Failed to execute on-chain transfer.');
    }
    */
    this.logger.warn(`[MOCK MODE] Faucet transfer simulated: ${txDigest} -> ${address}`);

    // 3. Record in DB
    const record = this.faucetRepo.create({
      address,
      amount: this.CLAIM_AMOUNT_SUI,
      tx_hash: txDigest,
      ip_address: ipAddress,
    });
    await this.faucetRepo.save(record);

    return {
      status: 'success',
      txHash: txDigest,
      amount: this.CLAIM_AMOUNT_SUI,
    };
  }
}
