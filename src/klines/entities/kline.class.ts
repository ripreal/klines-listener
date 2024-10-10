import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryColumn,
} from 'typeorm';

export class Kline extends BaseEntity {

  // primaries are difened in ansectors
  exchange: string;
  symbol: string
  opened: Date;

  @Column({ type: 'numeric', precision: 26, scale: 8 })
  open_price: number;

  @Column({ type: 'numeric', precision: 26, scale: 8 })
  close_price: number;

  @Column({ type: 'numeric', precision: 26, scale: 8 })
  high_price: number;

  @Column({ type: 'numeric', precision: 26, scale: 8 })
  low_price: number;

  @Column({ type: 'numeric', nullable: true })
  volume: number;

  /*
  @Column({ type: 'timestamp', default: null })
  created: Date;

  @Column({ type: 'timestamp', default: null })
  updated: Date;

  @BeforeInsert()
  addCreated() {
    this.created = new Date();
  }

  @BeforeUpdate()
  addUpdated() {
    this.updated = new Date();
  }
  */
}
