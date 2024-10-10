import { WebSocket } from 'ws';
import { TypeMarket, TypeNameEnum } from '../../symbols/dto/query.dto';
import { Logger } from '@nestjs/common';
import { SocketKlineDTO } from '../dto/socket.kline.dto';
import { RMQKlinesStore } from 'src/@klines_store/rmq.klines.store';

export class WsAbstractCollector {

  private time_to_die = false;

  constructor(
    public readonly id: number,
    protected wss: WebSocket,
    private readonly klinesStore: RMQKlinesStore,
    private readonly message: any | any[],
    private readonly type: TypeMarket,
    private readonly onMessage: Function,
    private logger: Logger
  ) {
    this.subscribeWS();
  }

  private async subscribeWS() {
    this.wss.onopen = () => {
      this.wss['id'] = this.id;

      if (Array.isArray(this.message)) {
        for (const mesObj of this.message) {
          this.wss.send(JSON.stringify(mesObj));
        }
      } else {
        this.wss.send(JSON.stringify(this.message));
      }
      
      this.logger.debug(`${this.id} opened connection`)
    };
    this.wss.onmessage = async ({ data }) => {
      this.onMessage(data)
    };

    this.wss.onclose = (reason) => {
      this.logger.warn(`${this.id} ${this.type.name} close connection. Reason: ${JSON.stringify(reason.reason)}`)
      if (!this.time_to_die) {
        this.checkWSConection();
      }
    };
    this.wss.onerror = (err) => {
      this.logger.error(`${this.id} ${this.type.name} ws error: ${err.message}. Details:  ${JSON.stringify(this.message)}`)
      this.release();
    };
  }

  public async checkWSConection() {
    if (this.wss.readyState === WebSocket.CLOSED) {
      this.logger.debug(`${this.id} ${this.type.name} Reopening the collector socket`)
      this.wss = new WebSocket(this.wss.url);
      await this.subscribeWS()
    }
  }

  protected sendPing() {
    this.wss.send(JSON.stringify({"event": 'ping'}))
  }

  async storeData(socketKline: SocketKlineDTO): Promise<any> {
    this.logger.verbose(`${socketKline.symbol} ${socketKline.timeframe} opened:${socketKline.openTimeMs} got kline for sending to RMQ`)
    return this.klinesStore.pushKline(socketKline)
  }

  // тригернуть сборщик мусора NJS
  public release() {
    if (this.wss.readyState !== WebSocket.CLOSED) {
      this.time_to_die = true;
      this.wss.close();
      return { status: true};
    }
    return { status: false };
  }
}
