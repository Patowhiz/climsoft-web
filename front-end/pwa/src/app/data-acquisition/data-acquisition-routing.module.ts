import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormEntryComponent } from './form-entry/form-entry.component';
import { ImportEntryComponent } from './import-entry/import-entry.component';
import { StationFormSelectionComponent } from './station-form-selection/station-form-selection.component';
import { ImportSelectionComponent } from './import-selection/import-selection.component';
import { AutoImportSelectionComponent } from './auto-import-selection/auto-import-selection.component';
import { DeletedDataComponent } from './deleted-data/deleted-data.component';
import { ManageQCComponent } from './manage-qc-data/manage-qc.component';
import { EditDataComponent } from './data-correction/edit-data.component';
import { MissingDataComponent } from './manage-qc-data/missing-data/missing-data.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Data Entry'
    },
    children: [
      {
        path: '',
        redirectTo: 'station-form-selection',
        pathMatch: 'full',
      },
      {
        path: 'station-form-selection',
        component: StationFormSelectionComponent
      },
      {
        path: 'form-entry/:stationid/:sourceid',
        component: FormEntryComponent
      },
      {
        path: 'manual-import-selection',
        component: ImportSelectionComponent
      },
      {
        path: 'import-entry/:id',
        component: ImportEntryComponent
      },
      {
        path: 'auto-import-selection',
        component: AutoImportSelectionComponent
      },
      {
        path: 'auto-import-selection',
        component: AutoImportSelectionComponent
      },
      {
        path: 'data-correction',
        component: EditDataComponent
      },
      {
        path: 'deleted-data',
        component: DeletedDataComponent
      },
      {
        path: 'missing-data',
        component: MissingDataComponent
      },
      {
        path: 'quality-control',
        component: ManageQCComponent
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataAcquisitionRoutingModule { }
