import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class EventCursor {
  @PrimaryColumn()
  event_type: string;

  @Column()
  tx_digest: string;

  @Column()
  event_seq: string;
}
