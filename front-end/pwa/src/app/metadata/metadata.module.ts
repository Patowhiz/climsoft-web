import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MetadataRoutingModule } from './metadata-routing.module';

import { FormsComponent } from './forms/forms.component'; 
import { FormDetailComponent } from './form-detail/form-detail.component';
import { StationsComponent } from './stations/stations.component';
import { StationDetailComponent } from './station-detail/station-detail.component';
import { FormSelectorDialogComponent } from './controls/form-selector-dialog/form-selector-dialog.component';
import { ElementsSelectorDialogComponent } from './controls/elements-selector-dialog/elements-selector-dialog.component';
import { StationElementLimitsInputDialogComponent } from './controls/station-element-limits-input-dialog/station-element-limits-input-dialog.component';
import { ElementDetailComponent } from './element-detail/element-detail.component';
import { ElementsComponent } from './elements/elements.component';
import { StationCharacteristicsComponent } from './station-characteristics/station-characteristics.component';
import { StationFormsComponent } from './station-detail/station-forms/station-forms.component';
import { StationLimitsComponent } from './station-detail/station-limits/station-limits.component';


 


@NgModule({
  declarations: [
    ElementsSelectorDialogComponent,
    FormSelectorDialogComponent,
    StationElementLimitsInputDialogComponent,

    FormsComponent,
    FormDetailComponent,
    StationsComponent,
    StationDetailComponent,
  
    ElementDetailComponent,
    ElementsComponent,
    StationCharacteristicsComponent,
    StationFormsComponent,
    StationLimitsComponent, 
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
