import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormEntryComponent } from './form-entry/form-entry.component';
import { ImportEntryComponent } from './import-entry/import-entry.component';
import { StationFormSelectionComponent } from './station-form-selection/station-form-selection.component';
import { ViewEntryComponent } from './view-entry/view-entry.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Data Entry'
    },
    children: [
      {
        path: '',
        redirectTo: 'station-selection',
        pathMatch: 'full',
      },   
      {
        path: 'station-form-selection',
        component: StationFormSelectionComponent
      },     
      {
        path: 'form-entry/:stationid/:datasourceid',
        component: FormEntryComponent
      },
      {
        path: 'import-entry',
        component: ImportEntryComponent
      },
      {
        path: 'view-entry',
        component: ViewEntryComponent
      },
    ]
  }
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataEntryRoutingModule { }
