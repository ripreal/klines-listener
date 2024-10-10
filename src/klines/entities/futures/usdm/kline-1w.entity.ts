import { Entity, PrimaryColumn, Unique } from 'typeorm';
import { Kline } from '../../kline.class';
import * as moment from 'moment';

@Entity('klines_ftr_usdm_1w')
export class KlineFUsdm1w extends Kline {
  @PrimaryColumn({
    type: 'varchar',
    length: 16,
    nullable: false,
    primaryKeyConstraintName: 'pk_klines_ftr_usdm_1w',
  })
  exchange: string;

  @PrimaryColumn({
    type: 'character',
    length: 24,
    primaryKeyConstraintName: 'pk_klines_ftr_usdm_1w',
    transformer: {
      to(value) {
        return value;
      },
      from(value) {
        return value.trim();
      },
    },
  })
  symbol: string;

  @PrimaryColumn({
    type: 'timestamp',
    primaryKeyConstraintName: 'pk_klines_ftr_usdm_1w',
    transformer: {
      to(value) {
        value.setMilliseconds(0)
        return value;
      },
      from(value) {
        return moment(value).unix() * 1000;
      },
    },
  })
  opened: Date;
}
