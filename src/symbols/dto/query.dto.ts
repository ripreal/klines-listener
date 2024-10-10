import { ExchangeEnum } from "../entities/exhange.enum";

export class TypeMarket {
  name: TypeNameEnum;
  exchange: ExchangeEnum;
}

export enum TypeNameEnum {
  spot = 'spot',
  swap = 'swap',
  coinm = 'coinm',
  usdm = 'usdm',
  futures = 'futures',
}
