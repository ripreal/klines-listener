import TimeFrameEnum from "src/klines/entities/timeframe.enum"
import { STORAGE_TYPES } from "./interface"

export interface Config {
    readonly TYPE: string,
    readonly EXCHANGE: string,
    readonly DB_HOST: string,
    readonly DB_PORT: number,
    readonly DB_USERNAME: string,
    readonly DB_PASSWORD: string,
    readonly DB_DATABASE: string,
    readonly DB_SYNCHRONIZE: boolean
    readonly STORAGE_TYPE: STORAGE_TYPES 
    readonly RABBIT_URI: string,
    readonly RABBIT_CONNECTION_POOL: number
    readonly LOG_LEVEL: string
    readonly TIMEFRAMES: string
}
