

import { ExchangeRepo } from 'src/@exchanges/interfaces/exchange.interface';
import { KlineFUsdm15m } from 'src/klines/entities/futures/usdm/kline-15m.entity';
import { KlineFUsdm1d } from 'src/klines/entities/futures/usdm/kline-1d.entity';
import { KlineFUsdm1h } from 'src/klines/entities/futures/usdm/kline-1h.entity';
import { KlineFUsdm1m } from 'src/klines/entities/futures/usdm/kline-1m.entity';
import { KlineFUsdm1Month } from 'src/klines/entities/futures/usdm/kline-1month.entity';
import { KlineFUsdm1s } from 'src/klines/entities/futures/usdm/kline-1s.entity';
import { KlineFUsdm1w } from 'src/klines/entities/futures/usdm/kline-1w.entity';
import { KlineFUsdm4h } from 'src/klines/entities/futures/usdm/kline-4h.entity';
import { KlineFUsdm5m } from 'src/klines/entities/futures/usdm/kline-5m.entity';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
import { SymbolsUsdmFutures } from 'src/symbols/entities/futures/symbol.usdm.entity';
import { DataSource, Repository } from 'typeorm';

export class UsdmBusiness implements ExchangeRepo {
  constructor(private dataSource: DataSource) {}
  sixHours(): Repository<any> {
    throw new Error('Method not implemented.');
  }

  oneSecond(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm1s);
  }
  oneMinute(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm1m);
  }
  fiveMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm5m);
  }
  fifteenMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm15m);
  }
  oneHour(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm1h);
  }
  fourHours(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm4h);
  }
  oneDay(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm1d);
  }
  oneWeek(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm1w);
  }
  oneMonth(): Repository<any> {
    return this.dataSource.getRepository(KlineFUsdm1Month);
  }
  symbols(): Repository<any> {
    return this.dataSource.getRepository(SymbolsUsdmFutures);
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
