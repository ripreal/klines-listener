import { ExchangeEnum } from "src/symbols/entities/exhange.enum"
import TimeFrameEnum from "../entities/timeframe.enum"

export interface SocketKlineDTO {
    exchange: ExchangeEnum,
    symbol: string
    timeframe: TimeFrameEnum
    openTimeMs: number
    openPrice: string
    highPrice: string
    lowPrice: string
    closePrice: string
    baseAssetVolume: string
    transient_status: SendingStatus
}

export enum SendingStatus {
    NOT_SENT = 'NOT_SENT',
    SENT = 'SENT'
}