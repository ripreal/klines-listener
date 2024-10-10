

import { ExchangeRepo } from 'src/@exchanges/interfaces/exchange.interface';
import { KlineFutures15m } from 'src/klines/entities/futures/futures/kline-15m.entity';
import { KlineFutures1d } from 'src/klines/entities/futures/futures/kline-1d.entity';
import { KlineFutures1h } from 'src/klines/entities/futures/futures/kline-1h.entity';
import { KlineFutures1m } from 'src/klines/entities/futures/futures/kline-1m.entity';
import { KlineFutures1Month } from 'src/klines/entities/futures/futures/kline-1month.entity';
import { KlineFutures1s } from 'src/klines/entities/futures/futures/kline-1s.entity';
import { KlineFutures1w } from 'src/klines/entities/futures/futures/kline-1w.entity';
import { KlineFutures4h } from 'src/klines/entities/futures/futures/kline-4h.entity';
import { KlineFutures5m } from 'src/klines/entities/futures/futures/kline-5m.entity';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
import { SymbolsUsdmFutures } from 'src/symbols/entities/futures/symbol.usdm.entity';
import { SymbolsFutures } from 'src/symbols/entities/futures/symbols.futures.entity';
import { DataSource, Repository } from 'typeorm';

export class FuturesBusiness implements ExchangeRepo {
  constructor(private dataSource: DataSource) {}
  sixHours(): Repository<any> {
    throw new Error('Method not implemented.');
  }

  oneSecond(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures1s);
  }
  oneMinute(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures1m);
  }
  fiveMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures5m);
  }
  fifteenMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures15m);
  }
  oneHour(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures1h);
  }
  fourHours(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures4h);
  }
  oneDay(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures1d);
  }
  oneWeek(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures1w);
  }
  oneMonth(): Repository<any> {
    return this.dataSource.getRepository(KlineFutures1Month);
  }
  symbols(): Repository<any> {
    return this.dataSource.getRepository(SymbolsFutures);
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
