import { SymbolClass } from "src/symbols/symbol.class";

export const filterBySymbolStart = (symbolFilter: any, symbols: SymbolClass[]) => {
  let reduced = []
  if (symbolFilter) {
    let prev = undefined
    for (let symbol of symbols) {
      if (prev) {
        if (symbol.symbol.localeCompare(symbolFilter) >= 0) {
          reduced.push(symbol)
        }
      }
      prev = symbol
    }
  }
  return reduced
}

export const filterBySymbol = (symbolFilter: any, symbols: {symbol: string}[]) => {
  if (symbolFilter) {
    return symbols.filter(symbol => symbol.symbol == symbolFilter)
  }
}