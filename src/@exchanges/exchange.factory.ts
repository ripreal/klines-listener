import { Inject, Injectable } from '@nestjs/common';
import { Exchange, Futures, ExchangeRepo } from './interfaces/exchange.interface';
import { DataSource } from 'typeorm';
import { FuturesBuilder } from './builder/futures/futures.builder';
import { SpotBusiness } from './builder/spot/spot.business';
import { SwapBusiness } from './builder/swap/swap.business';

@Injectable()
export class ExchangeFactory {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  futures(): Futures {
    return new FuturesBuilder(this.dataSource);
  }

  spot(): ExchangeRepo {
    return new SpotBusiness(this.dataSource);
  }

  swap(): ExchangeRepo {
    return new SwapBusiness(this.dataSource);
  }
}
