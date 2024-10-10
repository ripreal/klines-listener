import TimeFrameEnum from "src/klines/entities/timeframe.enum";

export const toTimeframeInSec = (tf: TimeFrameEnum): number => {
    switch (tf) {
        case '1s':
            return 1;
        case '1m':
            return 60;
        case '5m':
            return 300;
        case '15m':
            return 900;
        case '1h':
            return 3600;
        case '4h':
            return 14400;
        case '1d':
            return 86400;
        case '1w':
            return 604800;
        case '1M':
            throw new Error('not implemented')
    }
}