import { MemoryService } from '../services/memory.service';
export declare class MemoryController {
    private memoryService;
    constructor(memoryService: MemoryService);
    search(query: string): Promise<import("../entities/memory-shard.entity").MemoryShard[]>;
    getMemories(constructId: string): Promise<import("../entities/memory-shard.entity").MemoryShard[]>;
}
