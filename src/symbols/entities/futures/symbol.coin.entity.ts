import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SymbolClass } from '../../symbol.class';

export enum ContractEnumCoinm {
  PERPETUAL = 'PERPETUAL',
  CURRENT_QUARTER = 'CURRENT_QUARTER',
  NEXT_QUARTER = 'NEXT_QUARTER',
  CURRENT_QUARTER_DELIVERING = 'CURRENT_QUARTER_DELIVERING',
  NEXT_QUARTER_DELIVERING = 'NEXT_QUARTER_DELIVERING',
  PERPETUAL_DELIVERING = 'PERPETUAL_DELIVERING',
  EMPTY = '',
}

@Entity('symbol_futures_coinm')
@Unique('udx_symbol_exchange_symbol_futures_coinm', ['symbol', 'exchange'])
@Index('idx_quote_symbol_futures_coinm', ['quote'])
export class SymbolsCoinmFutures extends SymbolClass {

  @PrimaryGeneratedColumn({primaryKeyConstraintName: 'pk_symbol_futures_coinm'})
  id: number;

  @Column({ type: 'enum', enum: ContractEnumCoinm })
  contractType: ContractEnumCoinm | string;

  @Column()
  pair: string;
}
