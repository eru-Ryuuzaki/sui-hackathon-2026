import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { EventCursor } from '../entities/event-cursor.entity';
import { EventProcessor } from './processors/event-processor.interface';
import { ShardEngravedProcessor } from './processors/shard-engraved.processor';
import { SubjectJackedInProcessor } from './processors/subject-jacked-in.processor';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private suiClient: SuiClient;
  private packageId: string;
  private processors: EventProcessor[];

  constructor(
    @InjectRepository(EventCursor)
    private cursorRepo: Repository<EventCursor>,
    private configService: ConfigService,
    private shardEngravedProcessor: ShardEngravedProcessor,
    private subjectJackedInProcessor: SubjectJackedInProcessor,
  ) {
    this.processors = [shardEngravedProcessor, subjectJackedInProcessor];
  }

  async onModuleInit() {
    const network = this.configService.get<string>('SUI_NETWORK', 'testnet');
    let nodeUrl = this.configService.get<string>('SUI_NODE_URL');
    
    if (!nodeUrl) {
        nodeUrl = getFullnodeUrl(network as 'mainnet' | 'testnet' | 'devnet' | 'localnet');
    }
    
    this.suiClient = new SuiClient({ url: nodeUrl });
    this.packageId = this.configService.get<string>('SUI_PACKAGE_ID', '');
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    if (!this.packageId || !this.suiClient) {
      return;
    }

    for (const processor of this.processors) {
      await this.indexEvents(processor);
    }
  }

  private async indexEvents(processor: EventProcessor) {
    const eventType = processor.getEventType();
    const fullType = `${this.packageId}::core::${eventType}`;
    
    let cursor = await this.cursorRepo.findOne({ where: { event_type: fullType } });
    let txDigest = cursor ? cursor.tx_digest : undefined;
    let eventSeq = cursor ? cursor.event_seq : undefined;

    try {
      const events = await this.suiClient.queryEvents({
        query: { MoveEventType: fullType },
        cursor: txDigest && eventSeq ? { txDigest, eventSeq } : undefined,
        limit: 50,
      });

      for (const event of events.data) {
        await processor.process(event);
      }

      if (events.hasNextPage && events.nextCursor) {
        if (!cursor) {
          cursor = new EventCursor();
          cursor.event_type = fullType;
        }
        cursor.tx_digest = events.nextCursor.txDigest;
        cursor.event_seq = events.nextCursor.eventSeq;
        await this.cursorRepo.save(cursor);
      }
    } catch (e) {
      this.logger.error(`Error indexing ${eventType}: ${e}`);
    }
  }
}
