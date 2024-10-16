import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';  
import { ViewStationsComponent } from './stations-components/view-stations/view-stations.component';
import { ViewElementsComponent } from './elements/view-elements/view-elements.component';
import { ElementDetailComponent } from './element-detail/element-detail.component';
import { FormSourceDetailComponent } from './sources-components/form-source-detail/form-source-detail.component';
import { SourcesComponent } from './sources-components/sources/sources.component';
import { StationDetailComponent } from './stations-components/station-detail/station-detail.component';
import { ImportSourceDetailComponent } from './sources-components/import-source-detail/import-source-detail.component';
import { ImportStationComponent } from './stations-components/station-edits-components/import-station/import-station.component';
import { ViewRegionsComponent } from './regions/view-regions/view-regions.component';
import { ImportRegionsComponent } from './regions/import-regions/import-regions.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Metadata'
    },
    children: [
      {
        path: '',
        redirectTo: 'elements',
        pathMatch: 'full',
      },
      {
        path: 'elements',
        component: ViewElementsComponent, 
      },
      {
        path: 'element-detail/:id',
        component: ElementDetailComponent
      },
      {
        path: 'sources',
        component: SourcesComponent, 
      }, 
      {
        path: 'form-source-detail/:id',
        component: FormSourceDetailComponent
      },
      {
        path: 'import-source-detail/:id',
        component: ImportSourceDetailComponent
      },
      {
        path: 'stations',
        component: ViewStationsComponent, 
      },
      {
        path: 'station-detail/:id',
        component: StationDetailComponent
      },
      {
        path: 'import-station',
        component: ImportStationComponent
      },
      {
        path: 'view-regions',
        component: ViewRegionsComponent
      },
      {
        path: 'import-regions',
        component: ImportRegionsComponent
      }  
     
    ]
  }
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MetadataRoutingModule { }
