import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SymbolClass } from '../../symbol.class';

export enum ContractEnum {
  PERPETUAL = 'PERPETUAL',
  CURRENT_MONTH = 'CURRENT_MONTH',
  NEXT_MONTH = 'NEXT_MONTH',
  CURRENT_QUARTER = 'CURRENT_QUARTER',
  NEXT_QUARTER = 'NEXT_QUARTER',
  PERPETUAL_DELIVERING = 'PERPETUAL_DELIVERING',
  EMPTY = '',
}

@Entity('symbol_futures_usdm')
@Unique('udx_symbol_exchange_symbol_futures_usdm', ['symbol', 'exchange'])
@Index('idx_quote_symbol_futures_usdm', ['quote'])
export class SymbolsUsdmFutures extends SymbolClass {

  @PrimaryGeneratedColumn({primaryKeyConstraintName: 'pk_symbol_futures_usdm'})
  id: number;

  @Column({ type: 'enum', enum: ContractEnum })
  contractType: ContractEnum | string;

  @Column()
  pair: string;
}
