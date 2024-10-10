import { WebSocket } from 'ws';
import { TypeMarket } from '../../symbols/dto/query.dto';
import { WsAbstractCollector } from './ws.abstract.collector';
import { Logger } from '@nestjs/common';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import { KlinesTFGenerator } from '../klines.tf.generator';
import { KlinesTFGeneratorOld } from '../klines.tf.generator.old';

export class WsKrakenFuturesCollector extends WsAbstractCollector  {

  public static readonly logger = new Logger(WsKrakenFuturesCollector.name)

  private readonly pingIntervalMS: number = 50000
  private wsTimeoutId: NodeJS.Timeout = undefined
  
  constructor(
    id: number,
    wss: WebSocket,
    klinesGenerator: KlinesTFGenerator | KlinesTFGeneratorOld,
    store: RMQKlinesStore,
    message: any,
    type: TypeMarket,
    configService: ConfigService
  ) {
    
    const stringTimeframes = configService.get('TIMEFRAMES')

    const timeframes = stringTimeframes.split(',').map((t) => t.trim())
    
    const onMessage = async (data) => {
        /*
        if (this.wsTimeoutId) {
          clearTimeout(this.wsTimeoutId)
        }
        this.wsTimeoutId = setTimeout(async () => {
          this.wsTimeoutId = null
          WsKrakenFuturesCollector.logger.debug(`${type.exchange} ${type.name} no data within ${this.pingIntervalMS} sec. Sending ping request`)
          super.sendPing()
          
      }, this.pingIntervalMS)
      */

      const socketData = JSON.parse(data as string);


      if (socketData.event == 'pong') {
        WsKrakenFuturesCollector.logger.debug(`Got pong message`)
        return
      }
      
      if (socketData.feed == 'trade' && socketData.uid != undefined) {

        if (socketData.product_id.includes('XBT')) {
          socketData.product_id = socketData.product_id.replace('XBT', 'BTC')
        }
  
        if (socketData.product_id.includes('XDG')) {
          socketData.product_id = socketData.product_id.replace('XDG', 'DOGE')
        }

        WsKrakenFuturesCollector.logger.verbose(`got ws data: ${data}`)
        await klinesGenerator.addTrade({
            price: new Decimal(socketData.price),
            symbol: socketData.product_id,
            volume: new Decimal(socketData.qty),
            tradeId: socketData.uid,
            time: socketData.time
        }, timeframes)
      }
    };
    super(id, wss, store, message, type, onMessage, WsKrakenFuturesCollector.logger)
  }

}
