import { ExchangeRepo } from 'src/@exchanges/interfaces/exchange.interface';
import { KlineSpot15m } from 'src/klines/entities/spot/kline-15m.entity';
import { KlineSpot1d } from 'src/klines/entities/spot/kline-1d.entity';
import { KlineSpot1h } from 'src/klines/entities/spot/kline-1h.entity';
import { KlineSpot1m } from 'src/klines/entities/spot/kline-1m.entity';
import { KlineSpot1Month } from 'src/klines/entities/spot/kline-1month.entity';
import { KlineSpot1s } from 'src/klines/entities/spot/kline-1s.entity';
import { KlineSpot1w } from 'src/klines/entities/spot/kline-1w.entity';
import { KlineSpot4h } from 'src/klines/entities/spot/kline-4h.entity';
import { KlineSpot5m } from 'src/klines/entities/spot/kline-5m.entity';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
import { Symbols } from 'src/symbols/entities/spot/symbol.entity';
import { DataSource, Repository } from 'typeorm';

export class SpotBusiness implements ExchangeRepo {
  constructor(private dataSource: DataSource) {}

  oneSecond(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot1s);
  }
  oneMinute(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot1m);
  }
  fiveMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot5m);
  }
  fifteenMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot15m);
  }
  oneHour(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot1h);
  }
  fourHours(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot4h);
  }
  oneDay(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot1d);
  }
  oneWeek(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot1w);
  }
  oneMonth(): Repository<any> {
    return this.dataSource.getRepository(KlineSpot1Month);
  }
  symbols(): Repository<any> {
    return this.dataSource.getRepository(Symbols);
  }
  forTimeFrame(tf: TimeFrameEnum): Repository<any> {
    switch (tf) {
      case TimeFrameEnum.OneSecond:
        return this.oneSecond();
      case TimeFrameEnum.OneMinute:
        return this.oneMinute();
      case TimeFrameEnum.FiveMinutes:
        return this.fiveMinutes();
      case TimeFrameEnum.FifteenMinutes:
        return this.fifteenMinutes();
      case TimeFrameEnum.OneHour:
        return this.oneHour();
      case TimeFrameEnum.FourHours:
        return this.fourHours();
      case TimeFrameEnum.OneDay:
        return this.oneDay();
      case TimeFrameEnum.OneWeek:
        return this.oneWeek();
      case TimeFrameEnum.OneMonth:
        return this.oneMonth();
      default:
        throw new Error('Encorrect Timeframe!');
    }
  }
}
