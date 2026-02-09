import { Repository } from 'typeorm';
import { Construct } from '../entities/construct.entity';
import { MemoryShard } from '../entities/memory-shard.entity';
import { NeuralBadge } from '../entities/neural-badge.entity';
export declare class HiveController {
    private constructRepo;
    private shardRepo;
    private badgeRepo;
    constructor(constructRepo: Repository<Construct>, shardRepo: Repository<MemoryShard>, badgeRepo: Repository<NeuralBadge>);
    getStatus(): Promise<{
        total_subjects: number;
        total_shards: number;
        total_badges_issued: number;
        timestamp: number;
    }>;
}
