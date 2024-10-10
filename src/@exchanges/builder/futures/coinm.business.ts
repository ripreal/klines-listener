import { ExchangeRepo } from 'src/@exchanges/interfaces/exchange.interface';
import { KlineFCoinm15m } from 'src/klines/entities/futures/coinm/kline-15m.entity';
import { KlineFCoinm1d } from 'src/klines/entities/futures/coinm/kline-1d.entity';
import { KlineFCoinm1h } from 'src/klines/entities/futures/coinm/kline-1h.entity';
import { KlineFCoinm1m } from 'src/klines/entities/futures/coinm/kline-1m.entity';
import { KlineFCoinm1Month } from 'src/klines/entities/futures/coinm/kline-1month.entity';
import { KlineFCoinm1s } from 'src/klines/entities/futures/coinm/kline-1s.entity';
import { KlineFCoinm1w } from 'src/klines/entities/futures/coinm/kline-1w.entity';
import { KlineFCoinm4h } from 'src/klines/entities/futures/coinm/kline-4h.entity';
import { KlineFCoinm5m } from 'src/klines/entities/futures/coinm/kline-5m.entity';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
import { SymbolsCoinmFutures } from 'src/symbols/entities/futures/symbol.coin.entity';
import { DataSource, Repository } from 'typeorm';

export class CoinmBusiness implements ExchangeRepo {
  constructor(private dataSource: DataSource) {}
  sixHours(): Repository<any> {
    throw new Error('Method not implemented.');
  }

  oneSecond(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm1s);
  }
  oneMinute(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm1m);
  }
  fiveMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm5m);
  }
  fifteenMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm15m);
  }
  oneHour(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm1h);
  }
  fourHours(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm4h);
  }
  oneDay(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm1d);
  }
  oneWeek(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm1w);
  }
  oneMonth(): Repository<any> {
    return this.dataSource.getRepository(KlineFCoinm1Month);
  }
  symbols(): Repository<any> {
    return this.dataSource.getRepository(SymbolsCoinmFutures);
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
