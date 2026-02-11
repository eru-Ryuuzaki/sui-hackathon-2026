import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HiveController } from './hive.controller';
import { MemoryController } from './memory.controller';
import { ConstructController } from './construct.controller';
import { ZkLoginController } from './zklogin.controller';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { MemoryService } from '../services/memory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Construct, MemoryShard]),
  ],
  controllers: [
    HiveController,
    MemoryController,
    ConstructController,
    ZkLoginController,
  ],
  providers: [MemoryService],
})
export class ApiModule {}
