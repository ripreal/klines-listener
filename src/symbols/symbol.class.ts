import { PrimaryGeneratedColumn, Column, BeforeInsert, BaseEntity } from 'typeorm';
import { ExchangeEnum } from './entities/exhange.enum';

export class SymbolClass extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 24,
    transformer: {
      to(value) {
        return value;
      },
      from(value) {
        return value.trim();
      },
    },
    nullable: false,
  })
  symbol: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
  })
  exchange: ExchangeEnum;

  @Column({
    type: 'varchar',
    length: 16,
    transformer: {
      to(value) {
        return value;
      },
      from(value) {
        return value.trim();
      },
    },
    nullable: false,
  })
  quote: string;

  @Column({
    type: 'varchar',
    length: 16,
    transformer: {
      to(value) {
        return value;
      },
      from(value) {
        return value.trim();
      },
    },
    nullable: false,
  })
  base: string;

  currentprice: number;

  @Column({ type: 'numeric', precision: 26, scale: 8, nullable: true })
  quote_usdt_price: number;

  @Column({ type: 'numeric', nullable: true })
  circularsupply: number;

  @Column({
    type: 'character',
    length: 24,
    transformer: {
      to(value) {
        return value;
      },
      from(value) {
        return value.trim();
      },
    },
  })
  status: string;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ nullable: true })
  productname: string;

  @Column({ nullable: true })
  etf: boolean;

  @Column({ type: 'text', nullable: true })
  tags: string[] | any;

  @Column({ nullable: true })
  fullname: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  onboard_date: string;

  @Column({ type: 'numeric', nullable: true })
  marketcap: number;

  @Column({ type: 'timestamp', default: null })
  created_at: Date;

  @BeforeInsert()
  addCreated() {
    this.created_at = new Date();
  }
}
