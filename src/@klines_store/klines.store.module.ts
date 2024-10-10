import { Module } from '@nestjs/common';
import { CoinbaseMemoryKlinesStore } from './coinbase.memory.klines.store';
import { RMQKlinesStore } from './rmq.klines.store';
import { RMQModule } from 'src/@rmq/rmq.module';
import { ObjectMemoryKlinesStore } from './object.memory.klines.store';
@Module({
  imports: [
    RMQModule,
  ],
  providers: [
    CoinbaseMemoryKlinesStore,
    RMQKlinesStore,
    ObjectMemoryKlinesStore,
  ], 
  exports: [RMQKlinesStore, CoinbaseMemoryKlinesStore, ObjectMemoryKlinesStore],
})
export class KlinesStoreModule {}
