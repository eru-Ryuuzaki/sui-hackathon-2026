import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndexerService } from './indexer.service';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { NeuralBadge } from '../entities/neural-badge.entity';
import { EventCursor } from '../entities/event-cursor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Construct, MemoryShard, NeuralBadge, EventCursor]),
  ],
  providers: [IndexerService],
})
export class IndexerModule {}
