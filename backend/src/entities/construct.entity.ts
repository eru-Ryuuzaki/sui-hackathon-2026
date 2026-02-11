import { Entity, Column, PrimaryColumn, OneToMany, Index } from 'typeorm';
import { MemoryShard } from './memory-shard.entity';
import { NeuralBadge } from './neural-badge.entity';

@Entity()
export class Construct {
  @PrimaryColumn()
  id: string; // Sui Object ID

  @Index()
  @Column()
  owner: string;

  @Column({ nullable: true })
  backup_controller: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'bigint', default: 0 })
  exp: string; // BigInt stored as string

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ type: 'int', default: 50 })
  focus: number;

  @Column({ type: 'int', default: 50 })
  resilience: number;

  @Column({ type: 'bigint', default: 0 })
  last_update: string;

  @Column({ type: 'int', default: 0 })
  shard_count: number;

  @OneToMany(() => MemoryShard, (shard) => shard.construct)
  shards: MemoryShard[];

  @OneToMany(() => NeuralBadge, (badge) => badge.construct)
  badges: NeuralBadge[];
}
