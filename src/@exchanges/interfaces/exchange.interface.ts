import TimeFrameEnum from 'src/klines/entities/timeframe.enum';
import { Repository } from 'typeorm';

export interface Exchange {
  api(): ApiInterface;
}

export interface Futures {
  usdm(): ExchangeRepo;
  futures(): ExchangeRepo;
  coinm(): ExchangeRepo;
}

export interface ExchangeRepo {
  oneSecond(): Repository<any>;
  oneMinute(): Repository<any>;
  fiveMinutes(): Repository<any>;
  fifteenMinutes(): Repository<any>;
  oneHour(): Repository<any>;
  fourHours(): Repository<any>;
  oneDay(): Repository<any>;
  oneWeek(): Repository<any>;
  oneMonth(): Repository<any>;
  symbols(): Repository<any>;
  forTimeFrame(tf: TimeFrameEnum): Repository<any>;
}

export interface ApiInterface {
  spot(): ExchangeApi;
  usdm(): ExchangeApi;
  coinm(): ExchangeApi;
}

export interface ExchangeApi {
  exchangeInfo(symbol?: string): Promise<any>;
  getSymbols(): Promise<any>;
  getPrice(): Promise<any[]> 
}