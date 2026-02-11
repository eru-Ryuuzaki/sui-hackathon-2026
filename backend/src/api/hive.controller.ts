import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';

@ApiTags('Hive')
@Controller('hive')
export class HiveController {
  constructor(
    @InjectRepository(Construct)
    private constructRepo: Repository<Construct>,
    @InjectRepository(MemoryShard)
    private shardRepo: Repository<MemoryShard>,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get global Hive Mind statistics' })
  async getStatus() {
    // In a real app, cache this with Redis
    const totalSubjects = await this.constructRepo.count();
    const totalShards = await this.shardRepo.count();

    return {
      total_subjects: totalSubjects,
      total_shards: totalShards,
      timestamp: Date.now(),
    };
  }
}
