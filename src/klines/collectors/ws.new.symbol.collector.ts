import { WebSocket } from 'ws';
import { Logger } from '@nestjs/common';
import { SymbolsService } from 'src/symbols/symbol.service';
import { TypeMarket } from 'src/symbols/dto/query.dto';
import { ConfigService } from '@nestjs/config';
import { filterBySymbol } from 'src/utils/filter.utils';

export class WsNewSymbolCollector {

  private readonly logger = new Logger(WsNewSymbolCollector.name);
  private readonly pingIntervalMS: number = 25000

  private time_to_die = false;
  private wsTimeoutId: NodeJS.Timeout = undefined

  constructor(
    private readonly configService: ConfigService,
    private  wss: WebSocket,
    private readonly message: any,
    private readonly symbolService: SymbolsService,
    private readonly type: TypeMarket,
    private readonly socketSymbolsParser: Function,
    private readonly onNewSymbolArrived: Function,
    private readonly needPing: boolean
  ) {
    this.wss = wss;
    this.subscribeWS();
  }

  private async subscribeWS() {
    let symbols = await this.symbolService.getAllSymbols(this.type);
    const currentSymbols = new Set(symbols.map(({symbol}) => symbol))
    
    this.wss.onopen = () => {
      this.wss.send(JSON.stringify(this.message));
      this.logger.debug(`opened connection`)
    };
    this.wss.onmessage = async ({data}) => {
      
      if (this.needPing) {
        if (this.wsTimeoutId) {
          clearTimeout(this.wsTimeoutId)
        }
        this.wsTimeoutId = setTimeout(async () => {
          this.wsTimeoutId = null
          this.logger.debug(`${this.type.exchange} ${this.type.name} no data within ${this.pingIntervalMS} sec. Sending ping request`)
          this.sendPing()
        }, this.pingIntervalMS)
      }

      let socketSymbols = this.socketSymbolsParser.call(this, data)
      if (Array.isArray(socketSymbols)) {
        var newSymbols = socketSymbols.filter(e => !currentSymbols.has(e));
        const symbolFilter = this.configService.get("SYMBOL")
        if (symbolFilter) {
          newSymbols = filterBySymbol(symbolFilter, newSymbols)
        }
     
        for (let symCode of newSymbols) {
          this.logger.debug(`${symCode} found new market symbol`)
          this.onNewSymbolArrived.call(this, symCode)
          currentSymbols.add(symCode)
        }
      }
    };
    this.wss.onclose = (reason) => {
      this.logger.warn(`${this.type.exchange} ${this.type.name} new symbol ws close connection: ${JSON.stringify(this.message)}. Reason: ${reason.reason}`)
      if (!this.time_to_die) {
        this.checkWSConection();
      }
    };
    this.wss.onerror = (err) => {
      this.logger.error(`${this.type.exchange} ${this.type.name} ${this.message} new symbol ws error: ${err.message}`)
      this.release();
    };
  }

  public async checkWSConection() {
    if (this.wss.readyState === WebSocket.CLOSED) {
      this.wss = new WebSocket(this.wss.url);
    }
  }

  // тригернуть сборщик мусора NJS
  public release() {
    if (this.wss.readyState == WebSocket.OPEN) {
      this.time_to_die = true;
      this.wss.close();
    }
  }

  private sendPing() {
    this.wss.send('ping');
  }

}
