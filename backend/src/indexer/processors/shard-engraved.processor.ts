import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuiEvent } from '@mysten/sui.js/client';
import { EventProcessor } from './event-processor.interface';
import { MemoryShard } from '../../entities/memory-shard.entity';
import { ConstructService } from '../../services/construct.service';

@Injectable()
export class ShardEngravedProcessor implements EventProcessor {
  private readonly logger = new Logger(ShardEngravedProcessor.name);

  constructor(
    @InjectRepository(MemoryShard)
    private shardRepo: Repository<MemoryShard>,
    private constructService: ConstructService,
  ) {}

  getEventType(): string {
    return 'ShardEngravedEvent';
  }

  async process(event: SuiEvent): Promise<void> {
    const { subject, construct_id, shard_id, timestamp, category, mood, is_encrypted, content_snippet, media_type } = event.parsedJson as any;

    await this.constructService.findOrCreate(construct_id, subject);

    const existing = await this.shardRepo.findOne({ where: { tx_digest: event.id.txDigest } });
    if (!existing) {
      const shard = new MemoryShard();
      shard.constructId = construct_id;
      shard.shard_index = Number(shard_id);
      shard.timestamp = timestamp;
      shard.content = content_snippet;
      shard.emotion_val = mood;
      shard.category = category;
      shard.is_encrypted = is_encrypted;
      shard.media_type = media_type;
      shard.tx_digest = event.id.txDigest;

      await this.shardRepo.save(shard);
      this.logger.log(`Indexed Shard ${shard_id} for Construct ${construct_id}`);
    }
  }
}
