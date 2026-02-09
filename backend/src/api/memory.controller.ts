import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MemoryShard } from '../entities/memory-shard.entity';

@ApiTags('Memory')
@Controller('api/memory')
export class MemoryController {
  constructor(
    @InjectRepository(MemoryShard)
    private shardRepo: Repository<MemoryShard>,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search memories' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    // Optimized search using Postgres full-text search (to_tsvector)
    return this.shardRepo.createQueryBuilder('shard')
      .leftJoinAndSelect('shard.construct', 'construct')
      .where("to_tsvector('english', shard.content) @@ plainto_tsquery('english', :query)", { query })
      .andWhere('shard.is_encrypted = :encrypted', { encrypted: false })
      .orderBy('shard.timestamp', 'DESC')
      .take(20)
      .getMany();
  }

  @Get(':construct_id')
  @ApiOperation({ summary: 'Get memories for a construct' })
  async getMemories(@Param('construct_id') constructId: string) {
    return this.shardRepo.find({
      where: { constructId },
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }
}
