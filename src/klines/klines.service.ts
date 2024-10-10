import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExchangeFactory } from "src/@exchanges/exchange.factory";
import { ExchangeRepo } from "src/@exchanges/interfaces/exchange.interface";
import TimeFrameEnum from "./entities/timeframe.enum";
import { SocketKlineDTO } from "./dto/socket.kline.dto";
import { ExchangeEnum } from "src/symbols/entities/exhange.enum";
import { TypeNameEnum } from "src/symbols/dto/query.dto";

@Injectable()
export class KlinesService  {

  constructor(private exchangeFactory: ExchangeFactory, private readonly configService: ConfigService) {}
  
  public async getLastKlines(timeframe: TimeFrameEnum): Promise<SocketKlineDTO[]> {

    const entityRepo = this.getExchange().forTimeFrame(timeframe)

    const textQuery = `
    SELECT klines.*,
    '${timeframe}' as timeframe
    FROM ${entityRepo.metadata.tableName} AS klines
    INNER JOIN 
      (SELECT
      symbol AS symbol, 
      MAX(opened) AS opened
      FROM ${entityRepo.metadata.tableName}
      WHERE exchange = '${this.configService.get('EXCHANGE')}'
      GROUP BY
      symbol) 
      AS klines_periods
    ON klines.exchange = '${this.configService.get('EXCHANGE')}'
    AND klines.symbol = klines_periods.symbol 
    AND klines.opened = klines_periods.opened
    `
    const klines = await entityRepo.query(textQuery)

    const socketKlines = klines.map(kline => {
      const socketKline = {} as SocketKlineDTO
      socketKline.exchange = ExchangeEnum[kline.exchange]
      socketKline.openTimeMs = +kline.opened
      
      socketKline.symbol = kline.symbol
      socketKline.openPrice = kline.open_price.toString()
      socketKline.closePrice = kline.close_price.toString()
      socketKline.lowPrice = kline.low_price.toString()
      socketKline.highPrice = kline.high_price.toString()
      socketKline.baseAssetVolume = kline.volume.toString()
      socketKline.timeframe = timeframe
  
      let t1 = (socketKline as any)
      t1.openTimeDebug = new Date(kline.opened)
      return socketKline
    })
    
    return socketKlines
  }

  public async getLastKline(
    timeframe: TimeFrameEnum,
    symbol: string,
  ): Promise<SocketKlineDTO> {
    
    const kline = await this.getExchange()
      .forTimeFrame(timeframe)
      .createQueryBuilder()
      .where('exchange = :ex', { ex: this.configService.get('EXCHANGE') })
      .andWhere('symbol = :symbol', { symbol })
      .limit(1)
      .orderBy('opened', 'DESC')
      .getOne();
    
    if (!kline) {
      return undefined
    }
    const socketKline = {} as SocketKlineDTO
    socketKline.exchange = ExchangeEnum[kline.exchange]
    socketKline.openTimeMs = kline.opened
    
    socketKline.symbol = kline.symbol
    socketKline.openPrice = kline.open_price.toString()
    socketKline.closePrice = kline.close_price.toString()
    socketKline.lowPrice = kline.low_price.toString()
    socketKline.highPrice = kline.high_price.toString()
    socketKline.baseAssetVolume = kline.volume.toString()
    socketKline.timeframe = timeframe

    let t1 = (socketKline as any)
    t1.openTimeDebug = new Date(kline.opened)

    return socketKline
  }

  private getExchange(): ExchangeRepo {
    const type = this.configService.get('TYPE')
    switch (type) {
      case TypeNameEnum.spot:
        return this.exchangeFactory.spot()
      case TypeNameEnum.futures:
        return this.exchangeFactory.futures().futures()
      case TypeNameEnum.swap:
        return this.exchangeFactory.swap()
      default:
        throw new Error(`not implemented for: ${type}`)
    }

  }
}