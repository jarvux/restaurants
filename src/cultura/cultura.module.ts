import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CulturaEntity } from './cultura.entity';
import { CulturaService } from './cultura.service';
import { CulturaController } from './cultura.controller';
import { CulturaResolver } from './cultura.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CulturaEntity])],
  providers: [CulturaService, CulturaResolver],
  controllers: [CulturaController],
})
export class CulturaModule {}
