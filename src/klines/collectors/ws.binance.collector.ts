import { WebSocket } from 'ws';
import { TypeMarket, TypeNameEnum } from '../../symbols/dto/query.dto';
import { WsAbstractCollector } from './ws.abstract.collector';
import TimeFrameEnum from '../entities/timeframe.enum';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import { Logger } from '@nestjs/common';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';
import { ConfigService } from '@nestjs/config';
import { SendingStatus } from '../dto/socket.kline.dto';
import * as moment from 'moment';
import { KlinesTFGenerator } from '../klines.tf.generator';
// временное решение. Обсуждаем с Вадимом.
export class WsBinanceCollector extends WsAbstractCollector {

  public static readonly logger = new Logger(WsBinanceCollector.name)

  constructor(
    id: number,
    wss: WebSocket,
    klinesGenerator: KlinesTFGenerator,
    store: RMQKlinesStore,
    message: any,
    type: TypeMarket,
    configService: ConfigService
  ) {

    const stringTimeframes = configService.get('TIMEFRAMES')
    let timeframes = stringTimeframes.split(',').map((t) => t.trim());

    const onMessage = async ( data ) => {
      const socketData = JSON.parse(data as string);
      switch (socketData.e) {
        case 'kline': {
          const kline = {
            exchange: ExchangeEnum.binance,
            symbol: socketData.s,
            openTimeMs: socketData.k.t,
            openPrice: socketData.k.o,
            highPrice: socketData.k.h,
            lowPrice: socketData.k.l,
            closePrice: socketData.k.c,
            timeframe: this.fetchTimeFrame(socketData.k.i),
            baseAssetVolume: socketData.k.v,
            transient_status: SendingStatus.NOT_SENT
          }
          
          if (type.name == TypeNameEnum.spot) {
            await super.storeData(kline);
          } else {
            if ( timeframes.find((el) => el == TimeFrameEnum.OneSecond) != undefined) {
              if (kline.timeframe == TimeFrameEnum.OneMinute) {
                const secKline = {...kline}
                secKline.timeframe = TimeFrameEnum.OneSecond
                secKline.openTimeMs = klinesGenerator.getTfPeriodMs(TimeFrameEnum.OneSecond, new Date().getTime())
                
                //WsBinanceCollector.logger.verbose(`${secKline.symbol} ${moment(secKline.openTimeMs).format('hh:mm:ss')} got 1s kline`)
                klinesGenerator.addCandle(secKline)
              }
            } else {
              await super.storeData(kline);
            }
          }
        }
      }
    };
    super(id, wss, store, message, type, onMessage, WsBinanceCollector.logger)
  }

  private fetchTimeFrame(channel: string): TimeFrameEnum {
    switch (channel) {
      case '1M':
        return TimeFrameEnum.OneMonth
      case '1w':
        return TimeFrameEnum.OneWeek
      case '1d':
        return TimeFrameEnum.OneDay
      case '4h':
        return TimeFrameEnum.FourHours
      case '1h':
        return TimeFrameEnum.OneHour
      case '15m':
        return TimeFrameEnum.FifteenMinutes
      case '5m':
          return TimeFrameEnum.FiveMinutes
      case '1m':
        return TimeFrameEnum.OneMinute
      case '1s':
        return TimeFrameEnum.OneSecond
      default:
        throw new Error(`timeframe ${channel} not implemented`)
    }
  }
}
