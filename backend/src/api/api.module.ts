import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HiveController } from './hive.controller';
import { MemoryController } from './memory.controller';
import { ConstructController } from './construct.controller';
import { ZkLoginController } from './zklogin.controller';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { SponsorshipUsage } from '../entities/sponsorship-usage.entity';
import { MemoryService } from '../services/memory.service';
import { GasStationService } from '../services/gas-station.service';
import { GasStationController } from './gas-station.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Construct, MemoryShard, SponsorshipUsage]),
  ],
  controllers: [
    GasStationController,
    HiveController,
    MemoryController,
    ConstructController,
    ZkLoginController,
  ],
  providers: [MemoryService, GasStationService],
})
export class ApiModule {}
