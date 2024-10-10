import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolsCoinmFutures } from './entities/futures/symbol.coin.entity';
import { SymbolsUsdmFutures } from './entities/futures/symbol.usdm.entity';
import { Symbols } from './entities/spot/symbol.entity';
import { SymbolsService } from './symbol.service';
import { ExchangeModule } from 'src/@exchanges/exchange.module';
import { SymbolsFutures } from './entities/futures/symbols.futures.entity';
import { SymbolsSwap } from './entities/swap/symbols.swap.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SymbolsCoinmFutures,
      SymbolsUsdmFutures,
      SymbolsFutures,
      SymbolsSwap,
      Symbols,
    ]),
    ExchangeModule,
  ],
  providers: [SymbolsService],
  exports: [SymbolsService],
})
export class SymbolsModule {}
