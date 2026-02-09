import { MemoryShard } from './memory-shard.entity';
import { NeuralBadge } from './neural-badge.entity';
export declare class Construct {
    id: string;
    owner: string;
    backup_controller: string;
    level: number;
    exp: string;
    streak: number;
    energy: string;
    focus: number;
    resilience: number;
    last_update: string;
    shard_count: number;
    shards: MemoryShard[];
    badges: NeuralBadge[];
}
