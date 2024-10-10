import { Entity, PrimaryColumn, Unique } from 'typeorm';
import * as moment from 'moment';
import { Kline } from '../../kline.class';

@Entity('klines_ftr_usdm_1m')
export class KlineFUsdm1m extends Kline {

    @PrimaryColumn({
        type: 'varchar',
        length: 16,
        nullable: false,
        primaryKeyConstraintName: 'pk_klines_ftr_usdm_1m',
      })
      exchange: string;
    
      @PrimaryColumn({
        type: 'character',
        length: 24,
        primaryKeyConstraintName: 'pk_klines_ftr_usdm_1m',
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
        primaryKeyConstraintName: 'pk_klines_ftr_usdm_1m',
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
