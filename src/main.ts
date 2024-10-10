import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { KlinesBinanceService } from './klines/klines.binance.service';
import { KlinesOkxService } from './klines/klines.okx.service';
import { KlinesCoinbaseService } from './klines/klines.coinbase.service';
import { Logger } from 'nestjs-pino';
import { config } from "dotenv";
import { KlinesKrakenService } from './klines/klines.kraken.service';

process
  .on('unhandledRejection', (reason, p) => {
    console.error(`Unhandled Rejection at Promise. Reason: ${reason} stack: ${(reason as any)?.stack}`);
  })
  .on('uncaughtException', err => {
    console.error(`Uncaught Exception thrown: ${err} stack: ${err?.stack}`);
  });

async function bootstrap() {

  console.log(`loading config/app.env`)
  config({
    path: "config/app.env"
  })

  console.log(`loading config/${process.env.ACTIVE_PROFILE}.env`)
  config({
    path: `config/${process.env.ACTIVE_PROFILE}.env`
  })

  console.log(`RABBIT_URI=${process.env.RABBIT_URI}`)
  console.log(`DB_HOST=${process.env.DB_HOST}`)

  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  
  const configService = app.get(ConfigService);

  switch (configService.get('EXCHANGE')) {
    case 'binance':
    case 'binance_us': {
      const klineBinance = app.get(KlinesBinanceService);
      await klineBinance.createWSCluster()
      break;
    }
    case 'coinbase':
      const klinesCoinbase = app.get(KlinesCoinbaseService);
      await klinesCoinbase.createWSCluster();
      break;
    case 'okx':
      const klinesOkx = app.get(KlinesOkxService);
      await klinesOkx.createWSCluster();
      break;
    case 'kraken':
      const klinesKraken = app.get(KlinesKrakenService);
      await klinesKraken.createWSCluster();
      break;
  }
}
bootstrap();
