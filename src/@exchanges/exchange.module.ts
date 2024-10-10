import {  Module } from '@nestjs/common';
import { ExchangeFactory } from './exchange.factory';

@Module({
  providers: [ExchangeFactory],
  exports: [ExchangeFactory],
})
export class ExchangeModule {}
