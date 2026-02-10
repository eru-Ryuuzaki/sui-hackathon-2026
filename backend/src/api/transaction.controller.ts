import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuiService } from '../sui/sui.service';
import { EngraveDto } from '../dto/engrave.dto';

@ApiTags('Transaction')
@Controller('api/transaction')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(private suiService: SuiService) {}

  @Post('engrave')
  @ApiOperation({ summary: 'Build engrave transaction' })
  async buildEngraveTx(@Body() dto: EngraveDto) {
    const txBytes = await this.suiService.buildEngraveTransaction(dto);
    return {
      tx_bytes: txBytes,
    };
  }
}
