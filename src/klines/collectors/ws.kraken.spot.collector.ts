import { WebSocket } from 'ws';
import { TypeMarket } from '../../symbols/dto/query.dto';
import { WsAbstractCollector } from './ws.abstract.collector';
import { Logger } from '@nestjs/common';
import TimeFrameEnum from '../entities/timeframe.enum';
import * as moment from 'moment';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';
import { ConfigService } from '@nestjs/config';
import { SendingStatus, SocketKlineDTO } from '../dto/socket.kline.dto';
import { KlinesTFGenerator } from '../klines.tf.generator';

export class WsKrakenSpotCollector extends WsAbstractCollector  {

  public static readonly logger = new Logger(WsKrakenSpotCollector.name)

  private readonly pingIntervalMS: number = 25000
  private wsTimeoutId: NodeJS.Timeout = undefined
  
  constructor(
    id: number,
    wss: WebSocket,
    klinesGenerator: KlinesTFGenerator,
    store: RMQKlinesStore,
    message: any,
    type: TypeMarket,
    configService: ConfigService,
  ) {

    const stringTimeframes = configService.get('TIMEFRAMES')
    let timeframes = stringTimeframes.split(',').map((t) => t.trim());
    //timeframes = timeframes.filter (tf => tf == TimeFrameEnum.OneMonth)

    const onMessage = async (data) => {
        if (this.wsTimeoutId) {
          clearTimeout(this.wsTimeoutId)
        }
        this.wsTimeoutId = setTimeout(async () => {
          this.wsTimeoutId = null
          WsKrakenSpotCollector.logger.debug(`${type.exchange} ${type.name} no data within ${this.pingIntervalMS} sec. Sending ping request`)
          super.sendPing()
          
      }, this.pingIntervalMS)

      const socketData = JSON.parse(data as string);
      if (socketData.errorMessage) {
        WsKrakenSpotCollector.logger.error(`got error from websocket: ${socketData.errorMessage}`)
      }

      if (socketData.event == 'pong') {
        WsKrakenSpotCollector.logger.debug(`Got pong message`)
        return
      }
      
      if (Array.isArray(socketData) && socketData[1].length > 0) {
        const klineData = socketData[1]
        
        const tf = this.fetchTimeFrame(socketData[2])

        
        if (socketData[3].includes('XBT')) {
          socketData[3] = socketData[3].replace('XBT', 'BTC')
        }

        if (socketData[3].includes('XDG')) {
          socketData[3] = socketData[3].replace('XDG', 'DOGE')
        }

        const kline: SocketKlineDTO = {
          exchange: ExchangeEnum.kraken,
          symbol: socketData[3].replace('/', ''),
          openTimeMs: klinesGenerator.getTfPeriodMs(tf, Math.trunc(+klineData[0]) * 1000),
          openPrice: klineData[2],
          highPrice: klineData[3],
          lowPrice: klineData[4],
          closePrice: klineData[5],
          timeframe: tf,
          baseAssetVolume: klineData[7],
          transient_status: SendingStatus.NOT_SENT
        } 

        if (kline.symbol == 'BTCUSD') {
          WsKrakenSpotCollector.logger.verbose(`${kline.symbol} ${kline.timeframe} ${moment(+klineData[0] * 1000).format('hh:mm:ss')} got ws candle`)
        }

        if (kline.openTimeMs == 0) {
          WsKrakenSpotCollector.logger.warn(`${kline.symbol} got 0 time candle from ws .Skip it: ${JSON.stringify(kline)}`)
          return
        }

        klinesGenerator.addCandle(kline)

        if (tf == TimeFrameEnum.OneMonth) {
          //const monthKline = {...kline}
          //monthKline.timeframe = TimeFrameEnum.OneMonth
          //kline.openTimeMs = klinesGenerator.getTfPeriodMs(TimeFrameEnum.OneMonth, kline.openTimeMs)
          await klinesGenerator.addGenerateKline(kline)
        }
        
        if (timeframes.find((el) => el == TimeFrameEnum.OneSecond) != undefined) {
          if (tf == TimeFrameEnum.OneMinute) {
            const secKline = {...kline}
            secKline.timeframe = TimeFrameEnum.OneSecond
            secKline.openTimeMs = klinesGenerator.getTfPeriodMs(TimeFrameEnum.OneSecond, +klineData[0] * 1000)
            klinesGenerator.addCandle(secKline)
          }
        }
      }
    };
    super(id, wss, store, message, type, onMessage, WsKrakenSpotCollector.logger)
  }

  private fetchTimeFrame(channel: string): TimeFrameEnum {
    switch (channel) {
      case 'ohlc-21600':
        return TimeFrameEnum.OneMonth // actually two weeks but we generate then 1 month
      case 'ohlc-10080':
        return TimeFrameEnum.OneWeek
      case 'ohlc-1440':
        return TimeFrameEnum.OneDay
      case 'ohlc-240':
        return TimeFrameEnum.FourHours
      case 'ohlc-60':
        return TimeFrameEnum.OneHour
      case 'ohlc-15':
        return TimeFrameEnum.FifteenMinutes
      case 'ohlc-5':
        return TimeFrameEnum.FiveMinutes
      case 'ohlc-1':
        return TimeFrameEnum.OneMinute
      default:
        throw new Error(`timeframe ${channel} not implemented`)
    }
  }

}
