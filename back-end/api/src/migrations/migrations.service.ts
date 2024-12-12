import { Injectable, Logger } from '@nestjs/common';
import { UserRoleEnum } from 'src/user/enums/user-roles.enum';
import { UsersService } from 'src/user/services/users.service';
import { DatabaseVersionEntity } from './entities/database-version.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ObservationTriggers1721359627445 } from './1721359627445-ObservationTriggers';
import { ElementSubdomainsService } from 'src/metadata/elements/services/element-subdomains.service';
import { ElementTypesService } from 'src/metadata/elements/services/element-types.service';
import { StationObsEnvService } from 'src/metadata/stations/services/station-obs-env.service';
import { StationObsFocusesService } from 'src/metadata/stations/services/station-obs-focuses.service';
import { MetadataDefaults } from './metadata-defaults';
import { GeneralSettingsService } from 'src/settings/services/general-settings.service';
import { GeneralSettingsDefaults } from './general-settings-defaults';

@Injectable()
export class MigrationsService {

  private readonly SUPPORTED_DB_VERSION: string = "0.0.1"; // TODO. Should come from a versioning file. Should this start at version 5.0.0 ??
  private readonly logger = new Logger(MigrationsService.name);

  constructor(
    @InjectRepository(DatabaseVersionEntity) private dbVersionRepo: Repository<DatabaseVersionEntity>,
    private dataSource: DataSource,
    private userService: UsersService,
    private elementSubdomainsService: ElementSubdomainsService,
    private elementTypesService: ElementTypesService,
    private stationObsEnvService: StationObsEnvService,
    private stationObsFocusesService: StationObsFocusesService,
    private generalSettingsService: GeneralSettingsService) { }

  public async doMigrations() {
    // Get last db version
    const [lastDBVersion] = await this.dbVersionRepo.find({
      order: { id: 'DESC' },
      take: 1, // Limit to one record
    });

    if (lastDBVersion) {
      if (lastDBVersion.version === this.SUPPORTED_DB_VERSION) {
        // DB version same so return.
        return;
      } else if (!this.isVersionGreater(this.SUPPORTED_DB_VERSION, lastDBVersion.version)) {
        const errorMessage = `Database version ${lastDBVersion.version} is greater than the supported version ${this.SUPPORTED_DB_VERSION}.`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

    }

    // Depending on the version the seeding will be different
    this.seedDatabase();

    // After successful migrations, then add the new database version
    const newDBVersion = this.dbVersionRepo.create({
      version: this.SUPPORTED_DB_VERSION
    });
    await this.dbVersionRepo.save(newDBVersion);

  }

  private isVersionGreater(currentVersion: string, lastVersion: string): boolean {
    const currentParts = currentVersion.split('.').map(Number);
    const lastParts = lastVersion.split('.').map(Number);

    for (let i = 0; i < currentParts.length; i++) {
      if (currentParts[i] > lastParts[i]) {
        return true;
      } else if (currentParts[i] < lastParts[i]) {
        return false;
      }
    }

    return false;  // If all parts are equal
  }

  private async seedDatabase() {
    await this.seedTriggers();
    await this.seedFirstUser();
    await this.seedMetadata();

    // Default general settings
    await this.generalSettingsService.bulkPut(GeneralSettingsDefaults.GENERAL_SETTINGS, 1);
  }

  private async seedTriggers() {
    //const fullFolderPath = this.fileIOService.getFullFolderPath('sql-scripts');
    //console.log('file path: ', fullFolderPath);
    //join(__dirname, '../sql/triggers/update_observations_log_column.sql');
    // const sql = await this.fileIOService.readFile(`${fullFolderPath}/observation_log.sql`, 'utf8');
    //console.log('sql: ', sql);

    // TODO. should come from sql files
    await this.dataSource.query(ObservationTriggers1721359627445.OBS_LOG_TRIGGER);
  }

  private async seedFirstUser() {
    const count = await this.userService.count();
    if (count === 0) {
      const newUser = await this.userService.createUser(
        {
          name: "admin",
          email: "admin@climsoft.org",
          phone: '',
          role: UserRoleEnum.ADMINISTRATOR,
          authorisedStationIds: null,
          canDownloadData: true,
          authorisedElementIds: null,
          extraMetadata: null,
          disabled: false
        }
      );

      await this.userService.changeUserPassword({ userId: newUser.id, password: "climsoft@admin!2" })
    }
  }

  public async seedMetadata() {
    // Elements metadata
    await this.elementSubdomainsService.bulkPut(MetadataDefaults.ELEMENT_SUBDOMAINS, 1);
    await this.elementTypesService.bulkPut(MetadataDefaults.ELEMENT_TYPES, 1);

    // Stations metadata 
    await this.stationObsEnvService.bulkPut(MetadataDefaults.STATION_ENVIRONMENTS, 1);
    await this.stationObsFocusesService.bulkPut(MetadataDefaults.STATION_FOCUS, 1);
  }



}
