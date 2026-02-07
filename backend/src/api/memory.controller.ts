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
    // Simple ILike search for now. 
    // For production, use Postgres tsvector:
    // .where("to_tsvector('english', content) @@ plainto_tsquery(:query)", { query })
    return this.shardRepo.find({
      where: {
        content: ILike(`%${query}%`),
        is_encrypted: false, // Don't search encrypted content
      },
      take: 20,
      order: { timestamp: 'DESC' },
      relations: ['construct'],
    });
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
