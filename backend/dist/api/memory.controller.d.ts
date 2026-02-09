import { Repository } from 'typeorm';
import { MemoryShard } from '../entities/memory-shard.entity';
export declare class MemoryController {
    private shardRepo;
    constructor(shardRepo: Repository<MemoryShard>);
    search(query: string): Promise<MemoryShard[]>;
    getMemories(constructId: string): Promise<MemoryShard[]>;
}
