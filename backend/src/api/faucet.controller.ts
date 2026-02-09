import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { SuiService } from '../sui/sui.service';

class ClaimFaucetDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  jwt_token: string;
}

@ApiTags('Faucet')
@Controller('faucet')
export class FaucetController {
  private readonly logger = new Logger(FaucetController.name);

  constructor(private suiService: SuiService) {}

  @Post('claim')
  @ApiOperation({ summary: 'Claim initial SUI for new users' })
  async claim(@Body() dto: ClaimFaucetDto) {
    // 1. Validate JWT (Mock for now)
    if (!dto.jwt_token) {
      throw new BadRequestException('Missing JWT token');
    }
    
    // 2. Check if address already claimed (Redis rate limit or DB check)
    // TODO: Implement check

    // 3. Transfer SUI
    try {
      // 0.01 SUI = 10_000_000 MIST
      const digest = await this.suiService.transferSui(dto.address, 10_000_000);
      return { status: 'success', digest };
    } catch (e) {
      this.logger.error(`Faucet claim failed for ${dto.address}`, e);
      throw new BadRequestException('Faucet claim failed');
    }
  }
}
