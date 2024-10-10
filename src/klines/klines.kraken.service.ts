import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SymbolsService } from '../symbols/symbol.service';
import TimeFrameEnum from './entities/timeframe.enum';
import { ExchangeFactory } from 'src/@exchanges/exchange.factory';
import { KlinesAbstractService } from './klines.abstract.service';
import { WebSocket } from 'ws';
import { Cron } from '@nestjs/schedule';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';
import { SymbolClass } from 'src/symbols/symbol.class';
import { WsKrakenFuturesCollector } from './collectors/ws.kraken.futures.collector';
import { WsKrakenSpotCollector } from './collectors/ws.kraken.spot.collector';
import { KlinesTFGenerator } from './klines.tf.generator';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import { KlinesTFGeneratorOld } from './klines.tf.generator.old';

@Injectable()
export class KlinesKrakenService extends KlinesAbstractService {

  private static readonly logger = new Logger(KlinesKrakenService.name)

  constructor(
    private readonly klinesTFGenerator: KlinesTFGenerator,
    private readonly klinesTFGeneratorOld: KlinesTFGeneratorOld,
    private readonly klinesStore: RMQKlinesStore,
    configService: ConfigService,
    exchangeFactory: ExchangeFactory,
    symbolService: SymbolsService,
  ) {
    super(configService, exchangeFactory, symbolService, KlinesKrakenService.logger)
  }

  protected newSocket(): WebSocket {
    const type = this.configService.get('TYPE')
    switch (type) {
      case 'spot':
        return new WebSocket('wss://ws.kraken.com')
      case 'futures':
      case 'swap':
        return new WebSocket('wss://futures.kraken.com/ws/v1')
      default:
        throw new Error(`${type} not implemented for websocket url`)
    }
    
  }

  protected getWSCollector(symbols: SymbolClass[], id: number) {
    const type = this.configService.get('TYPE')
    this.logger.debug(`Creating new ws collector. First: ${JSON.stringify(symbols[0].symbol)}`)

    if (type == 'spot') {
      return new WsKrakenSpotCollector(
        id,
        this.newSocket(),
        this.klinesTFGenerator,
        this.klinesStore,
        this.subscribeMessage(symbols, id),
        this.getType(),
        this.configService
      )
    } else if (type == 'futures') {
      return new WsKrakenFuturesCollector(
        id,
        this.newSocket(),
        this.klinesTFGenerator,
        this.klinesStore,
        this.subscribeMessage(symbols, id),
        this.getType(),
        this.configService
      )
    } else if (type == 'swap') {
      return new WsKrakenFuturesCollector(
        id,
        this.newSocket(),
        this.klinesTFGeneratorOld,
        this.klinesStore,
        this.subscribeMessage(symbols, id),
        this.getType(),
        this.configService
      )
    } else {
      throw new Error(`${type} not implemented`)
    }
  }

  protected getNewSymbolCollector(onNewSymbolArrived: Function) {
    // Not supported for websocket 
  }

  protected getStep(): number {
    return 100
  }

  private subscribeMessage(symbols: {symbol: string, base: string, quote: string}[], id: number) : any[] | any {
    const type = this.configService.get('TYPE')

    if (type == 'spot') {
      let timeframes = super.getTimeframes()
      //timeframes = timeframes.filter(tf => tf != TimeFrameEnum.OneSecond)
      //timeframes = timeframes.filter(tf => tf != TimeFrameEnum.OneMonth)
      //timeframe = [TimeFrameEnum.OneDay]
      return timeframes.map(tf => {
        return {
          "event": "subscribe",
          "pair": symbols.flatMap(({base, quote}) => `${base}/${quote}`),
          "subscription": {
            "interval": this.fetchTimeframe(tf),
            "name": "ohlc",
          }
        }
      })
    } else if (type == 'futures' || type == 'swap') {
      return {
        "event": "subscribe",
        "feed": "trade",
        "product_ids": symbols.flatMap(({symbol}) => symbol.replace('BTC', 'XBT').replace('XDG', 'DOGE')),
      }
    } else {
      throw new Error(`${type} not implemented`)
    }
  }

  private fetchTimeframe(timeframe: TimeFrameEnum) {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        return 1
      case TimeFrameEnum.OneMinute:
        return 1
      case TimeFrameEnum.FiveMinutes:
        return 5
      case TimeFrameEnum.FifteenMinutes:
        return 15
      case TimeFrameEnum.OneHour:
        return 60
      case TimeFrameEnum.FourHours:
        return 240
      case TimeFrameEnum.OneDay:
        return 1440
      case TimeFrameEnum.OneWeek:
        return 10080
      case TimeFrameEnum.OneMonth:
        return 21600  // actually two weeks need to generate
      default:
        throw new Error(`wrong timeframe: ${timeframe}`)
    }
  }

  @Cron('59 59 23 * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.kraken)})
  protected async restartCluster() {
    return super.restartCluster()
  }

  @Cron('*/5 * * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.kraken)})
  async generateEmptyKlinesJob() {
    await this.klinesTFGenerator.generateEmptyKlines(super.getTimeframes())
  }

  @Cron('*/5 * * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.kraken)})
  async insertKlinesJob() {
    return this.klinesTFGenerator.insertKlines(super.getTimeframes())
  }

  @Cron('* * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.kraken)})
  async observeNewSymbols() {
    await super.observeNewSymbols()
  }

}
