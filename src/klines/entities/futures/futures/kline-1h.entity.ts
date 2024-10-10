import { Entity, PrimaryColumn, Unique } from 'typeorm';
import { Kline } from '../../kline.class';
import * as moment from 'moment';

@Entity('klines_futures_1h')
export class KlineFutures1h extends Kline {

    @PrimaryColumn({
        type: 'varchar',
        length: 16,
        nullable: false,
        primaryKeyConstraintName: 'pk_klines_futures_1h',
      })
      exchange: string;
    
      @PrimaryColumn({
        type: 'character',
        length: 24,
        primaryKeyConstraintName: 'pk_klines_futures_1h',
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
        primaryKeyConstraintName: 'pk_klines_futures_1h',
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
