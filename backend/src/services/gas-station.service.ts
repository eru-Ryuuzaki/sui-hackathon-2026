import { Injectable, Logger } from '@nestjs/common';
import { SuiService } from '../sui/sui.service';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// We'll need a new entity to track sponsorship usage
// import { SponsorshipUsage } from '../entities/sponsorship-usage.entity';

@Injectable()
export class GasStationService {
  private readonly logger = new Logger(GasStationService.name);
  
  // Hard cap: 0.25 SUI (in MIST)
  private readonly LIFETIME_CAP_MIST = 250_000_000; 

  constructor(
    private suiService: SuiService,
    private configService: ConfigService,
    // @InjectRepository(SponsorshipUsage)
    // private usageRepo: Repository<SponsorshipUsage>,
  ) {}

  /**
   * Sponsor a transaction block
   * @param txBytes Base64 encoded transaction block bytes from client
   * @param senderAddress User's address
   */
  async sponsorTransaction(txBytes: string, senderAddress: string) {
    // 1. Check Usage Limit
    // TODO: Implement DB check
    const currentUsage = 0; // await this.getUsage(senderAddress);
    if (currentUsage >= this.LIFETIME_CAP_MIST) {
        throw new Error('NEURAL_ENERGY_DEPLETED');
    }

    // 2. Deserialize Transaction
    const tx = TransactionBlock.from(txBytes);
    
    // 3. Validate Transaction (Whitelist)
    // For MVP, we skip deep inspection, but in prod we must inspect tx.blockData
    
    // 4. Set Gas Payment
    // We need the sponsor signer from SuiService
    const signer = this.suiService.getSigner();
    if (!signer) {
        throw new Error('GAS_STATION_OFFLINE');
    }
    const sponsorAddress = signer.toSuiAddress();
    
    tx.setSender(senderAddress);
    tx.setGasOwner(sponsorAddress);
    
    // Set Budget (e.g. 0.01 SUI)
    tx.setGasBudget(10_000_000); 

    // 5. Sign
    // Note: In @mysten/sui.js, we need to build the transaction to get the bytes to sign
    // However, the client sent us the bytes. We need to apply gas config and re-build.
    
    const client = this.suiService.getClient();
    
    // Get Sponsor's Coins for Gas Payment
    const coins = await client.getCoins({
        owner: sponsorAddress,
        coinType: '0x2::sui::SUI'
    });
    
    if (coins.data.length === 0) {
        throw new Error('GAS_STATION_EMPTY');
    }
    
    // Naive coin selection: pick first one with enough balance
    const paymentCoin = coins.data.find(c => parseInt(c.balance) > 10_000_000);
    if (!paymentCoin) {
         throw new Error('GAS_STATION_FRAGMENTED');
    }
    
    tx.setGasPayment([{ objectId: paymentCoin.coinObjectId, version: paymentCoin.version, digest: paymentCoin.digest }]);

    // Build the bytes for signing
    const buildBytes = await tx.build({ client });
    
    // Sign
    // TS Error: Object literal may only specify known properties, and 'transactionBlock' does not exist in type 'Uint8Array'.
    // This implies signTransactionBlock expects Uint8Array as the first argument, NOT an object.
    // This happens in some versions of the SDK where the signature is (transactionBlock: Uint8Array | TransactionBlock)
    
    const { signature } = await signer.signTransactionBlock(buildBytes as any);

    return {
        txBytes: Buffer.from(buildBytes).toString('base64'),
        sponsorSignature: signature
    };
  }
}