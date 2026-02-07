import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { NeuralBadge } from '../entities/neural-badge.entity';

@ApiTags('Hive')
@Controller('api/hive')
export class HiveController {
  constructor(
    @InjectRepository(Construct)
    private constructRepo: Repository<Construct>,
    @InjectRepository(MemoryShard)
    private shardRepo: Repository<MemoryShard>,
    @InjectRepository(NeuralBadge)
    private badgeRepo: Repository<NeuralBadge>,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get global Hive Mind statistics' })
  async getStatus() {
    // In a real app, cache this with Redis
    const totalSubjects = await this.constructRepo.count();
    const totalShards = await this.shardRepo.count();
    const totalBadges = await this.badgeRepo.count();

    return {
      total_subjects: totalSubjects,
      total_shards: totalShards,
      total_badges_issued: totalBadges,
      timestamp: Date.now(),
    };
  }
}
