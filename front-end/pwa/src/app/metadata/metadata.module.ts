import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MetadataRoutingModule } from './metadata-routing.module';

import { FormSelectorDialogComponent } from './controls/form-selector-dialog/form-selector-dialog.component';
import { ElementsSelectorDialogComponent } from './controls/elements-selector-dialog/elements-selector-dialog.component';
import { StationElementLimitsInputDialogComponent } from './controls/station-element-limits-input-dialog/station-element-limits-input-dialog.component';

import { ViewRegionsComponent } from './regions/view-regions/view-regions.component';
import { ImportRegionsComponent } from './regions/import-regions/import-regions.component';
import { ViewRegionsMapComponent } from './regions/view-regions/view-regions-map/view-regions-map.component';
import { ViewRegionsTableComponent } from './regions/view-regions/view-regions-table/view-regions-table.component';
import { ViewStationsTableComponent } from './stations/view-stations/view-stations-table/view-stations-table.component';
import { ViewSourcesComponent } from './sources/view-sources/view-sources.component';
import { FormSourceDetailComponent } from './sources/form-source-detail/form-source-detail.component';
import { ImportSourceDetailComponent } from './sources/import-source-detail/import-source-detail.component';
import { ViewStationsComponent } from './stations/view-stations/view-stations.component';
import { StationDetailComponent } from './stations/station-detail/station-detail.component';
import { StationCharacteristicsEditDialogComponent } from './stations/station-characteristics-edit-dialog/station-characteristics-edit-dialog.component';
import { ImportStationsDialogComponent } from './stations/import-stations-dialog/import-stations-dialog.component';
import { ElementDetailComponent } from './elements/element-detail/element-detail.component';
import { ViewElementsComponent } from './elements/view-elements/view-elements.component';
import { StationCharacteristicsComponent } from './stations/station-detail/station-characteristics/station-characteristics.component';
import { StationFormsComponent } from './stations/station-detail/station-forms/station-forms.component';
import { StationLimitsComponent } from './stations/station-detail/station-limits/station-limits.component';
import { ImportSourceStationDetailComponent } from './sources/import-source-detail/import-source-station-detail/import-source-station-detail.component';
import { ImportSourceElementAndValueDetailComponent } from './sources/import-source-detail/import-source-element-and-value-detail/import-source-element-and-value-detail.component';
import { ImportSourcePeriodDetailComponent } from './sources/import-source-detail/import-source-period-detail/import-source-period-detail.component';
import { ImportSourceDateDetailComponent } from './sources/import-source-detail/import-source-date-detail/import-source-date-detail.component';
import { ImportSourceDelimeterDetailComponent } from './sources/import-source-detail/import-source-delimeter-detail/import-source-delimeter-detail.component';
import { ImportSourceElevationDetailComponent } from './sources/import-source-detail/import-source-elevation-detail/import-source-elevation-detail.component';
import { ImportSourceMissingFlagDetailComponent } from './sources/import-source-detail/import-source-missing-flag-detail/import-source-missing-flag-detail.component';
import { ImportSourceFlagDetailComponent } from './sources/import-source-detail/import-source-flag-detail/import-source-flag-detail.component';
import { ElementCharacteristicsInputDialogComponent } from './elements/element-characteristics-input-dialog/element-characteristics-input-dialog.component';
import { ElementCharacteristicsComponent } from './elements/element-detail/element-characteristics/element-characteristics.component';
import { QCTestsComponent } from './elements/element-detail/qc-tests/qc-tests.component';
import { QCTestInputDialogComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-input-dialog.component';
import { QCTestTypeInputComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-type-input/qc-test-type-input.component';
import { QCTestRangeThresholdParamsComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-range-threshold-params/qc-test-range-threshold-params.component';
import { QCTestRepeatedValueParamsComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-range-repeated-value-params/qc-test-repeated-value-params.component';
import { QCTestFlatLineParamsComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-flat-line-params/qc-test-flat-line-params.component';
import { QCTestSpikeParamsComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-spike-params/qc-test-spike-params.component';
import { QCTestRelationalParamsComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-relational-params/qc-test-relational-params.component';
import { QCTestContextualParamsComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-contextual-params/qc-test-contextual-params.component';
import { QCTestConditionInputComponent } from './elements/element-detail/qc-test-input-dialog/qc-test-condition-input/qc-test-condition-input.component';
import { ViewStationsMapComponent } from './stations/view-stations/view-stations-map/view-stations-map.component';
import { StationsSearchDialogComponent } from './stations/stations-search-dialog/stations-search-dialog.component';

@NgModule({
  declarations: [
    ElementsSelectorDialogComponent,
    FormSelectorDialogComponent,
    StationElementLimitsInputDialogComponent,

    ViewSourcesComponent,
    FormSourceDetailComponent,
    ImportSourceDetailComponent,

    ViewStationsComponent,
    StationDetailComponent,
    StationCharacteristicsEditDialogComponent,
    ImportStationsDialogComponent,

    ElementDetailComponent,
    ViewElementsComponent,
    StationCharacteristicsComponent,
    StationFormsComponent,
    StationLimitsComponent,
    ImportSourceStationDetailComponent,
    ImportSourceElementAndValueDetailComponent,
    ImportSourcePeriodDetailComponent,
    ImportSourceDateDetailComponent,
    ImportSourceDelimeterDetailComponent,
    ImportSourceElevationDetailComponent,
    ImportSourceMissingFlagDetailComponent,
    ImportSourceFlagDetailComponent,
    ElementCharacteristicsInputDialogComponent,
    ElementCharacteristicsComponent,
    QCTestsComponent,
    QCTestInputDialogComponent,
    QCTestTypeInputComponent,
    QCTestRangeThresholdParamsComponent,
    QCTestRepeatedValueParamsComponent,
    QCTestFlatLineParamsComponent,
    QCTestSpikeParamsComponent,
    QCTestRelationalParamsComponent,
    QCTestContextualParamsComponent,
    QCTestConditionInputComponent,
    ImportRegionsComponent,
    ViewRegionsComponent,
    ViewRegionsTableComponent,
    ViewRegionsMapComponent,
    ViewStationsTableComponent,
    ViewStationsMapComponent,
    StationsSearchDialogComponent,
  ],
  imports: [
    SharedModule,
    MetadataRoutingModule
  ],
  exports: [
    ElementsSelectorDialogComponent,
    FormSelectorDialogComponent,
    StationsSearchDialogComponent,
  ]
})
export class MetadataModule { }
