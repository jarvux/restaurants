import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CulturaEntity } from '../cultura/cultura.entity';

@Entity()
export class ProductoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  historia: string;

  @Column()
  tipoProducto: string;

  @ManyToOne(() => CulturaEntity, (cultura) => cultura.recetas)
  cultura: CulturaEntity;
}
