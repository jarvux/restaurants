import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturaEntity } from '../cultura/cultura.entity';
import { ProductoEntity } from '../producto/producto.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class CulturaProductoService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,

    @InjectRepository(CulturaEntity)
    private readonly culturaRepository: Repository<CulturaEntity>,
  ) {}

  async getProductoById(productoId: string) {
    const producto: ProductoEntity = await this.productoRepository.findOne({
      where: { id: productoId },
    });
    if (!producto)
      throw new BusinessLogicException(
        'Producto no encontrado',
        BusinessError.NOT_FOUND,
      );
    return producto;
  }

  async getProductosByCulturaId(culturaId: string): Promise<ProductoEntity[]> {
    const cultura = await this.getCulturaById(culturaId);
    return cultura.productos;
  }

  async getCulturaById(culturaId: string): Promise<CulturaEntity> {
    const cultura: CulturaEntity = await this.culturaRepository.findOne({
      where: { id: culturaId },
      relations: ['productos'],
    });
    if (!cultura)
      throw new BusinessLogicException(
        'cultura no encontrada',
        BusinessError.NOT_FOUND,
      );
    return cultura;
  }

  async getProductByCulturaIdAndProductId(
    productId: string,
    culturaId: string,
  ): Promise<ProductoEntity> {
    const dbProduct = await this.getProductoById(productId);
    const culture = await this.getCulturaById(culturaId);
    const productFromCulture: ProductoEntity = culture.productos.find(
      (producto: ProductoEntity) => producto.id === dbProduct.id,
    );

    if (!productFromCulture)
      throw new BusinessLogicException(
        'Producto no encontrado en la cultura',
        BusinessError.PRECONDITION_FAILED,
      );

    return productFromCulture;
  }

  async addProductoToCultura(
    culturaId: string,
    productId: string,
  ): Promise<CulturaEntity> {
    const dbProduct = await this.getProductoById(productId);
    const cultura = await this.getCulturaById(culturaId);

    const producto: ProductoEntity = cultura.productos.find((p) => {
      return p.id === productId;
    });

    if (producto) {
      throw new BusinessLogicException(
        'El producto existe en la cultura',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    cultura.productos = [...cultura.productos, dbProduct];
    return await this.culturaRepository.save(cultura);
  }

  async addProductosToCultura(cultureId: string, productos: ProductoEntity[]) {
    const culture = await this.getCulturaById(cultureId);

    for (let value of productos) {
      await this.getProductoById(value.id);
    }
    culture.productos = productos;
    return await this.culturaRepository.save(culture);
  }

  async deleteProductoFromCultura(culturaId: string, productId: string) {
    const dbProduct = await this.getProductoById(productId);
    const culture = await this.getCulturaById(culturaId);

    const product: ProductoEntity = culture.productos.find(
      (pr: ProductoEntity) => pr.id === dbProduct.id,
    );
    if (!product)
      throw new BusinessLogicException(
        'El producto no existe en la cultura',
        BusinessError.PRECONDITION_FAILED,
      );

    culture.productos = culture.productos.filter((pr) => pr.id !== productId);
    await this.culturaRepository.save(culture);
  }
}
