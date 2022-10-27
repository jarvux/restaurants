import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from './producto.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductoService {
  cacheKey = 'products';

  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(producto: ProductoEntity): Promise<ProductoEntity> {
    return await this.productoRepository.save(producto);
  }

  async findAll(): Promise<ProductoEntity[]> {
    const cached: ProductoEntity[] = await this.cacheManager.get<
      ProductoEntity[]
    >(this.cacheKey);
    if (!cached) {
      const products: ProductoEntity[] = await this.productoRepository.find({
        relations: ['cultura'],
      });
      await this.cacheManager.set(this.cacheKey, products);
      return products;
    }
    return cached;
  }

  async findOne(id: string): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.productoRepository.findOne({
      where: { id },
    });
    if (!producto)
      throw new BusinessLogicException(
        'Producto no encontrado',
        BusinessError.NOT_FOUND,
      );

    return producto;
  }

  async update(id: string, producto: ProductoEntity): Promise<ProductoEntity> {
    const persistedProducto: ProductoEntity =
      await this.productoRepository.findOne({
        where: { id },
      });
    if (!persistedProducto)
      throw new BusinessLogicException(
        'Producto no encontrado',
        BusinessError.NOT_FOUND,
      );

    return await this.productoRepository.save({
      ...persistedProducto,
      ...producto,
    });
  }

  async delete(id: string) {
    const producto: ProductoEntity = await this.productoRepository.findOne({
      where: { id },
    });
    if (!producto)
      throw new BusinessLogicException(
        'Producto no encontrado',
        BusinessError.NOT_FOUND,
      );

    await this.productoRepository.remove(producto);
  }
}
