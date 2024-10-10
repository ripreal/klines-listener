import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SymbolsService } from '../symbols/symbol.service';
import TimeFrameEnum from './entities/timeframe.enum';
import {
  TypeMarket,
  TypeNameEnum,
} from '../symbols/dto/query.dto';
import { WebSocket } from 'ws';
import { WsNewSymbolCollector } from './collectors/ws.new.symbol.collector';
import { ExchangeFactory } from 'src/@exchanges/exchange.factory';
import { WsOkxCollector } from './collectors/ws.okx.collector';
import { KlinesWSService } from './interfaces';
import { sleep } from 'src/utils/thread.utils';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import { Cron } from '@nestjs/schedule';
import { WsAbstractCollector } from './collectors/ws.abstract.collector';
import { filterBySymbol } from 'src/utils/filter.utils';

export abstract class KlinesAbstractService implements KlinesWSService {
  protected objectCluster: WsAbstractCollector[] = [];
  
  private newSymbolsCluster: WsNewSymbolCollector

  protected symbols: {symbol: string}[] = []

  constructor(
    protected readonly configService: ConfigService,
    protected readonly exchangeFactory: ExchangeFactory,
    protected readonly symbolService: SymbolsService,
    protected readonly logger: Logger
  ) {}

  // INTERFACE

  protected abstract newSocket(): WebSocket

  protected abstract getWSCollector(symbols: {symbol: string}[], id: number)

  protected abstract getNewSymbolCollector(onNewSymbolArrived: Function)

  protected abstract getStep(): number

  // 

  public async createWSCluster() {

    this.symbols = await this.symbolService.getTradeSymbols(this.getType());
    //this.symbols = this.symbols.filter(symbol => symbol.symbol == 'BTC-USD-240329')
    if (!this.symbols || this.symbols.length == 0) {
      this.logger.warn(`no symbols found in database. Skip candlestick websocket subscribing`)
    }

    this.logger.debug(`start ${JSON.stringify(this.getType())}`);
    const step = this.getStep()
    
    for (let i = 0; i < this.symbols.length; i += step) {
      const symbolsChunk: any = this.symbols.slice(i, i + step);
      this.objectCluster.push(this.getWSCollector(symbolsChunk, i));
    }
    
    this.logger.debug(`Set ${this.objectCluster.length} WS connection(s)`,);
    
    this.newSymbolsCluster = this.getNewSymbolCollector( (newSymbol) => {
      this.objectCluster.push(this.getWSCollector([{symbol: newSymbol}], this.objectCluster.length));
      this.logger.debug(`${newSymbol} set new WS connection`);
    })
    
  }

  protected getType(): TypeMarket {
    const type = this.configService.get('TYPE');
    const ex = this.configService.get('EXCHANGE');
    if (!ex) {
      throw new BadRequestException('EXCHANGE not found');
    }
    return {
      name: TypeNameEnum[type],
      exchange: ExchangeEnum[ex],
    }
  }

  protected async restartCluster() {
    this.objectCluster.forEach(collector => {
      collector.release()
    })
    this.objectCluster = []
    if (this.newSymbolsCluster) {
      this.newSymbolsCluster.release()
      delete this.newSymbolsCluster
    }
    
    this.logger.debug('restart cluster');
    await this.createWSCluster();
  }

  protected getTimeframes(): TimeFrameEnum[] {
    const stringTimeframes = this.configService.get('TIMEFRAMES')
    const timeframes = stringTimeframes.split(',').map((t) => t.trim());
    return timeframes
  }

  protected async observeNewSymbols() {
    if (this.symbols.length == 0) {
      // not initialized yet
      return
    }
    const dbSymbols = await this.symbolService.getTradeSymbols(this.getType())
    
    let newSymbols = dbSymbols.filter(dbSymbol => !this.symbols.find((curSymbol) => curSymbol.symbol == dbSymbol.symbol))

    const symbolFilter = this.configService.get("SYMBOL")
    if (symbolFilter) {
      newSymbols = filterBySymbol(symbolFilter, newSymbols)
    }

    for (let symbol of newSymbols) {
      this.logger.debug(`${symbol.symbol} found new market symbol using observeNewSymbols job`)
      this.symbols.push(symbol)
    }
    if (newSymbols.length > 0) {
      this.objectCluster.push(this.getWSCollector(newSymbols, this.objectCluster.length));
    }
  }

}
