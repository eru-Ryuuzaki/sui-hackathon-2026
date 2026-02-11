import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndexerService } from './indexer.service';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { EventCursor } from '../entities/event-cursor.entity';
import { ConstructService } from '../services/construct.service';
import { ShardEngravedProcessor } from './processors/shard-engraved.processor';
import { SubjectJackedInProcessor } from './processors/subject-jacked-in.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Construct, MemoryShard, EventCursor])],
  providers: [
    IndexerService,
    ConstructService,
    ShardEngravedProcessor,
    SubjectJackedInProcessor,
  ],
})
export class IndexerModule {}
