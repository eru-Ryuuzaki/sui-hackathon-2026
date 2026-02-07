import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Construct } from '../entities/construct.entity';

@ApiTags('Construct')
@Controller('api/construct')
export class ConstructController {
  constructor(
    @InjectRepository(Construct)
    private constructRepo: Repository<Construct>,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get construct details' })
  async getConstruct(@Param('id') id: string) {
    const construct = await this.constructRepo.findOne({
      where: { id },
      relations: ['badges'],
    });
    if (!construct) {
      throw new NotFoundException('Construct not found');
    }
    return construct;
  }

  @Get('owner/:address')
  @ApiOperation({ summary: 'Get construct by owner address' })
  async getByOwner(@Param('address') address: string) {
    const construct = await this.constructRepo.findOne({
      where: { owner: address },
      relations: ['badges'],
    });
    if (!construct) {
      throw new NotFoundException('Construct not found for this address');
    }
    return construct;
  }
}
