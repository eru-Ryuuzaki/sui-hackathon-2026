import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Construct } from './construct.entity';

@Entity()
export class NeuralBadge {
  @PrimaryColumn()
  id: string; // Sui Object ID

  @ManyToOne(() => Construct, (construct) => construct.badges)
  construct: Construct;

  @Column()
  constructId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'int' })
  rarity: number;

  @Column({ type: 'bigint' })
  unlocked_at: string;
}
