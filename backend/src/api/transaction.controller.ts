import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import type { Transaction } from '@mysten/sui/transactions';
import { SuiService } from '../sui/sui.service';

class EngraveDto {
  @ApiProperty()
  sender: string;
  @ApiProperty()
  construct_id: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  emotion_val: number;
  @ApiProperty()
  category: number;
  @ApiProperty()
  is_encrypted: boolean;
  @ApiProperty()
  blob_id?: string;
}

@ApiTags('Transaction')
@Controller('api/transaction')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(private suiService: SuiService) {}

  @Post('engrave')
  @ApiOperation({ summary: 'Build engrave transaction' })
  async buildEngraveTx(@Body() dto: EngraveDto) {
    const { Transaction } = await import('@mysten/sui/transactions');
    const tx = new Transaction();
    tx.setSender(dto.sender);

    const packageId = this.suiService.getPackageId();
    
    // Arguments: construct, hive, clock, content, emotion, category, is_encrypted, blob_id
    // Need to get Hive Object ID. Assuming it's a known constant or env var.
    const hiveId = process.env.HIVE_OBJECT_ID; 

    if (!hiveId || !packageId) {
        throw new Error("Configuration missing");
    }

    tx.moveCall({
      target: `${packageId}::core::engrave`,
      arguments: [
        tx.object(dto.construct_id),
        tx.object(hiveId),
        tx.object('0x6'), // Clock
        tx.pure.string(dto.content),
        tx.pure.u8(dto.emotion_val),
        tx.pure.u8(dto.category),
        tx.pure.bool(dto.is_encrypted),
        tx.pure.option('string', dto.blob_id),
      ],
    });

    // Serialize
    const txBytes = await tx.build({ client: this.suiService.getClient() });
    return {
      tx_bytes: Buffer.from(txBytes).toString('base64'),
    };
  }
}
