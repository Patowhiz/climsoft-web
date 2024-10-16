import { Component } from '@angular/core';
import { CreateStationModel } from '../../core/models/stations/create-station.model';
import { ActivatedRoute, Router } from '@angular/router';
import { StationsService } from 'src/app/core/services/stations/stations.service';
import { PagesDataService } from 'src/app/core/services/pages-data.service';
import { StationFormsService } from 'src/app/core/services/stations/station-forms.service';
import { ViewSourceModel } from 'src/app/core/models/sources/view-source.model';
import { StationObsProcessingMethodEnum } from 'src/app/core/models/stations/station-obs-Processing-method.enum';
import { Observable, filter, from, map, pipe, take } from 'rxjs';

export interface StationView extends CreateStationModel {
  forms?: ViewSourceModel[];
}

@Component({
  selector: 'app-station-form-selection',
  templateUrl: './station-form-selection.component.html',
  styleUrls: ['./station-form-selection.component.scss']
})
export class StationFormSelectionComponent {

  protected stations!: StationView[];

  constructor(
    private pagesDataService: PagesDataService,
    private stationsService: StationsService,
    private stationFormsService: StationFormsService,
    private router: Router,
    private route: ActivatedRoute) {

    this.pagesDataService.setPageHeader('Select Station');

    this.stationsService.find(
      {
        obsProcessingMethods: [
          StationObsProcessingMethodEnum.MANUAL,
          StationObsProcessingMethodEnum.HYBRID
        ]
      }
    ).pipe(
      take(1)).subscribe(data => {
        this.stations = data.map(item => ({ ...item }));
      });
  }

  protected onSearchClick(): void {
    // TODO.
  }

  protected loadStationForms(station: StationView): void {
    if (!station.forms) {
      this.stationFormsService.find(station.id).subscribe(data => {
        station.forms = data;
      });
    }

  }

  protected onFormClick(stationId: string, sourceId: number): void {
    this.router.navigate(['form-entry', stationId, sourceId], { relativeTo: this.route.parent });
  }

}
