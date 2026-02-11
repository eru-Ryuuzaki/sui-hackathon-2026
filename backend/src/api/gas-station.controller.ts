import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { GasStationService } from '../services/gas-station.service';

@Controller('gas')
export class GasStationController {
  constructor(private readonly gasStationService: GasStationService) {}

  @Post('sponsor')
  async sponsorTransaction(@Body() body: { txBytes: string; sender: string }) {
    if (!body.txBytes || !body.sender) {
      throw new BadRequestException('Missing txBytes or sender');
    }
    
    try {
        return await this.gasStationService.sponsorTransaction(body.txBytes, body.sender);
    } catch (e) {
        throw new BadRequestException(e.message);
    }
  }
}