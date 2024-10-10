import { Injectable, Logger } from '@nestjs/common';
import { RMQKlinesStore } from '../@klines_store/rmq.klines.store';
import { TradeCandle } from './dto/trade.candle';
import { Cron } from '@nestjs/schedule';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { ObjectMemoryKlinesStore } from 'src/@klines_store/object.memory.klines.store';
import { SendingStatus, SocketKlineDTO } from './dto/socket.kline.dto';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import Decimal from 'decimal.js';
import { KlinesService } from './klines.service';
import { generateCandlesForBorders, generateCandlesForGaps } from './gaps.generator';

@Injectable()
export class KlinesTFGeneratorOld {
  private readonly logger = new Logger(KlinesTFGeneratorOld.name)
  private lastTradesIds = new Map<string, number>
  private startedSymbols = new Map<string, boolean>;
  private startedTfKlines = new Map<string, boolean>;

  constructor(private readonly rmqKlinesStore: RMQKlinesStore, 
    private readonly klinesCache: ObjectMemoryKlinesStore,
    private readonly configService: ConfigService,
    private readonly klinesService: KlinesService) {

  }

  public addCandle(kline: SocketKlineDTO) {
    this.klinesCache.put(kline.timeframe, kline)
    this.startedSymbols.set(kline.symbol, true)
  }

  public async addGenerateKline(kline: SocketKlineDTO) {
    await this.generateKlines(kline)
    this.startedSymbols.set(kline.symbol, true)
  }

  public async addTrade(trade: TradeCandle, timeframes: TimeFrameEnum[]) {
    this.logger.verbose(`${trade.symbol} ${moment(trade.time).format('hh:mm')} got new trade`)
    const promises = []
    for (let timeframe of timeframes) {
      promises.push(this.generateTradeCandles(trade, timeframe))
    }
    await Promise.all(promises)
    // save id for trade so we could skip preceding trades 
    this.lastTradesIds.set(trade.symbol, trade.tradeId)
    // mark symbols that were read from database so avoid repeatable reading
    this.startedSymbols.set(trade.symbol, true)
  }

  public generateEmptyKlines(timeframes: TimeFrameEnum[]) {
    const now = new Date
    for (let [symbol, started] of this.startedSymbols) {
      for (let timeframe of timeframes) {
        this.generateEmptyCandles(symbol, +now, timeframe)
      }
    }
  }

  private async generateTradeCandles(trade: TradeCandle, timeframe: TimeFrameEnum): Promise<void> {
    if (this.lastTradesIds.get(trade.symbol) === trade.tradeId) {
      // trade doubles are skipped
      if (trade.symbol == 'BTC-USDT' || trade.symbol == 'BTCUSD') {
        this.logger.debug(`${trade.symbol} got trade double. Skip it`)
      }
      return;
    }
    if (!this.startedSymbols.get(trade.symbol)) {
      const socketKline = await this.klinesService.getLastKline(timeframe, trade.symbol)
      this.klinesCache.put(timeframe, socketKline)
    }

    const periodMs = this.getTfPeriodMs(timeframe, trade.time)

    const foundKline = this.klinesCache.get(timeframe, trade.symbol, periodMs)

    if (foundKline && +foundKline.baseAssetVolume > 0) {

      foundKline.highPrice = trade.price.toNumber() > +foundKline.highPrice ? trade.price.toString() : foundKline.highPrice
      foundKline.lowPrice = trade.price.toNumber() < +foundKline.lowPrice ? trade.price.toString() : foundKline.lowPrice
      foundKline.closePrice = trade.price.toString()

      let foundVolume = new Decimal(foundKline.baseAssetVolume)
      foundKline.baseAssetVolume = foundVolume.plus(trade.volume).toString()
      foundKline.transient_status = SendingStatus.NOT_SENT

      this.klinesCache.put(timeframe, foundKline)

    } else {

      const socketKline = {} as SocketKlineDTO
      socketKline.exchange = ExchangeEnum[this.configService.get("EXCHANGE")]
      socketKline.symbol = trade.symbol
      socketKline.openPrice = trade.price.toString()
      socketKline.closePrice = trade.price.toString()
      socketKline.lowPrice = trade.price.toString()
      socketKline.highPrice = trade.price.toString()
      socketKline.openTimeMs = periodMs
      socketKline.baseAssetVolume = trade.volume.toString()
      socketKline.timeframe = timeframe
      socketKline.transient_status = SendingStatus.NOT_SENT

      const t1 = socketKline as any
      t1.openTimeDebug = new Date(periodMs)

      this.klinesCache.put(timeframe, socketKline)

    }
  }

  private async generateKlines(kline: SocketKlineDTO): Promise<void> {

    const klinesKey = `${kline.symbol}_${kline.timeframe}`

    if (!this.startedTfKlines.get(klinesKey)) {
      const socketKline = await this.klinesService.getLastKline(kline.timeframe, kline.symbol)
      this.klinesCache.put(kline.timeframe, socketKline)
    }

    const periodMs = this.getTfPeriodMs(kline.timeframe, kline.openTimeMs)
    const foundKline = this.klinesCache.get(kline.timeframe, kline.symbol, periodMs)

    if (foundKline && +foundKline.baseAssetVolume > 0) {

      foundKline.highPrice = +kline.highPrice > +foundKline.highPrice ? kline.highPrice : foundKline.highPrice
      foundKline.lowPrice = +kline.lowPrice < +foundKline.lowPrice ? kline.lowPrice : foundKline.lowPrice
      foundKline.closePrice =kline.closePrice
      //let foundVolume = new Decimal(foundKline.baseAssetVolume)
      foundKline.baseAssetVolume = kline.baseAssetVolume.toString() // TODO for kraken 1M this is incorrect cause we get period volume bu we neeed single trade volume for foundVolume.plus(trade.volume).toString()
      foundKline.transient_status = SendingStatus.NOT_SENT
      this.klinesCache.put(kline.timeframe, foundKline)
    } else {
      this.klinesCache.put(kline.timeframe, kline)
    }
  }

  private generateEmptyCandlesV2(symbol: string, time: number, timeframe: TimeFrameEnum): void {

    const foundKlines = this.klinesCache.getAllPeriodsOrderedAsc(timeframe, symbol);
    if (!foundKlines || foundKlines.length == 0) {
      this.logger.verbose(`${symbol} ${timeframe} kline not found in db or cache. Skip generating empty candle`);
      return;
    }

    generateCandlesForGaps(foundKlines, timeframe, this.klinesCache)
    generateCandlesForBorders(foundKlines[foundKlines.length - 1], timeframe, moment(this.getTfPeriodMs(timeframe, time)), this.klinesCache)

  }

  private generateEmptyCandles(symbol: string, time: number, timeframe: TimeFrameEnum): void {

    if (timeframe == TimeFrameEnum.OneWeek || 
      timeframe == TimeFrameEnum.OneMonth) {
      // gaps are not encountered with theses timeframes 
      return
    }
    
    if (timeframe == TimeFrameEnum.OneSecond) {
      this.generateEmptyCandlesV2(symbol, time, timeframe)
      return
    }

    const periodMs = this.getTfPeriodMs(timeframe, time)

    const foundKline = this.klinesCache.getLast(timeframe, symbol)
    if (!foundKline) {
      this.logger.verbose(`${symbol} ${timeframe} kline not found in db or cache. Skip generating empty candle`)
      return
    }

    const startMoment = moment(foundKline.openTimeMs)
    const endMoment =  moment(periodMs)

    let diff = 0
    if (timeframe as any == TimeFrameEnum.OneSecond) {
      const limit = 180
      diff = endMoment.diff(startMoment, 'seconds')
      if (diff > limit) {
        this.logger.warn(`${symbol} Empty candles generator will reduce candles cause amount exceeded limit: diff:${diff}, limit:${limit}, start: ${startMoment.format('hh:mm:ss')} end: ${endMoment.format('hh:mm:ss')}`)
      }
      diff = Math.min(limit, diff)
    } else {
      const limit = 10000
      diff = endMoment.diff(startMoment, 'minute')
      diff = Math.floor(diff / (this.toTimeframeInSec(timeframe) / 60))
      if (diff > limit) {
        this.logger.warn(`${symbol} Empty candles generator will reduce candles cause amount exceeded limit: diff:${diff}, limit:${limit}, start: ${startMoment.format('hh:mm:ss')} end: ${endMoment.format('hh:mm:ss')}`)
      }
      diff = Math.min(limit, diff)
    }

    for (let r = 1; r <= diff; r++) {
      const kline = {} as SocketKlineDTO
      kline.symbol = foundKline.symbol
      kline.openTimeMs = endMoment.subtract(this.toTimeframeInSec(timeframe), 'seconds').toDate().getTime() 
      kline.exchange = foundKline.exchange
      kline.baseAssetVolume = '0'
      kline.closePrice = foundKline.closePrice
      kline.highPrice = foundKline.closePrice
      kline.lowPrice = foundKline.closePrice
      kline.openPrice = foundKline.closePrice
      kline.timeframe = timeframe
      kline.transient_status = SendingStatus.NOT_SENT

      const foundRealKline = this.klinesCache.get(timeframe, symbol, kline.openTimeMs)
      if (!foundRealKline) {
        this.klinesCache.put(timeframe, kline)
        if (symbol == 'BTC-USDT' || symbol == 'BTCUSD') {
          this.logger.verbose(`${symbol} ${timeframe} generated empty candle ${moment(kline.openTimeMs).format('hh:mm:ss')}`)
        }
      }
    }
  }

  public async insertKlines(timeframes: TimeFrameEnum[]) {
    for (let timeframe of timeframes) {
      //if (timeframe == TimeFrameEnum.OneSecond) {
      //  continue
      //}
      const symbols = this.klinesCache.getAllSymbols(timeframe)
      for (let symbol of symbols) {
        const periods = this.klinesCache.getAllPeriods(timeframe, symbol)
        for (const period of periods) {
          if (this.clearOldTFPeriods(period, timeframe, symbol)) {
            continue
          }
          const kline = this.klinesCache.get(timeframe, symbol, +period)
          //if (symbol == 'BTC-USDT' || symbol == 'BTCUSD') {
          //  this.logger.verbose(`${symbol} ${timeframe} ${moment(+period).format('hh:mm:ss')} inserting klines. Empty: ${+kline.baseAssetVolume == 0}`)
          //}
          await this.sendToRabbit(kline)
        }
      }
    }
  }

  private async sendToRabbit(kline: SocketKlineDTO) {
    if (kline.transient_status == SendingStatus.NOT_SENT) {
      kline.transient_status = SendingStatus.SENT
      await this.rmqKlinesStore.pushKline(kline)
      if (kline.symbol == 'BTC-USDT' || kline.symbol == 'BTCUSD') {
        this.logger.verbose(`${kline.symbol} ${moment(kline.openTimeMs).format('yyyy-mm-dd hh:mm:ss')}} was sent to RMQ. Empty: ${+kline.baseAssetVolume == 0}`)
      }
    } else {
      if (kline.symbol == 'BTC-USDT' || kline.symbol == 'BTCUSD') {
        this.logger.verbose(`${kline.symbol}  ${moment(kline.openTimeMs).format('yyyy-mm-dd hh:mm:ss')}} already was sent erlier`)
      }
    }
  }

  public getTfPeriodMs(timeframe: TimeFrameEnum, timeMs: number): number {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        return moment(timeMs).startOf('second').toDate().getTime()
      case TimeFrameEnum.OneMinute:
        return moment(timeMs).startOf('minute').toDate().getTime()
      case TimeFrameEnum.FiveMinutes:
       return Math.floor(timeMs / +`${300}000.0`) * 300 * 1000
      case TimeFrameEnum.FifteenMinutes:
        return Math.floor(timeMs / +`${900}000.0`) * 900 * 1000
      case TimeFrameEnum.OneHour:
        return moment(timeMs).startOf('hour').toDate().getTime()
      case TimeFrameEnum.FourHours:
        return Math.floor(timeMs / +`${14400}000.0`) * 14400 * 1000
      case TimeFrameEnum.OneDay:
        return moment(timeMs).startOf('day').toDate().getTime()
      case TimeFrameEnum.OneWeek:
        return moment(timeMs).startOf('isoWeek').toDate().getTime()
      case TimeFrameEnum.OneMonth:
        return moment(timeMs).startOf('month').toDate().getTime()
      default:
        throw new Error(`getting from storage not implemented: ${timeframe}`)
    }
  
  }

  private clearOldTFPeriods(period: string, timeframe: TimeFrameEnum, symbol: string) {

    let limited = false
    if (timeframe == TimeFrameEnum.OneSecond) {
      const t1 = moment(+period).startOf('second');
      const t2 = moment().startOf('second');
      const diff = t2.diff(t1, 'second');
      limited = diff > 5
    } else if (timeframe == TimeFrameEnum.OneMinute) {
      const t1 = moment(+period).startOf('minute')
      const t2 = moment().startOf('minute')
      const diff = t2.diff(t1, 'minute')
      limited = diff > 5
    } else if (timeframe == TimeFrameEnum.FiveMinutes) {
      const t1 = moment(+period).startOf('minute')
      const t2 = moment().startOf('minute')
      const diff = t2.diff(t1, 'minute')
      limited = diff > 15
    } else if (timeframe == TimeFrameEnum.FifteenMinutes) {
      const t1 = moment(+period).startOf('minute')
      const t2 = moment().startOf('minute')
      const diff = t2.diff(t1, 'minute')
      limited = diff > 60
    } else if (timeframe == TimeFrameEnum.OneHour) {
      const t1 = moment(+period).startOf('hour')
      const t2 = moment().startOf('hour')
      const diff = t2.diff(t1, 'hour')
      limited = diff > 5
    } else if (timeframe == TimeFrameEnum.FourHours) {
      const t1 = moment(+period).startOf('hour')
      const t2 = moment().startOf('hour')
      const diff = t2.diff(t1, 'hour')
      limited = diff > 12
    } else if (timeframe == TimeFrameEnum.OneDay) {
      const t1 = moment(+period).startOf('day')
      const t2 = moment().startOf('day')
      const diff = t2.diff(t1, 'day')
      limited = diff > 2
    } else if (timeframe == TimeFrameEnum.OneWeek) {
      const t1 = moment(+period).startOf('isoWeek');
      const t2 = moment().startOf('isoWeek');
      const diff = t2.diff(t1, 'week');
      limited = diff > 2
    } else if (timeframe == TimeFrameEnum.OneMonth) {
      const t1 = moment(+period).startOf('month');
      const t2 = moment().startOf('month');
      const diff = t2.diff(t1, 'month');
      limited = diff > 2
    } else {
      throw new Error(`clearing old periods not implemented for tf:${timeframe}`)
    }

    if (limited) {
      // skip all periods older than n minutes or days
      this.klinesCache.delete(timeframe, symbol, +period)
      return true
    }
    return false
  }

  private toTimeframeInSec(tf: TimeFrameEnum) {
    switch (tf) {
      case '1s':
        return 1;
      case '1m':
        return 60;
      case '5m':
        return 300;
      case '15m':
        return 900;
      case '1h':
        return 3600;
      case '4h':
        return 14400;
      case '1d':
        return 86400;
      case '1w':
        return 604800;
      case '1M':
        throw new Error(`timeframe ${tf} not implemented`)
    }
  }
  

}
