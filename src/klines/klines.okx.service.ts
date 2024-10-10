import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SymbolsService } from '../symbols/symbol.service';
import TimeFrameEnum from './entities/timeframe.enum';
import { ExchangeFactory } from 'src/@exchanges/exchange.factory';
import { KlinesAbstractService } from './klines.abstract.service';
import { WebSocket } from 'ws';
import { WsOkxCollector } from './collectors/ws.okx.collector';
import { WsNewSymbolCollector } from './collectors/ws.new.symbol.collector';
import { Cron } from '@nestjs/schedule';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';

@Injectable()
export class KlinesOkxService extends KlinesAbstractService {

  private static readonly logger = new Logger(KlinesOkxService.name)

  constructor(
    private readonly klinesStore: RMQKlinesStore,
    configService: ConfigService,
    exchangeFactory: ExchangeFactory,
    symbolService: SymbolsService,
  ) {
    super(configService, exchangeFactory, symbolService, KlinesOkxService.logger)
  }

  protected newSocket(): WebSocket {
    return new WebSocket('wss://ws.okx.com:8443/ws/v5/business');
  }

  protected getWSCollector(symbols: {symbol: string}[], id: number) {
    return new WsOkxCollector(
      id,
      this.newSocket(),
      this.klinesStore,
      this.subscribeMessage(symbols, id),
      this.getType(),
    )
  }

  protected getNewSymbolCollector(onNewSymbolArrived: Function) {
    const typeMarket = this.getType()
    return new WsNewSymbolCollector(
      this.configService,
      new WebSocket('wss://ws.okx.com:8443/ws/v5/public'), 
      {
        op: 'subscribe',
        args: [{
          channel: "instruments",
          instType: typeMarket.name.toUpperCase()
        }],
      }, 
      this.symbolService, 
      this.getType(), 
      (data) => {
        if (data == 'pong') {
          return
        }
        const socketData = JSON.parse(data as string)
        if (Array.isArray(socketData.data)) {
          return socketData.data.map(({instId}) => instId)
        } else {
          this.logger.debug(`new symbol watch subscription result: ${JSON.stringify(socketData)}`)
        }
      },
      onNewSymbolArrived,
      true)
  }

  protected getStep(): number {
    return 100
  }

  private subscribeMessage(symbols: {symbol: string}[], id: number) {
    let timeframe = super.getTimeframes()
    //timeframe = [TimeFrameEnum.OneDay]
    return {
      "op": "subscribe",
      args: timeframe.reduce((acc: any, timeframe) => {
        acc.push(
          ...symbols.map(
            ({ symbol }: any) => { 
              return {
                channel: this.fetchTimeframe(timeframe),
                instId: symbol
              }
            }
          ),
        );
        return acc;
      }, []),
    }
  }

  private fetchTimeframe(timeframe: TimeFrameEnum) {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        return `candle1s`
      case TimeFrameEnum.OneMinute:
        return `candle1m`
      case TimeFrameEnum.FiveMinutes:
        return `candle5m`
      case TimeFrameEnum.FifteenMinutes:
        return `candle15m`
      case TimeFrameEnum.OneHour:
        return `candle1H`
      case TimeFrameEnum.FourHours:
        return `candle4H`
      case TimeFrameEnum.OneDay:
        return `candle1Dutc`
      case TimeFrameEnum.OneWeek:
        return `candle1Wutc`
      case TimeFrameEnum.OneMonth:
        return `candle1Mutc`
      default:
        throw new Error(`${timeframe} not implemented for okx websocket`)
    }
  }

  @Cron('59 59 23 * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.okx)})
  protected async restartCluster() {
    return super.restartCluster()
  }

  @Cron('* * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.okx)})
  async observeNewSymbols() {
    await super.observeNewSymbols()
  }
}
