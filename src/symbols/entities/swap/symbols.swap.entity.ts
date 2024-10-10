import { SymbolClass } from 'src/symbols/symbol.class';
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('symbols_swap')
@Unique('udx_exchange_symbol_symbols_swap', ['exchange', 'symbol'])
@Index('idx_quote_symbols_swap', ['quote'])
export class SymbolsSwap extends SymbolClass {
    @PrimaryGeneratedColumn({primaryKeyConstraintName: 'pk_symbols_swap'})
    id: number;
    
    @Column()
    category: string;

    @Column()
    category_order: number;
}
