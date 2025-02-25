
import { NgModule } from '@angular/core';
import { ImportEntryComponent } from './import-entry/import-entry.component';
import { StationFormSelectionComponent } from './station-form-selection/station-form-selection.component';
import { FormEntryComponent } from './form-entry/form-entry.component';
import { UserFormSettingsComponent } from './form-entry/user-form-settings/user-form-settings.component';
import { GridLayoutComponent } from './form-entry/grid-layout/grid-layout.component';
import { LnearLayoutComponent } from './form-entry/linear-layout/linear-layout.component';
import { ValueFlagInputComponent } from './form-entry/value-flag-input/value-flag-input.component';
import { AssignSameInputComponent } from './form-entry/assign-same-input/assign-same-input.component';
import { ImportSelectionComponent } from './import-selection/import-selection.component';
import { EditDataComponent } from './data-correction/edit-data.component';
import { QCDataComponent } from './manage-qc-data/qc-data/qc-data.component';
import { EditQCDataComponent } from './manage-qc-data/edit-qc-data/edit-qc-data.component';
import { SourceCheckComponent } from './manage-qc-data/source-check/source-check.component';
import { MissingDataComponent } from './manage-qc-data/missing-data/missing-data.component';
import { DeletedDataComponent } from './deleted-data/deleted-data.component';
import { AutoImportSelectionComponent } from './auto-import-selection/auto-import-selection.component';
import { ManageQCComponent } from './manage-qc-data/manage-qc.component';
import { DataAcquisitionRoutingModule } from './data-acquisition-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MetadataModule } from '../metadata/metadata.module';


@NgModule({

  declarations: [
    ImportEntryComponent,
    StationFormSelectionComponent,
    FormEntryComponent,
    UserFormSettingsComponent,
    GridLayoutComponent,
    LnearLayoutComponent,
    ValueFlagInputComponent,
    AssignSameInputComponent, 
    ImportSelectionComponent,
    EditDataComponent,
    QCDataComponent,
    EditQCDataComponent,
    SourceCheckComponent,
    MissingDataComponent,
    DeletedDataComponent,
    AutoImportSelectionComponent, 
    ManageQCComponent,
  ],
  imports: [
    DataAcquisitionRoutingModule,
    SharedModule,
    MetadataModule, 
  ]
})
export class DataAcquisitionModule { }
