import { Injectable, Logger } from '@nestjs/common';
import { SocketKlineDTO } from 'src/klines/dto/socket.kline.dto';
import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
// Временное решение. Суть такая же как и в легаси коде.
@Injectable()
export class ObjectMemoryKlinesStore {
  private readonly logger = new Logger(ObjectMemoryKlinesStore.name)

  private readonly storage1s: any = {};
  private readonly storage1m: any = {};
  private readonly storage5m: any = {};
  private readonly storage15m: any = {};
  private readonly storage1h: any = {};
  private readonly storage4h: any = {};
  private readonly storage1d: any = {};
  private readonly storage1w: any = {};
  private readonly storage1M: any = {};

  public put(timeframe: TimeFrameEnum, kline: SocketKlineDTO): void {
    if (!kline) {
      return
    }

    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        if (!this.storage1s[kline.symbol]) this.storage1s[kline.symbol] = {}
        this.storage1s[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.OneMinute:
        if (!this.storage1m[kline.symbol]) this.storage1m[kline.symbol] = {}
        this.storage1m[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.FiveMinutes:
        if (!this.storage5m[kline.symbol]) this.storage5m[kline.symbol] = {}
        this.storage5m[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.FifteenMinutes:
        if (!this.storage15m[kline.symbol]) this.storage15m[kline.symbol] = {}
        this.storage15m[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.OneHour:
        if (!this.storage1h[kline.symbol]) this.storage1h[kline.symbol] = {}
        this.storage1h[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.FourHours:
        if (!this.storage4h[kline.symbol]) this.storage4h[kline.symbol] = {}
        this.storage4h[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.OneDay:
        if (!this.storage1d[kline.symbol]) this.storage1d[kline.symbol] = {}
        this.storage1d[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.OneWeek:
        if (!this.storage1w[kline.symbol]) this.storage1w[kline.symbol] = {}
        this.storage1w[kline.symbol][kline.openTimeMs] = kline
        break
      case TimeFrameEnum.OneMonth:
        if (!this.storage1M[kline.symbol]) this.storage1M[kline.symbol] = {}
        this.storage1M[kline.symbol][kline.openTimeMs] = kline
        break
      default:
        throw new Error(`storage not implemented: ${timeframe}`)
    }
  }

  public get(timeframe: TimeFrameEnum, symbol: string, period: number): SocketKlineDTO {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        return this.storage1s[symbol] && this.storage1s[symbol][period]
      case TimeFrameEnum.OneMinute:
        return this.storage1m[symbol] && this.storage1m[symbol][period]
      case TimeFrameEnum.FiveMinutes:
        return this.storage5m[symbol] && this.storage5m[symbol][period]
      case TimeFrameEnum.FifteenMinutes:
        return this.storage15m[symbol] && this.storage15m[symbol][period]
      case TimeFrameEnum.OneHour:
        return this.storage1h[symbol] && this.storage1h[symbol][period]
      case TimeFrameEnum.FourHours:
        return this.storage4h[symbol] && this.storage4h[symbol][period]
      case TimeFrameEnum.OneDay:
        return this.storage1d[symbol] && this.storage1d[symbol][period]
      case TimeFrameEnum.OneWeek:
        return this.storage1w[symbol] && this.storage1w[symbol][period]
      case TimeFrameEnum.OneMonth:
        return this.storage1M[symbol] && this.storage1M[symbol][period]
      default:
        throw new Error(`getting from storage not implemented: ${timeframe}`)
    }
  }

  public isStarted(timeframe: TimeFrameEnum, symbol: string) {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        return this.storage1s[symbol] != undefined
      case TimeFrameEnum.OneMinute:
        return this.storage1m[symbol] != undefined
      case TimeFrameEnum.FiveMinutes:
        return this.storage5m[symbol] != undefined
      case TimeFrameEnum.FifteenMinutes:
        return this.storage15m[symbol] != undefined
      case TimeFrameEnum.OneHour:
        return this.storage1h[symbol] != undefined
      case TimeFrameEnum.FourHours:
        return this.storage4h[symbol] != undefined
      case TimeFrameEnum.OneDay:
        return this.storage1d[symbol] != undefined
      case TimeFrameEnum.OneWeek:
        return this.storage1w[symbol] != undefined
      case TimeFrameEnum.OneMonth:
        return this.storage1M[symbol] != undefined
      default:
        throw new Error(`getting from storage not implemented: ${timeframe}`)
    }
  }


  public getLast(timeframe: TimeFrameEnum, symbol: string): SocketKlineDTO {
    const allPeriods = this.getAllPeriods(timeframe, symbol)
    allPeriods.sort((a, b) => +b - +a)
    return this.get(timeframe, symbol, +allPeriods[0])
  }

  public getAllPeriodsOrderedAsc(timeframe: TimeFrameEnum, symbol: string): SocketKlineDTO[] {
    const allPeriods = this.getAllPeriods(timeframe, symbol)
    allPeriods.sort((a, b) => +a - +b )
    const result = allPeriods.flatMap(period => this.get(timeframe, symbol, +period))
    return result
  }

  public getAllSymbols(timeframe: TimeFrameEnum): string[] {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        return Object.keys(this.storage1s)
      case TimeFrameEnum.OneMinute:
        return Object.keys(this.storage1m)
      case TimeFrameEnum.FiveMinutes:
        return Object.keys(this.storage5m)
      case TimeFrameEnum.FifteenMinutes:
        return Object.keys(this.storage15m)
      case TimeFrameEnum.OneHour:
        return Object.keys(this.storage1h)
      case TimeFrameEnum.FourHours:
        return Object.keys(this.storage4h)
      case TimeFrameEnum.OneDay:
        return Object.keys(this.storage1d)
      case TimeFrameEnum.OneWeek:
        return Object.keys(this.storage1w)
      case TimeFrameEnum.OneMonth:
        return Object.keys(this.storage1M)
      default:
        throw new Error(`getting all from storage not implemented: ${timeframe}`)
    }
  }
  
  public getAllPeriods(timeframe: TimeFrameEnum, symbol: string): string[] {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        return Object.keys(this.storage1s[symbol] || {})
      case TimeFrameEnum.OneMinute:
        return Object.keys(this.storage1m[symbol] || {})
      case TimeFrameEnum.FiveMinutes:
        return Object.keys(this.storage5m[symbol] || {})
      case TimeFrameEnum.FifteenMinutes:
        return Object.keys(this.storage15m[symbol] || {})
      case TimeFrameEnum.OneHour:
        return Object.keys(this.storage1h[symbol] || {})
      case TimeFrameEnum.FourHours:
        return Object.keys(this.storage4h[symbol] || {})
      case TimeFrameEnum.OneDay:
        return Object.keys(this.storage1d[symbol] || {})
      case TimeFrameEnum.OneWeek:
        return Object.keys(this.storage1w[symbol] || {})
      case TimeFrameEnum.OneMonth:
        return Object.keys(this.storage1M[symbol] || {})
      default:
        throw new Error(`getting all from storage not implemented: ${timeframe}`)
    }
  }

  public delete(timeframe: TimeFrameEnum, symbol: string, period: number) {
    switch (timeframe) {
      case TimeFrameEnum.OneSecond:
        delete this.storage1s[symbol][period]
        break
      case TimeFrameEnum.OneMinute:
        delete this.storage1m[symbol][period]
        break
      case TimeFrameEnum.FiveMinutes:
        delete this.storage5m[symbol][period]
        break
      case TimeFrameEnum.FifteenMinutes:
        delete this.storage15m[symbol][period]
        break
      case TimeFrameEnum.OneHour:
        delete this.storage1h[symbol][period]
        break
      case TimeFrameEnum.FourHours:
        delete this.storage4h[symbol][period]
        break
      case TimeFrameEnum.OneDay:
        delete this.storage1d[symbol][period]
        break
      case TimeFrameEnum.OneWeek:
        delete this.storage1w[symbol][period]
        break
      case TimeFrameEnum.OneMonth:
        delete this.storage1M[symbol][period]
        break
      default:
        throw new Error(`storage not implemented: ${timeframe}`)
    }
  }

}