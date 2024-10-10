import { Kline } from "src/klines/entities/kline.class"
import TimeFrameEnum from "src/klines/entities/timeframe.enum"
import * as moment from 'moment';
import { toTimeframeInSec } from "src/@exchanges/exchange.utils";
import { SendingStatus, SocketKlineDTO } from "src/klines/dto/socket.kline.dto";
import { ObjectMemoryKlinesStore } from "src/@klines_store/object.memory.klines.store";
import { Logger } from '@nestjs/common';

const logger = new Logger("gaps.generator")

export const generateCandlesForGaps = (sourceCandlesDesc: SocketKlineDTO[], timeframe: TimeFrameEnum, klinesCache: ObjectMemoryKlinesStore) : void => {

  for (let i = 1; i < sourceCandlesDesc.length; i++) {
    const current = sourceCandlesDesc[i]
    const currentMoment = moment(current.openTimeMs)
    const prev = sourceCandlesDesc[i - 1]
    const prevMoment = moment(prev.openTimeMs)
    
    const diff = calcDiff(sourceCandlesDesc[0].symbol, timeframe, prevMoment, currentMoment)

    for (let r = 2; r <= diff; r++) {
      const kline = {} as  SocketKlineDTO
      kline.symbol = prev.symbol
      if (timeframe == TimeFrameEnum.OneMonth) {
        kline.openTimeMs = prevMoment.add(1, 'month').toDate().getTime()
      } else {
        kline.openTimeMs = prevMoment.add(toTimeframeInSec(timeframe), 'seconds').toDate().getTime()
      }
      kline.exchange = prev.exchange
      kline.baseAssetVolume = '0'
      kline.closePrice = prev.closePrice
      kline.highPrice = prev.closePrice
      kline.lowPrice = prev.closePrice
      kline.openPrice = prev.closePrice
      kline.timeframe = timeframe
      kline.transient_status = SendingStatus.NOT_SENT
      const foundRealKline = klinesCache.get(timeframe, kline.symbol, kline.openTimeMs)
      if (!foundRealKline) {
        klinesCache.put(timeframe, kline)
      }
    }
  }
}

export const generateCandlesForBorders = (startCandle: SocketKlineDTO, timeframe: TimeFrameEnum, endMoment: moment.Moment, klinesCache: ObjectMemoryKlinesStore) : void => {

  const startMoment = moment(startCandle.openTimeMs)

  const diff = calcDiff(startCandle.symbol, timeframe, startMoment, endMoment)

  for (let r = 1; r <= diff; r++) {
    const kline = {} as  SocketKlineDTO
    kline.symbol = startCandle.symbol
    if (timeframe == TimeFrameEnum.OneMonth) {
      kline.openTimeMs = startMoment.add(1, 'month').toDate().getTime() 
    } else {
      kline.openTimeMs = startMoment.add(toTimeframeInSec(timeframe), 'seconds').toDate().getTime() 
    }
    kline.exchange = startCandle.exchange
    kline.baseAssetVolume = '0'
    kline.closePrice = startCandle.closePrice
    kline.highPrice = startCandle.closePrice
    kline.lowPrice = startCandle.closePrice
    kline.openPrice = startCandle.closePrice
    kline.timeframe = timeframe
    kline.transient_status = SendingStatus.NOT_SENT
    const foundRealKline = klinesCache.get(timeframe, kline.symbol, kline.openTimeMs)
    if (!foundRealKline) {
      klinesCache.put(timeframe, kline)
    }
  }
}

function calcDiff(symbol: string, timeframe: TimeFrameEnum, startMoment: any, endMoment: any) : number {
  let diff = 0;
  if (timeframe as any == TimeFrameEnum.OneSecond) {
    const limit = 180;
    diff = endMoment.diff(startMoment, 'seconds');
    if (diff > limit) {
      logger.warn(`${symbol} Empty candles generator will reduce candles cause amount exceeded limit: diff:${diff}, limit:${limit}, start: ${startMoment.format('hh:mm:ss')} end: ${endMoment.format('hh:mm:ss')}`);
    }
    diff = Math.min(limit, diff);
  } else if (timeframe == TimeFrameEnum.OneMonth) {
    diff = endMoment.diff(startMoment, 'month')
  } else {
    const limit = 10000;
    diff = endMoment.diff(startMoment, 'minute');
    diff = Math.floor(diff / (this.toTimeframeInSec(timeframe) / 60));
    if (diff > limit) {
      logger.warn(`${symbol} Empty candles generator will reduce candles cause amount exceeded limit: diff:${diff}, limit:${limit}, start: ${startMoment.format('hh:mm:ss')} end: ${endMoment.format('hh:mm:ss')}`);
    }
    diff = Math.min(limit, diff);
  }
  return diff
}