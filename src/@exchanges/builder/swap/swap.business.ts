import { ExchangeRepo } from 'src/@exchanges/interfaces/exchange.interface';
import { KlineSwap15m } from 'src/klines/entities/swap/kline-15m.entity';
import { KlineSwap1d } from 'src/klines/entities/swap/kline-1d.entity';
import { KlineSwap1h } from 'src/klines/entities/swap/kline-1h.entity';
import { KlineSwap1m } from 'src/klines/entities/swap/kline-1m.entity';
import { KlineSwap1Month } from 'src/klines/entities/swap/kline-1month.entity';
import { KlineSwap1s } from 'src/klines/entities/swap/kline-1s.entity';
import { KlineSwap1w } from 'src/klines/entities/swap/kline-1w.entity';
import { KlineSwap4h } from 'src/klines/entities/swap/kline-4h.entity';
import { KlineSwap5m } from 'src/klines/entities/swap/kline-5m.entity';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
import { SymbolsSwap } from 'src/symbols/entities/swap/symbols.swap.entity';
import { DataSource, Repository } from 'typeorm';

export class SwapBusiness implements ExchangeRepo {
  constructor(private dataSource: DataSource) {}

  oneSecond(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap1s);
  }
  oneMinute(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap1m);
  }
  fiveMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap5m);
  }
  fifteenMinutes(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap15m);
  }
  oneHour(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap1h);
  }
  fourHours(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap4h);
  }
  sixHours(): Repository<any> {
    throw new Error("six hours not implemented")
  }
  oneDay(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap1d);
  }
  oneWeek(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap1w);
  }
  oneMonth(): Repository<any> {
    return this.dataSource.getRepository(KlineSwap1Month);
  }
  symbols(): Repository<any> {
    return this.dataSource.getRepository(SymbolsSwap);
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
