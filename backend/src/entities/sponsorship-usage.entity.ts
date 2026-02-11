import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['user_address'])
export class SponsorshipUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_address: string;

  @Column({ nullable: true })
  tx_digest: string; // Initially null, updated later if we track it

  @Column({ type: 'bigint' })
  gas_budget: string; // The budget we allocated/signed for

  @Column({ nullable: true })
  action_type: string; // e.g., 'engrave', 'jack_in'

  @CreateDateColumn()
  sponsored_at: Date;
}
