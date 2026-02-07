import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaucetController } from './faucet.controller';
import { HiveController } from './hive.controller';
import { MemoryController } from './memory.controller';
import { ConstructController } from './construct.controller';
import { TransactionController } from './transaction.controller';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { NeuralBadge } from '../entities/neural-badge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Construct, MemoryShard, NeuralBadge]),
  ],
  controllers: [
    FaucetController,
    HiveController,
    MemoryController,
    ConstructController,
    TransactionController,
  ],
})
export class ApiModule {}
