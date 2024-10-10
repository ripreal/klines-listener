import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SymbolsService } from '../symbols/symbol.service';
import { TypeMarket, TypeNameEnum } from '../symbols/dto/query.dto';
import { WebSocket } from 'ws';
import { Cron } from '@nestjs/schedule';
import { WsNewSymbolCollector } from './collectors/ws.new.symbol.collector';
import { WsCoinbaseCollector } from './collectors/ws.coinbase.collector';
import { KlinesWSService } from './interfaces';
import { filterBySymbol } from 'src/utils/filter.utils';
import TimeFrameEnum from './entities/timeframe.enum';
import { KlinesTFGenerator } from './klines.tf.generator';
import { ExchangeEnum } from 'src/symbols/entities/exhange.enum';
import { KlinesTFGeneratorOld } from './klines.tf.generator.old';

@Injectable()
export class KlinesCoinbaseService implements KlinesWSService {
  private objectCluster: WsCoinbaseCollector[] = [];
  private newSymbolsCluster: WsNewSymbolCollector
  private logger = new Logger(KlinesCoinbaseService.name);
  private readonly timeframes: TimeFrameEnum[]

  constructor(
    private readonly klinesTFGenerator: KlinesTFGeneratorOld,
    private readonly configService: ConfigService,
    private readonly symbolService: SymbolsService
  ) {

    const stringTimeframes = this.configService.get('TIMEFRAMES')
    this.timeframes = stringTimeframes.split(',').map((t) => t.trim())
  }
  

  async createWSCluster() {
    this.logger.debug(`start ${JSON.stringify(this.getType())}`);
    let symbols = await this.symbolService.getTradeSymbols(this.getType());
    await this.addWsCoinbaseCollector(symbols)
    await this.addNewSymbolCollector()
  }

  private addWsCoinbaseCollector(symbols: {symbol: string}[]) {
    this.objectCluster.push(
      new WsCoinbaseCollector(this.newSocket(), this.klinesTFGenerator, this.subscribeMessage(symbols), this.configService));
  }

  private subscribeMessage(symbols: {symbol: string}[]) {
    return {
        type: 'subscribe',
        channels: [
          { name: 'matches', product_ids: symbols.map((s) => s.symbol) },
          { name: 'heartbeat', product_ids: symbols.map((s) => s.symbol) },
        ],
    }
  }
  

  private async addNewSymbolCollector() {
    this.newSymbolsCluster = new WsNewSymbolCollector(
      this.configService,
      this.newSocket(), 
      {
        type: 'subscribe',
        channels: ['status'],
      }, 
      this.symbolService, 
      this.getType(), 
      (data) => {
        const socketData = JSON.parse(data as string)
        if (Array.isArray(socketData.products)) {
          return socketData.products.map(({id}) => id)
        } else {
          this.logger.debug(`new symbol watch subscription result: ${JSON.stringify(socketData)}`)
        }
      },
      (newSymbol) => {
        this.addWsCoinbaseCollector([{symbol: newSymbol}])
      }, 
      false)
  }

  @Cron('59 59 23 * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.coinbase)})
  async restartCluster() {
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

  @Cron('*/5 * * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.coinbase)})
  async generateEmptyKlinesJob() {
   await this.klinesTFGenerator.generateEmptyKlines(this.timeframes)
  }

  @Cron('*/5 * * * * *', {disabled: !(process.env.EXCHANGE == ExchangeEnum.coinbase)})
  async insertKlines() {
    return this.klinesTFGenerator.insertKlines(this.timeframes)
  }

  private getType(): TypeMarket {
    return {
      name: this.configService.get('TYPE'),
      exchange: this.configService.get('EXCHANGE'),
    };
  }

  private newSocket(): WebSocket {
    return new WebSocket('wss://ws-feed.exchange.coinbase.com');
  }

}
