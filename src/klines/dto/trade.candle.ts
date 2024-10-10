import Decimal from "decimal.js";

export interface TradeCandle {
  symbol: string,
  price: Decimal,
  volume: Decimal,
  tradeId: number
  time: number
}
