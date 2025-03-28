import { StationObsProcessingMethodEnum } from "./station-obs-processing-method.enum";

export class ViewStationQueryModel {
    stationIds?: string[];
    obsProcessingMethods?: StationObsProcessingMethodEnum[];
    obsEnvironmentIds?: number[];
    obsFocusIds?: number[];
    page?: number;
    pageSize?: number;
}