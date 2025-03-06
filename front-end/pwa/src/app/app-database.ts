import Dexie, { Table } from "dexie";
import { CreateStationModel } from "./core/models/stations/create-station.model";
import { ViewRegionModel } from "./core/models/Regions/view-region.model";
import { ViewSourceModel } from "./metadata/sources/models/view-source.model";
import { ViewStationObsEnvModel } from "./core/models/stations/view-station-obs-env.model";
import { ViewStationObsFocusModel } from "./core/models/stations/view-station-obs-focus.model";
import { StationSearchHistoryModel } from "./metadata/stations/models/stations-search-history.model";
import { CreateViewElementModel } from "./metadata/elements/models/create-view-element.model";
import { ViewElementTypeModel } from "./metadata/elements/models/view-element-type.model";
import { ViewElementSubdomainModel } from "./metadata/elements/models/view-element-subdomain.model";
import { ElementSearchHistoryModel } from "./metadata/elements/models/elements-search-history.model";
import { ViewElementQCTestModel } from "./core/models/elements/qc-tests/view-element-qc-test.model";   
import { CachedObservationModel } from "./data-acquisition/services/observations.service";
import { UserSettingEnum } from "./app-config.service";

export interface MetadataModificationLogModel {
    metadataName: keyof AppDatabase; // Except metadataModificationLog
    lastModifiedDate: string;
}

export interface StationForm {
    stationId: string;
    forms: ViewSourceModel[];
}

export interface UserSetting {
    name: UserSettingEnum; 
    parameters: any;
}

export interface AppComponentState {
    id: string; // should be an enumeration
    parameters: any;
}

export class AppDatabase extends Dexie {
    //--------------------------------------
    // Back end related tables

    // Metadata tables
    // Cached through metadata updates
    metadataModificationLog!: Table<MetadataModificationLogModel, string>;
    stationObsEnv!: Table<ViewStationObsEnvModel, number>;
    stationObsFocus!: Table<ViewStationObsFocusModel, number>;
    stations!: Table<CreateStationModel, string>;
    elementSubdomains!: Table<ViewElementSubdomainModel, number>;
    elementTypes!: Table<ViewElementTypeModel, number>;
    elements!: Table<CreateViewElementModel, number>;
    sourceTemplates!: Table<ViewSourceModel, number>;
    regions!: Table<ViewRegionModel, number>;

    // cached differently
    stationForms!: Table<StationForm, string>;
    elementsQcTests!: Table<ViewElementQCTestModel, number>;
    // stationId, elementId, sourceId, level, datetime, period  as compund key
    observations!: Table<CachedObservationModel, [string, number, number, number, string, number]>;

    //--------------------------------------

    //--------------------------------------
    // Front end related tables
    userSettings!: Table<UserSetting, string>;
    stationsSearchHistory!: Table<StationSearchHistoryModel, string>;
    elementsSearchHistory!: Table<ElementSearchHistoryModel, string>;
    //--------------------------------------

    constructor() {
        super('climsoft_db'); // Database name
        this.version(1).stores({
            metadataModificationLog: 'metadataName',
            stations: `id, name, stationObsProcessingMethod, stationObsEnvironmentId, stationObsFocusId, wmoId, wigosId, icaoId, status, dateEstablished, dateClosed`,
            stationObsEnv: `id, name`,
            stationObsFocus: `id, name`,
            elementSubdomains: `id, name`,
            elementTypes: `id, name, subdomainId`,
            elements: `id, name, abbreviation, typeId`,
            sourceTemplates: `id, name, sourceType`,
            regions: `id, name, regionType`,

            stationForms: `stationId`,
            elementsQcTests: `id, elementId, qcTestType, observationPeriod, [elementId+qcTestType+observationPeriod]`,
            
            // Note. Compoud key [stationId+elementId+sourceId+level+datetime+period] is used for putting and deleting data in the local database. 
            // Note. Compound index [stationId+sourceId+level+elementId+datetime] is used by entry forms.
            observations: `[stationId+elementId+sourceId+level+datetime+period], stationId, elementId, sourceId, level, datetime, period, synced, entryDatetime, [stationId+sourceId+level+elementId+datetime]`,
           
            userSettings: `name`,
            stationsSearchHistory: `name`,
            elementsSearchHistory: `name`,
        });
    }

    private static _instance: AppDatabase | null = null;

    public static get instance(): AppDatabase {
        // Create a singleton instance
        if (!AppDatabase._instance) {
            AppDatabase._instance = new AppDatabase();
        }
        return AppDatabase._instance;
    }

    public static async bulkPut(tableName: keyof AppDatabase, records: any[]): Promise<any> {
        return (AppDatabase.instance[tableName] as Table).bulkPut(records);
    }

    public static async clear(tableName: keyof AppDatabase): Promise<void> {
        return (AppDatabase.instance[tableName] as Table).clear();
    }

    public static async count(tableName: keyof AppDatabase): Promise<number> {
        return (AppDatabase.instance[tableName] as Table).count();
    }

}

