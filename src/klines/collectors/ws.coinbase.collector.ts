import { WebSocket } from 'ws'
import { Logger } from '@nestjs/common'
import Decimal from 'decimal.js';
import { ConfigService } from '@nestjs/config';
import TimeFrameEnum from '../entities/timeframe.enum';
import { KlinesTFGenerator } from '../klines.tf.generator';
import { KlinesTFGeneratorOld } from '../klines.tf.generator.old';

export class WsCoinbaseCollector {

  private readonly logger = new Logger(WsCoinbaseCollector.name);
  private readonly timeframes: TimeFrameEnum[]

  private time_to_die = false;

  constructor(
    private wss: WebSocket,
    private readonly klinesGenerator: KlinesTFGeneratorOld,
    private readonly message,
    private readonly configService: ConfigService,
  ) {
    this.subscribeWS();
    const stringTimeframes = this.configService.get('TIMEFRAMES')
    this.timeframes = stringTimeframes.split(',').map((t) => t.trim())
  }

  // тригернуть сборщик мусора NJS
  public release() {
    if (this.wss.readyState !== WebSocket.CLOSED) {
      this.time_to_die = true;
      this.wss.close();
    }
  }

  private async subscribeWS() {

    this.wss.onopen = () => {
      this.wss.send(JSON.stringify(this.message))
      this.logger.debug(`opened connection`)
    };
    this.wss.on('message', async (data: Buffer) => {
      const msg = JSON.parse(data.toString())
      if (msg. type === 'match' || msg.type === 'last_match') {
        if (msg.product_id == 'BTC-USDT') {
          this.logger.debug(`${msg.product_id} new websocket message arrived: ${data.toString()}`)
        }
        await this.klinesGenerator.addTrade({
          price: new Decimal(msg.price),
          symbol: msg.product_id,
          volume: new Decimal(msg.size),
          tradeId: msg.trade_id,
          time: new Date(msg.time).getTime()
        }, this.timeframes)
      } else if (msg.type == 'error') {
        this.logger.error(`error when subscribing: ${JSON.stringify(msg)}`)
      }
    });
    this.wss.onclose = (reason) => {
      this.logger.warn(`close connection. Time to die: ${this.time_to_die}. Reason: ${JSON.stringify(reason)}`)
      if (!this.time_to_die) {
        this.checkWSConection()
      }
    };
    this.wss.onerror = (err) => {
      this.logger.error(`ws error: ${err.message}`)
      this.release();
    };
  }

  private async checkWSConection() {
    if (this.wss.readyState === WebSocket.CLOSED) {
      this.logger.debug(`Reopening the collector socket`)
      this.wss = new WebSocket(this.wss.url);
      this.subscribeWS()
    }
  }

}