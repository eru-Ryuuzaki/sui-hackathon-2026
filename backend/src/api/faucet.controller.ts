import { Controller, Post, Body, Ip, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { FaucetService } from '../services/faucet.service';
import { isValidSuiAddress } from '@mysten/sui.js/utils';

class ClaimDto {
  @ApiProperty({ description: 'Sui Wallet Address', example: '0x123...' })
  address: string;
}

@ApiTags('Faucet')
@Controller('faucet')
export class FaucetController {
  constructor(private readonly faucetService: FaucetService) {}

  @Post('claim')
  @ApiOperation({ summary: 'Claim initial SUI for new users (One-time only)' })
  async claim(@Body() body: ClaimDto, @Ip() ip: string) {
    if (!body.address || !isValidSuiAddress(body.address)) {
      throw new BadRequestException('Invalid Sui address provided.');
    }
    
    return await this.faucetService.claim(body.address, ip);
  }
}
