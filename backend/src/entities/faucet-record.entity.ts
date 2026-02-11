import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('faucet_records')
export class FaucetRecord {
  @PrimaryColumn()
  address: string; // Wallet Address

  @Column({ type: 'decimal', precision: 20, scale: 9 })
  amount: number; // SUI Amount

  @Column()
  tx_hash: string; // Transaction Digest

  @Column({ nullable: true })
  ip_address: string; // Optional Risk Control

  @CreateDateColumn()
  claimed_at: Date;
}
