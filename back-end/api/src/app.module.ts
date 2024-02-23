import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { SharedModule } from './shared/shared.module';
import { ObservationModule } from './observation/observation.module';
import { FileController } from './file.controller';
import { MetadataModule } from './metadata/metadata.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SharedModule, UserModule, MetadataModule, ObservationModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // type of our database
      host: process.env.DB_HOST, // database host
      port: process.env.DB_PORT? +process.env.DB_PORT : 5432, // database host
      username: process.env.DB_USERNAME, // username
      password: process.env.DB_PASSWORD, // user password
      database: process.env.DB_NAME, // name of our database,
      autoLoadEntities: true, // models will be loaded automatically
      synchronize: true, // your entities will be synced with the database(recommended: disable in prod)
     // timezone: 'Z', //todo. do more research about it. It affects how dates are saved in the database
    }), 

  ],
  controllers: [AppController, FileController],
  providers: [AppService],
})
export class AppModule { }
