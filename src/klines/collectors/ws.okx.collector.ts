import { WebSocket } from 'ws';
import { TypeMarket } from '../../symbols/dto/query.dto';
import { WsAbstractCollector } from './ws.abstract.collector';
import { Logger } from '@nestjs/common';
import TimeFrameEnum from '../entities/timeframe.enum';
import * as moment from 'moment';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';

export class WsOkxCollector extends WsAbstractCollector  {

  public static readonly logger = new Logger(WsOkxCollector.name)

  private readonly pingIntervalMS: number = 25000
  private wsTimeoutId: NodeJS.Timeout = undefined
  
  constructor(
    id: number,
    wss: WebSocket,
    store: RMQKlinesStore,
    message: any,
    type: TypeMarket,
  ) {
    const onMessage = async (data) => {

        if (this.wsTimeoutId) {
          clearTimeout(this.wsTimeoutId)
        }
        this.wsTimeoutId = setTimeout(async () => {
          this.wsTimeoutId = null
          WsOkxCollector.logger.debug(`${type.exchange} ${type.name} no data within ${this.pingIntervalMS} sec. Sending ping request`)
          super.sendPing()
          
      }, this.pingIntervalMS)

      if (data == 'pong') {
        WsOkxCollector.logger.debug(`Got pong message`)
        return
      }
    
      const socketData = JSON.parse(data as string);
      if (Array.isArray(socketData.data) && socketData.data[0].length > 0) {
          const klineData = socketData.data[0]
          const tf = this.fetchTimeFrame(socketData.arg.channel)

          let opened =+klineData[0]
          super.storeData({
            exchange: ExchangeEnum.okx,
            symbol: socketData.arg.instId,
            openTimeMs: opened,
            openPrice: klineData[1],
            highPrice: klineData[2],
            lowPrice: klineData[3],
            closePrice: klineData[4],
            timeframe: tf,
            baseAssetVolume: klineData[5],
            transient_status: undefined
          });
          return;
      }
    };
    super(id, wss, store, message, type, onMessage, WsOkxCollector.logger)
  }

  private fetchTimeFrame(channel: string): TimeFrameEnum {
    switch (channel) {
      case 'candle1Mutc':
        return TimeFrameEnum.OneMonth
      case 'candle1Wutc':
        return TimeFrameEnum.OneWeek
      case 'candle1Dutc':
        return TimeFrameEnum.OneDay
      case 'candle4H':
        return TimeFrameEnum.FourHours
      case 'candle1H':
        return TimeFrameEnum.OneHour
      case 'candle15m':
        return TimeFrameEnum.FifteenMinutes
      case 'candle5m':
          return TimeFrameEnum.FiveMinutes
      case 'candle1m':
        return TimeFrameEnum.OneMinute
      case 'candle1s':
        return TimeFrameEnum.OneSecond
      default:
        throw new Error(`timeframe ${channel} not implemented`)
    }
  }

}
