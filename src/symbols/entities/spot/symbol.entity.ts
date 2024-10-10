import { Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SymbolClass } from '../../symbol.class';

@Entity('symbols')
@Unique('udx_symbol_exchange_symbols', ['symbol', 'exchange'])
@Index('idx_quote_symbols', ['quote'])
export class Symbols extends SymbolClass {

    @PrimaryGeneratedColumn({primaryKeyConstraintName: 'pk_symbols'})
    id: number;
  
}
