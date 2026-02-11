import { Injectable, Logger } from '@nestjs/common';
import { SuiService } from '../sui/sui.service';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SponsorshipUsage } from '../entities/sponsorship-usage.entity';

@Injectable()
export class GasStationService {
  private readonly logger = new Logger(GasStationService.name);

  // Hard cap: 0.25 SUI (in MIST)
  private readonly LIFETIME_CAP_MIST = 250_000_000;

  constructor(
    private suiService: SuiService,
    private configService: ConfigService,
    @InjectRepository(SponsorshipUsage)
    private usageRepo: Repository<SponsorshipUsage>,
  ) {}

  /**
   * Sponsor a transaction block
   * @param txBytes Base64 encoded transaction block bytes from client
   * @param senderAddress User's address
   */
  async sponsorTransaction(txBytes: string, senderAddress: string) {
    // 1. Check Usage Limit
    const currentUsage = await this.getUsage(senderAddress);
    if (currentUsage >= this.LIFETIME_CAP_MIST) {
      this.logger.warn(
        `User ${senderAddress} exceeded gas cap. Usage: ${currentUsage}`,
      );
      throw new Error('NEURAL_ENERGY_DEPLETED');
    }

    // 2. Deserialize Transaction
    let tx: TransactionBlock;
    try {
      tx = TransactionBlock.from(txBytes);
    } catch (e) {
      throw new Error('INVALID_TRANSACTION_BYTES');
    }

    // 3. Validate Transaction (Whitelist)
    const packageId = this.configService.get<string>('SUI_PACKAGE_ID');
    const moduleName = 'core'; // Core module
    const allowedTargets = [
      `${packageId}::${moduleName}::engrave`,
      `${packageId}::${moduleName}::jack_in`,
      `${packageId}::${moduleName}::set_backup_controller`,
    ];

    const blockData = tx.blockData;
    // Iterate over all transactions in the block
    for (const command of blockData.transactions) {
      if (command.kind !== 'MoveCall') {
        this.logger.warn(
          `Blocked non-MoveCall transaction from ${senderAddress}`,
        );
        throw new Error('TRANSACTION_NOT_ALLOWED: Only Move calls allowed');
      }

      // Check target
      const target = command.target;
      if (!allowedTargets.includes(target)) {
        this.logger.warn(
          `Blocked unauthorized target ${target} from ${senderAddress}`,
        );
        throw new Error(
          `TRANSACTION_NOT_ALLOWED: Target ${target} not in whitelist`,
        );
      }
    }

    // 4. Set Gas Payment
    const signer = this.suiService.getSigner();
    if (!signer) {
      throw new Error('GAS_STATION_OFFLINE');
    }
    const sponsorAddress = signer.toSuiAddress();
    const client = this.suiService.getClient();

    tx.setSender(senderAddress);
    tx.setGasOwner(sponsorAddress);

    // Preliminary Coin Selection (Need at least one coin to dry run)
    // We select a coin with ample balance just for the simulation
    const coins = await client.getCoins({
      owner: sponsorAddress,
      coinType: '0x2::sui::SUI',
    });

    if (coins.data.length === 0) {
      throw new Error('GAS_STATION_EMPTY');
    }

    // Pick a random coin to reduce collision in MVP
    // We assume this coin has enough balance for Dry Run (usually true for sponsor wallets)
    const dryRunCoin =
      coins.data[Math.floor(Math.random() * coins.data.length)];
    tx.setGasPayment([
      {
        objectId: dryRunCoin.coinObjectId,
        version: dryRunCoin.version,
        digest: dryRunCoin.digest,
      },
    ]);

    // Set a temporary high budget for Dry Run to ensure it passes
    tx.setGasBudget(50_000_000);

    // 5. Dry Run & Estimate Gas
    const dryRunBytes = await tx.build({ client });
    const dryRunResult = await client.dryRunTransactionBlock({
      transactionBlock: dryRunBytes,
    });

    if (dryRunResult.effects.status.status !== 'success') {
      this.logger.warn(`Dry Run Failed: ${dryRunResult.effects.status.error}`);
      throw new Error('TRANSACTION_SIMULATION_FAILED');
    }

    // Calculate Real Gas Budget
    // formula: (computationCost + storageCost - storageRebate) * 1.2 buffer
    const gasUsed = dryRunResult.effects.gasUsed;
    const computationCost = parseInt(gasUsed.computationCost);
    const storageCost = parseInt(gasUsed.storageCost);
    const storageRebate = parseInt(gasUsed.storageRebate);

    // We need to cover at least computation + storage. Rebate is returned to user/sponsor, but we need to put it up front.
    // Safe Budget = (Computation + Storage) * 1.5 Safety Factor
    const estimatedCost = computationCost + storageCost;
    const SAFE_BUDGET = Math.ceil(estimatedCost * 1.5);

    // Re-Check Usage Limit with REAL Budget
    if (currentUsage + SAFE_BUDGET >= this.LIFETIME_CAP_MIST) {
      this.logger.warn(
        `User ${senderAddress} insufficient energy for estimated cost ${SAFE_BUDGET}`,
      );
      throw new Error('NEURAL_ENERGY_INSUFFICIENT');
    }

    // 6. Apply Real Budget & Payment
    tx.setGasBudget(SAFE_BUDGET);

    // Re-select coin ensuring it covers the specific SAFE_BUDGET
    const validCoins = coins.data.filter(
      (c) => parseInt(c.balance) > SAFE_BUDGET,
    );
    if (validCoins.length === 0) {
      throw new Error('GAS_STATION_FRAGMENTED');
    }
    const paymentCoin =
      validCoins[Math.floor(Math.random() * validCoins.length)];
    tx.setGasPayment([
      {
        objectId: paymentCoin.coinObjectId,
        version: paymentCoin.version,
        digest: paymentCoin.digest,
      },
    ]);

    // Build the bytes for signing
    const buildBytes = await tx.build({ client });

    // Sign
    const { signature } = await signer.signTransactionBlock(buildBytes as any);

    // 7. Record Usage (Scheme B: DB Storage)
    // We assume the transaction WILL be submitted.
    const usage = new SponsorshipUsage();
    usage.user_address = senderAddress;
    usage.gas_budget = SAFE_BUDGET.toString();
    usage.action_type = 'unknown';

    // Safety check for target access
    const firstTx = blockData.transactions[0];
    if (firstTx && firstTx.kind === 'MoveCall') {
      const parts = firstTx.target.split('::');
      if (parts.length >= 3) {
        usage.action_type = parts[2];
      }
    }

    await this.usageRepo.save(usage);
    this.logger.log(
      `Sponsored ${usage.action_type} for ${senderAddress}. Est. Cost: ${estimatedCost}, Budget: ${SAFE_BUDGET}`,
    );

    return {
      txBytes: Buffer.from(buildBytes).toString('base64'),
      sponsorSignature: signature,
    };
  }

  private async getUsage(address: string): Promise<number> {
    const result = await this.usageRepo
      .createQueryBuilder('usage')
      .select('SUM(usage.gas_budget)', 'total')
      .where('usage.user_address = :address', { address })
      .getRawOne();

    return result.total ? parseInt(result.total) : 0;
  }
}
