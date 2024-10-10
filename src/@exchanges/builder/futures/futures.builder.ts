import {
  Futures,
  ExchangeRepo,
} from 'src/@exchanges/interfaces/exchange.interface';
import { DataSource } from 'typeorm';
import { CoinmBusiness } from './coinm.business';
import { UsdmBusiness } from './usdm.business';
import { FuturesBusiness } from './futures.business';

export class FuturesBuilder implements Futures {
  constructor(private dataSource: DataSource) {}
  futures(): ExchangeRepo {
    return new FuturesBusiness(this.dataSource);
  }

  usdm(): ExchangeRepo {
    return new UsdmBusiness(this.dataSource);
  }
  coinm(): ExchangeRepo {
    return new CoinmBusiness(this.dataSource);
  }
}
