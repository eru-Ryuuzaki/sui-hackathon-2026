import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { EventCursor } from '../entities/event-cursor.entity';
export declare class IndexerService implements OnModuleInit {
    private constructRepo;
    private shardRepo;
    private cursorRepo;
    private configService;
    private readonly logger;
    private suiClient;
    private packageId;
    constructor(constructRepo: Repository<Construct>, shardRepo: Repository<MemoryShard>, cursorRepo: Repository<EventCursor>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    handleCron(): Promise<void>;
    private indexEvents;
}
