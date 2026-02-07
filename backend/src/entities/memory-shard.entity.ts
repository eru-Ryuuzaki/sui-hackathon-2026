import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Construct } from './construct.entity';

@Entity()
@Index(['construct', 'shard_index'], { unique: true })
export class MemoryShard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Construct, (construct) => construct.shards)
  construct: Construct;

  @Column()
  constructId: string;

  @Column({ type: 'int' })
  shard_index: number;

  @Column({ type: 'bigint' })
  timestamp: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int' })
  emotion_val: number;

  @Column({ type: 'int' })
  category: number;

  @Column({ default: false })
  is_encrypted: boolean;

  @Column({ nullable: true })
  blob_id: string;

  @Column()
  tx_digest: string;
}
