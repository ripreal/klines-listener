import { BadRequestException, Injectable } from '@nestjs/common';
import { TypeMarket, TypeNameEnum } from './dto/query.dto';
import { ExchangeFactory } from 'src/@exchanges/exchange.factory';
import { ConfigService } from '@nestjs/config';
import { filterBySymbol } from 'src/utils/filter.utils';

@Injectable()
export class SymbolsService {
  constructor(private exchangeFactory: ExchangeFactory, 
    private readonly configService: ConfigService) {}

  async getTradeSymbols(type: TypeMarket) {
    const entity = this.getEntitySymbols(type);
    let symbols =  await entity
      .createQueryBuilder('symbol')
      .select('symbol.symbol')
      .addSelect('symbol.tags')
      .addSelect('symbol.productname')
      .addSelect('symbol.quote')
      .addSelect('symbol.base')
      .where('symbol.exchange = :ex', { ex: type.exchange })
      .andWhere('symbol.status = :status', { status: 'TRADING' })
      .getMany()

    const symbolFilter = this.configService.get("SYMBOL")
    if (symbolFilter) {
      symbols = filterBySymbol(symbolFilter, symbols)
    }
    return symbols
  }

  async getAllSymbols(type: TypeMarket) {
    const entity = this.getEntitySymbols(type);
    let symbols = await entity
      .createQueryBuilder('symbol')
      .select('symbol.symbol')
      .addSelect('symbol.tags')
      .addSelect('symbol.productname')
      .addSelect('symbol.quote')
      .where('symbol.exchange = :ex', { ex: type.exchange })
      .getMany();

    const symbolFilter = this.configService.get("SYMBOL")
    if (symbolFilter) {
      symbols = filterBySymbol(symbolFilter, symbols)
    }
    return symbols
  }


  public getEntitySymbols(type: TypeMarket) {
    switch (type.name) {
      case TypeNameEnum.spot:
        return this.exchangeFactory.spot().symbols();
      case TypeNameEnum.swap:
        return this.exchangeFactory.swap().symbols();
      case TypeNameEnum.coinm:
        return this.exchangeFactory.futures().coinm().symbols()
      case TypeNameEnum.usdm:
        return this.exchangeFactory.futures().usdm().symbols()
      case TypeNameEnum.futures:
        return this.exchangeFactory.futures().futures().symbols()
      default:
        throw new BadRequestException(`type ${type.name} not suported`);
    }
  }

}
