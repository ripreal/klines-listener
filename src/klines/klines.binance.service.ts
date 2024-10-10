import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SymbolsService } from '../symbols/symbol.service';
import TimeFrameEnum from './entities/timeframe.enum';
import {
  TypeMarket,
  TypeNameEnum,
} from '../symbols/dto/query.dto';
import { WsBinanceCollector } from './collectors/ws.binance.collector';
import { WebSocket } from 'ws';
import { ExchangeFactory } from 'src/@exchanges/exchange.factory';
import { KlinesAbstractService } from './klines.abstract.service';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import { WsNewSymbolCollector } from './collectors/ws.new.symbol.collector';
import { Cron } from '@nestjs/schedule';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';
import { filterBySymbol } from 'src/utils/filter.utils';
import { KlinesTFGenerator } from './klines.tf.generator';

@Injectable()
export class KlinesBinanceService extends KlinesAbstractService {

  private static readonly logger = new Logger(KlinesBinanceService.name)

  constructor(
    private readonly klinesStore: RMQKlinesStore,
    configService: ConfigService,
    private readonly klinesGenerator: KlinesTFGenerator,
    exchangeFactory: ExchangeFactory,
    symbolService: SymbolsService,
  ) {
    super(configService, exchangeFactory, symbolService, KlinesBinanceService.logger)
  }


  protected getWSCollector(symbols: {symbol: string}[], id: number) {
    return new WsBinanceCollector(
      id,
      this.newSocket(),
      this.klinesGenerator,
      this.klinesStore,
      this.subscribeMessage(symbols, id),
      this.getType(),
      this.configService
    )
  }

  protected newSocket(): WebSocket {
    const type = this.configService.get('TYPE');
    const ex = this.configService.get('EXCHANGE');
    switch (type) {
      case TypeNameEnum.spot:
        switch (ex) {
          case ExchangeEnum.binance:
            return new WebSocket('wss://stream.binance.com:9443/ws');
          case ExchangeEnum.binanceUS:
            return new WebSocket('wss://stream.binance.us:9443/ws');
        }
      case TypeNameEnum.coinm:
        return new WebSocket('wss://dstream.binance.com/ws');
      case TypeNameEnum.usdm:
          return new WebSocket('wss://fstream.binance.com/ws');
      default:
        throw new BadRequestException('type not found');
    }
  }

  protected getNewSymbolCollector(onNewSymbolArrived: Function) {
    return new WsNewSymbolCollector(
      this.configService,
      this.newSocket(), 
      {
        method: 'SUBSCRIBE',
        params: [ '!ticker@arr' ],
        id: 879789,
      }, 
      this.symbolService, 
      this.getType(), 
      (data) => {
        const socketData = JSON.parse(data as string)
        if (Array.isArray(socketData)) {
          let newSymbols = socketData.map(({s}) => s)
          const symbolFilter = this.configService.get("SYMBOL")
          if (symbolFilter) {
            newSymbols = filterBySymbol(symbolFilter, newSymbols)
          }
          return newSymbols
        } else {
          this.logger.debug(`new symbol watch subscription result: ${JSON.stringify(socketData)}`)
        }
      },
      onNewSymbolArrived, false)
  }

  protected getStep(): number {
    const timeframe = Object.values(TimeFrameEnum);
    const step = Math.floor(100 / timeframe.length);
    return step
  }

  private subscribeMessage(symbols: {symbol: string}[], i: number) {
    let timeframe = super.getTimeframes()
    //timeframe = [TimeFrameEnum.OneSecond]
    return {
      method: 'SUBSCRIBE',
      params: timeframe.reduce((acc: any, timeframe) => {
        acc.push(
          ...symbols.map(
            ({ symbol }: any) =>
              `${symbol.toLowerCase()}@kline_${this.toTimeframe(timeframe)}`,
          ),
        );
        return acc;
      }, []),
      id: i,
    };
  }

  @Cron('59 59 23 * * *', {disabled: process.env.EXCHANGE !== 'binance'})
  //@Cron('* * * * *', {disabled: process.env.EXCHANGE !== 'binance'})
  protected async restartCluster() {
    return super.restartCluster()
  }

  private toTimeframe(timeframe: TimeFrameEnum) {
    const type = this.configService.get('TYPE');
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        switch (type) {
          case TypeNameEnum.usdm:
          case TypeNameEnum.coinm:
            return TimeFrameEnum.OneMinute
          default:
            return timeframe
        }
      default:
        return timeframe
    }
  }

  @Cron('*/5 * * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.binance && process.env.TYPE !== TypeNameEnum.spot)})
  async generateEmptyKlinesJob() {
    await this.klinesGenerator.generateEmptyKlines([TimeFrameEnum.OneSecond])
  }

  @Cron('*/5 * * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.binance && process.env.TYPE !== TypeNameEnum.spot)})
  async insertKlinesJob() {
    return this.klinesGenerator.insertKlines(super.getTimeframes())
  }

  @Cron('* * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.binance)})
  async observeNewSymbols() {
    await super.observeNewSymbols()
  }

  
}
