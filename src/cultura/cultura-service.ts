import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { CulturaEntity } from './cultura.entity';

@Injectable()
export class CulturaService {
  constructor(
    @InjectRepository(CulturaEntity)
    private readonly culturaRepository: Repository<CulturaEntity>,
  ) {}

  async create(cultura: CulturaEntity): Promise<CulturaEntity> {
    return await this.culturaRepository.save(cultura);
  }

  async findAll(): Promise<CulturaEntity[]> {
    return await this.culturaRepository.find({
      relations: ['recetas', 'productos', 'restaurantes', 'paises'],
    });
  }

  async findOne(id: string): Promise<CulturaEntity> {
    const cultura: CulturaEntity = await this.culturaRepository.findOne({
      where: { id },
      relations: ['recetas', 'productos', 'restaurantes', 'paises'],
    });
    if (cultura)
      throw new BusinessLogicException(
        'La cultura con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    return cultura;
  }

  async update(id: string, cultura: CulturaEntity): Promise<CulturaEntity> {
    const persistedCultura: CulturaEntity =
      await this.culturaRepository.findOne({
        where: { id },
        relations: ['recetas', 'productos', 'restaurantes', 'paises'],
      });
    if (!persistedCultura)
      throw new BusinessLogicException(
        'La cultura con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    return await this.culturaRepository.save({
      ...persistedCultura,
      ...cultura,
    });
  }

  async delete(id: string) {
    const cultura: CulturaEntity = await this.culturaRepository.findOne({
      where: { id },
    });
    if (!cultura)
      throw new BusinessLogicException(
        'La cultura con el id dado no fue encontrada',
        BusinessError.NOT_FOUND,
      );

    await this.culturaRepository.remove(cultura);
  }
}
