import { Module } from '@nestjs/common';
import { ObservationsController } from './controllers/observations.controller';
import { ObservationsService } from './services/observations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationEntity } from './entities/observation.entity';  
import { ObservationUploadService } from './services/observation-upload.service';
import { MetadataModule } from 'src/metadata/metadata.module'; 
import { UserModule } from 'src/user/user.module';
import { SourceCheckController } from './controllers/source-check.controller';
import { SourceCheckService } from './services/source-check.service';

@Module({
  imports: [TypeOrmModule.forFeature([ObservationEntity]),  UserModule, MetadataModule],
  controllers: [ObservationsController, SourceCheckController],
  providers: [ObservationsService,  ObservationUploadService, SourceCheckService]
})
export class ObservationModule {}
