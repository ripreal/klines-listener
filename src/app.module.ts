import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolsModule } from './symbols/symbols.module';
import { KlinesModule } from './klines/klines.module';
import { LoggerModule } from 'nestjs-pino';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get("LOG_LEVEL").toLowerCase(),
          customProps: (req, res) => ({
            context: 'HTTP',
          }),
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              customColors: 'err:red,info:blueBright,warn:yellow,debug:green,message:whiteBright',
              colorizeObjects: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss'
            },
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: process.env.DB_SYNCHRONIZE == 'true',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    SymbolsModule,
    KlinesModule,
  ],
  providers: [],
})
export class AppModule {}
