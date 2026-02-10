import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoryShard } from '../entities/memory-shard.entity';

@Injectable()
export class MemoryService {
  constructor(
    @InjectRepository(MemoryShard)
    private shardRepo: Repository<MemoryShard>,
  ) {}

  async search(query: string, limit: number = 20): Promise<MemoryShard[]> {
    return this.shardRepo.createQueryBuilder('shard')
      .leftJoinAndSelect('shard.construct', 'construct')
      .where("to_tsvector('english', shard.content) @@ plainto_tsquery('english', :query)", { query })
      .andWhere('shard.is_encrypted = :encrypted', { encrypted: false })
      .orderBy('shard.timestamp', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByConstructId(constructId: string, limit: number = 50): Promise<MemoryShard[]> {
    return this.shardRepo.find({
      where: { constructId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
