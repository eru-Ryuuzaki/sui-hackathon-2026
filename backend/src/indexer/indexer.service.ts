import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { SuiJsonRpcClient as SuiClient } from '@mysten/sui/jsonRpc';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { EventCursor } from '../entities/event-cursor.entity';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private suiClient: SuiClient;
  private packageId: string;

  constructor(
    @InjectRepository(Construct)
    private constructRepo: Repository<Construct>,
    @InjectRepository(MemoryShard)
    private shardRepo: Repository<MemoryShard>,
    @InjectRepository(EventCursor)
    private cursorRepo: Repository<EventCursor>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const { SuiJsonRpcClient, getJsonRpcFullnodeUrl } = await import('@mysten/sui/jsonRpc');

    const network = this.configService.get<string>('SUI_NETWORK', 'testnet');
    // Use JSON-RPC URL
    let nodeUrl = this.configService.get<string>('SUI_NODE_URL');
    if (!nodeUrl) {
        nodeUrl = getJsonRpcFullnodeUrl(network as any);
    }
    
    // @ts-ignore
    this.suiClient = new SuiJsonRpcClient({ url: nodeUrl });
    this.packageId = this.configService.get<string>('SUI_PACKAGE_ID', '');
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    if (!this.packageId || !this.suiClient) {
      return;
    }

    await this.indexEvents('ShardEngravedEvent', async (event) => {
      const { subject, construct_id, shard_id, timestamp, category, is_encrypted, content_snippet } = event.parsedJson as any;
      
      const shard = new MemoryShard();
      shard.constructId = construct_id;
      shard.shard_index = Number(shard_id);
      shard.timestamp = timestamp;
      shard.content = content_snippet;
      shard.emotion_val = 0;
      shard.category = category;
      shard.is_encrypted = is_encrypted;
      shard.tx_digest = event.id.txDigest;
      
      let construct = await this.constructRepo.findOne({ where: { id: construct_id } });
      if (!construct) {
        construct = new Construct();
        construct.id = construct_id;
        construct.owner = subject;
        await this.constructRepo.save(construct);
      }

      const existing = await this.shardRepo.findOne({ where: { tx_digest: event.id.txDigest } });
      if (!existing) {
        await this.shardRepo.save(shard);
        this.logger.log(`Indexed Shard ${shard_id} for Construct ${construct_id}`);
      }
    });

    await this.indexEvents('SubjectJackedInEvent', async (event) => {
      const { subject, construct_id, timestamp } = event.parsedJson as any;
      
      let construct = await this.constructRepo.findOne({ where: { id: construct_id } });
      if (!construct) {
        construct = new Construct();
        construct.id = construct_id;
        construct.owner = subject;
        construct.last_update = timestamp;
        await this.constructRepo.save(construct);
        this.logger.log(`Indexed New Construct ${construct_id} for ${subject}`);
      }
    });
  }

  private async indexEvents(eventType: string, handler: (event: any) => Promise<void>) {
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
        await handler(event);
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
