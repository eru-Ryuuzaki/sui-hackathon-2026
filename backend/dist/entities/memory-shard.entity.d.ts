import { Construct } from './construct.entity';
export declare class MemoryShard {
    id: string;
    construct: Construct;
    constructId: string;
    shard_index: number;
    timestamp: string;
    content: string;
    emotion_val: number;
    category: number;
    is_encrypted: boolean;
    blob_id: string;
    tx_digest: string;
}
