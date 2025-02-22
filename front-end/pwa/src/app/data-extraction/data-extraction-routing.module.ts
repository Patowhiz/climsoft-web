import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';   
import { ManualExportSelectionComponent } from './manual-export-selection/manual-export-selection.component';
import { AutoExportSelectionComponent } from './auto-export-selection/auto-export-selection.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Data Extraction'
    },
    children: [
      {
        path: '',
        redirectTo: 'manual-export-selection',
        pathMatch: 'full',
      },
      {
        path: 'manual-export-selection',
        component: ManualExportSelectionComponent, 
      }, 
      {
        path: 'auto-export-selection',
        component: AutoExportSelectionComponent, 
      }, 

     
    ]
  }
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataExtractionRoutingModule { }
