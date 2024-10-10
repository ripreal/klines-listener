import { Injectable, Logger } from '@nestjs/common';
import { SocketKlineDTO } from 'src/klines/dto/socket.kline.dto';
// Временное решение. Суть такая же как и в легаси коде.
@Injectable()
export class CoinbaseMemoryKlinesStore {
  private readonly logger = new Logger(CoinbaseMemoryKlinesStore.name);

  public ByeSellStorage: any = {};
  public ByeSellStorageOneS: any = {};
  public ByeSellStorageOneM: any = {};
  public ByeSellStorageFiveM: any = {};
  public ByeSellStorageFivteenM: any = {};

  public ByeSellStorageOneH: any = {};
  public ByeSellStorageFourH: any = {};
  public ByeSellStorageSixH: any = {};
  public ByeSellStorageOneD: any = {};

  public ByeSellStorageOneW: any = {};
  public ByeSellStorageOneMonth: any = {};

}
