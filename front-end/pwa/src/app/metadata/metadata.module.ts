import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MetadataRoutingModule } from './metadata-routing.module';

import { FormSourceDetailComponent } from './sources-components/form-source-detail/form-source-detail.component';
import { StationsComponent } from './stations-components/stations/stations.component';
import { FormSelectorDialogComponent } from './controls/form-selector-dialog/form-selector-dialog.component';
import { ElementsSelectorDialogComponent } from './controls/elements-selector-dialog/elements-selector-dialog.component';
import { StationElementLimitsInputDialogComponent } from './controls/station-element-limits-input-dialog/station-element-limits-input-dialog.component';
import { ElementDetailComponent } from './element-detail/element-detail.component';
import { ViewElementsComponent } from './elements/view-elements/view-elements.component';
import { SourcesComponent } from './sources-components/sources/sources.component';
import { ImportStationDialogComponent } from './stations-components/station-edits-components/import-station-dialog/import-station-dialog.component';
import { StationDetailComponent } from './stations-components/station-detail/station-detail.component';
import { StationCharacteristicsComponent } from './stations-components/station-detail/station-characteristics/station-characteristics.component';
import { StationFormsComponent } from './stations-components/station-detail/station-forms/station-forms.component';
import { StationLimitsComponent } from './stations-components/station-detail/station-limits/station-limits.component';
import { StationCharacteristicsEditDialogComponent } from './stations-components/station-edits-components/station-characteristics-edit-dialog/station-characteristics-edit-dialog.component';
import { ImportSourceDetailComponent } from './sources-components/import-source-detail/import-source-detail.component';
import { ImportStationComponent } from './stations-components/station-edits-components/import-station/import-station.component'; 
import { ImportSourceStationDetailComponent } from './sources-components/import-source-detail/import-source-station-detail/import-source-station-detail.component';
import { ImportSourceElementAndValueDetailComponent } from './sources-components/import-source-detail/import-source-element-and-value-detail/import-source-element-and-value-detail.component';
import { ImportSourcePeriodDetailComponent } from './sources-components/import-source-detail/import-source-period-detail/import-source-period-detail.component';
import { ImportSourceDateDetailComponent } from './sources-components/import-source-detail/import-source-date-detail/import-source-date-detail.component'; 
import { ImportSourceDelimeterDetailComponent } from './sources-components/import-source-detail/import-source-delimeter-detail/import-source-delimeter-detail.component';
import { ImportSourceElevationDetailComponent } from './sources-components/import-source-detail/import-source-elevation-detail/import-source-elevation-detail.component';
import { ImportSourceMissingFlagDetailComponent } from './sources-components/import-source-detail/import-source-missing-flag-detail/import-source-missing-flag-detail.component';
import { ImportSourceFlagDetailComponent } from './sources-components/import-source-detail/import-source-flag-detail/import-source-flag-detail.component';
import { QCTestsComponent } from './element-detail/qc-tests/qc-tests.component';
import { QCTestInputDialogComponent } from './element-detail/qc-test-input-dialog/qc-test-input-dialog.component';
import { QCTestTypeInputComponent } from './element-detail/qc-test-input-dialog/qc-test-type-input/qc-test-type-input.component';
import { QCTestRangeThresholdParamsComponent } from './element-detail/qc-test-input-dialog/qc-test-range-threshold-params/qc-test-range-threshold-params.component';
import { ElementCharacteristicsInputDialogComponent } from './elements/element-characteristics-input-dialog/element-characteristics-input-dialog.component';
import { ElementCharacteristicsComponent } from './element-detail/element-characteristics/element-characteristics.component';


@NgModule({
  declarations: [
    ElementsSelectorDialogComponent,
    FormSelectorDialogComponent,
    StationElementLimitsInputDialogComponent,

    SourcesComponent,
    FormSourceDetailComponent,
    ImportSourceDetailComponent,

    StationsComponent,
    StationDetailComponent,
    StationCharacteristicsEditDialogComponent,
    ImportStationDialogComponent,
  
    ElementDetailComponent,
    ViewElementsComponent,
    StationCharacteristicsComponent,
    StationFormsComponent,
    StationLimitsComponent,
    ImportStationComponent, 
    ImportSourceStationDetailComponent,
    ImportSourceElementAndValueDetailComponent,
    ImportSourcePeriodDetailComponent,
    ImportSourceDateDetailComponent,
    ImportSourceDelimeterDetailComponent,
    ImportSourceElevationDetailComponent,
    ImportSourceMissingFlagDetailComponent,
    ImportSourceFlagDetailComponent,
    QCTestsComponent,
    QCTestInputDialogComponent,
    QCTestTypeInputComponent,
    QCTestRangeThresholdParamsComponent,
    ElementCharacteristicsInputDialogComponent,
    ElementCharacteristicsComponent 
  ],
  imports: [
    SharedModule,
    MetadataRoutingModule
  ],
  exports: [
    ElementsSelectorDialogComponent,
    FormSelectorDialogComponent,
  ]
})
export class MetadataModule { }
