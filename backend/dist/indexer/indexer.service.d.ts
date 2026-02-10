import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventCursor } from '../entities/event-cursor.entity';
import { ShardEngravedProcessor } from './processors/shard-engraved.processor';
import { SubjectJackedInProcessor } from './processors/subject-jacked-in.processor';
export declare class IndexerService implements OnModuleInit {
    private cursorRepo;
    private configService;
    private shardEngravedProcessor;
    private subjectJackedInProcessor;
    private readonly logger;
    private suiClient;
    private packageId;
    private processors;
    constructor(cursorRepo: Repository<EventCursor>, configService: ConfigService, shardEngravedProcessor: ShardEngravedProcessor, subjectJackedInProcessor: SubjectJackedInProcessor);
    onModuleInit(): Promise<void>;
    handleCron(): Promise<void>;
    private indexEvents;
}
