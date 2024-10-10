import { SymbolClass } from 'src/symbols/symbol.class';
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('symbol_futures')
@Unique('udx_exchange_symbol_symbol_futures', ['exchange', 'symbol'])
@Index('idx_quote_symbol_futures', ['quote'])
export class SymbolsFutures extends SymbolClass {

  @PrimaryGeneratedColumn({primaryKeyConstraintName: 'pk_symbol_futures'})
  id: number;
  
  @Column()
  category: string;

  @Column()
  category_order: number;

}
