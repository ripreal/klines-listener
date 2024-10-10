import { Module } from '@nestjs/common';
import { KlinesBinanceService } from './klines.binance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KlineSpot } from './entities/spot/kline-spot.entity';

import { KlineSpot15m } from './entities/spot/kline-15m.entity';
import { KlineSpot1d } from './entities/spot/kline-1d.entity';
import { KlineSpot1h } from './entities/spot/kline-1h.entity';
import { KlineSpot1m } from './entities/spot/kline-1m.entity';
import { KlineSpot1Month } from './entities/spot/kline-1month.entity';
import { KlineSpot1s } from './entities/spot/kline-1s.entity';
import { KlineSpot1w } from './entities/spot/kline-1w.entity';
import { KlineSpot4h } from './entities/spot/kline-4h.entity';

import { KlineSpot5m } from './entities/spot/kline-5m.entity';

import { ScheduleModule } from '@nestjs/schedule';
import { SymbolsModule } from '../symbols/symbols.module';
import { ExchangeModule } from 'src/@exchanges/exchange.module';
import { KlinesOkxService } from './klines.okx.service';
import { KlineFCoinm15m } from './entities/futures/coinm/kline-15m.entity';
import { KlineFCoinm1d } from './entities/futures/coinm/kline-1d.entity';
import { KlineFCoinm1h } from './entities/futures/coinm/kline-1h.entity';
import { KlineFCoinm1m } from './entities/futures/coinm/kline-1m.entity';
import { KlineFCoinm1Month } from './entities/futures/coinm/kline-1month.entity';
import { KlineFCoinm1s } from './entities/futures/coinm/kline-1s.entity';
import { KlineFCoinm1w } from './entities/futures/coinm/kline-1w.entity';
import { KlineFCoinm4h } from './entities/futures/coinm/kline-4h.entity';
import { KlineFCoinm5m } from './entities/futures/coinm/kline-5m.entity';
import { KlineFUsdm15m } from './entities/futures/usdm/kline-15m.entity';
import { KlineFUsdm1d } from './entities/futures/usdm/kline-1d.entity';
import { KlineFUsdm1h } from './entities/futures/usdm/kline-1h.entity';
import { KlineFUsdm1m } from './entities/futures/usdm/kline-1m.entity';
import { KlineFUsdm1Month } from './entities/futures/usdm/kline-1month.entity';
import { KlineFUsdm1s } from './entities/futures/usdm/kline-1s.entity';
import { KlineFUsdm1w } from './entities/futures/usdm/kline-1w.entity';
import { KlineFUsdm4h } from './entities/futures/usdm/kline-4h.entity';
import { KlineFUsdm5m } from './entities/futures/usdm/kline-5m.entity';
import { KlineSwap15m } from './entities/swap/kline-15m.entity';
import { KlineSwap1d } from './entities/swap/kline-1d.entity';
import { KlineSwap1h } from './entities/swap/kline-1h.entity';
import { KlineSwap1m } from './entities/swap/kline-1m.entity';
import { KlineSwap1Month } from './entities/swap/kline-1month.entity';
import { KlineSwap1s } from './entities/swap/kline-1s.entity';
import { KlineSwap1w } from './entities/swap/kline-1w.entity';
import { KlineSwap4h } from './entities/swap/kline-4h.entity';
import { KlineSwap5m } from './entities/swap/kline-5m.entity';
import { KlineFutures15m } from './entities/futures/futures/kline-15m.entity';
import { KlineFutures1d } from './entities/futures/futures/kline-1d.entity';
import { KlineFutures1h } from './entities/futures/futures/kline-1h.entity';
import { KlineFutures1m } from './entities/futures/futures/kline-1m.entity';
import { KlineFutures1Month } from './entities/futures/futures/kline-1month.entity';
import { KlineFutures1s } from './entities/futures/futures/kline-1s.entity';
import { KlineFutures1w } from './entities/futures/futures/kline-1w.entity';
import { KlineFutures4h } from './entities/futures/futures/kline-4h.entity';
import { KlineFutures5m } from './entities/futures/futures/kline-5m.entity';
import { KlinesStoreModule } from 'src/@klines_store/klines.store.module';
import { KlinesCoinbaseService } from './klines.coinbase.service';
import { RMQModule } from 'src/@rmq/rmq.module';
import { KlinesService } from './klines.service';
import { KlinesKrakenService } from './klines.kraken.service';
import { KlinesTFGenerator } from './klines.tf.generator';
import { KlinesTFGeneratorOld } from './klines.tf.generator.old';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KlineSpot,

      KlineFUsdm1d,
      KlineFUsdm1h,
      KlineFUsdm1m,
      KlineFUsdm1Month,
      KlineFUsdm1s,
      KlineFUsdm1w,
      KlineFUsdm4h,
      KlineFUsdm5m,
      KlineFUsdm15m,

      KlineFCoinm1d,
      KlineFCoinm1h,
      KlineFCoinm1m,
      KlineFCoinm1Month,
      KlineFCoinm1s,
      KlineFCoinm1w,
      KlineFCoinm4h,
      KlineFCoinm5m,
      KlineFCoinm15m,

      KlineSpot1d,
      KlineSpot1h,
      KlineSpot1m,
      KlineSpot1Month,
      KlineSpot1s,
      KlineSpot1w,
      KlineSpot4h,
      KlineSpot5m,
      KlineSpot15m,

      KlineSwap1d,
      KlineSwap1h,
      KlineSwap1m,
      KlineSwap1Month,
      KlineSwap1s,
      KlineSwap1w,
      KlineSwap4h,
      KlineSwap5m,
      KlineSwap15m,

      KlineFutures1d,
      KlineFutures1d,
      KlineFutures1m,
      KlineFutures1h,
      KlineFutures1Month,
      KlineFutures1s,
      KlineFutures1w,
      KlineFutures4h,
      KlineFutures5m,
      KlineFutures15m,
    ]),
    ScheduleModule.forRoot(),
    KlinesStoreModule,
    ExchangeModule,
    SymbolsModule,
    RMQModule,
  ],
  providers: [
    KlinesCoinbaseService,
    KlinesBinanceService,
    KlinesOkxService,
    KlinesTFGenerator,
    KlinesTFGeneratorOld,
    KlinesService,
    KlinesKrakenService
  ],
  exports: [KlinesCoinbaseService, KlinesBinanceService, KlinesOkxService, KlinesKrakenService],
})
export class KlinesModule {}
