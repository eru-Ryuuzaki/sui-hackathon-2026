import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaucetController } from './faucet.controller';
import { HiveController } from './hive.controller';
import { MemoryController } from './memory.controller';
import { ConstructController } from './construct.controller';
import { ZkLoginController } from './zklogin.controller';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { NeuralBadge } from '../entities/neural-badge.entity';
import { FaucetRecord } from '../entities/faucet-record.entity';
import { MemoryService } from '../services/memory.service';
import { FaucetService } from '../services/faucet.service';
import { GasStationService } from '../services/gas-station.service';
import { GasStationController } from './gas-station.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Construct, MemoryShard, NeuralBadge, FaucetRecord]),
  ],
  controllers: [
    FaucetController,
    GasStationController,
    HiveController,
    MemoryController,
    ConstructController,
    ZkLoginController,
  ],
  providers: [
    MemoryService,
    FaucetService,
    GasStationService,
  ],
})
export class ApiModule {}
