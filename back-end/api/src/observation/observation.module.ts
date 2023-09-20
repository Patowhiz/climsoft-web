import { Module } from '@nestjs/common';
import { ObservationsController } from './controllers/observations.controller';
import { ObservationsService } from './services/observations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationEntity } from './entities/observation.entity';
import { FlagEntity } from './entities/flag.entity';
import { FlagsController } from './controllers/flags.controller';
import { FlagsService } from './services/flags.service';

@Module({
  imports: [TypeOrmModule.forFeature([ObservationEntity, FlagEntity])],
  controllers: [ObservationsController, FlagsController],
  providers: [ObservationsService, FlagsService]
})
export class ObservationModule {}
