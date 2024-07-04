import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StationsService } from 'src/app/core/services/stations/stations.service';
import { ViewStationModel } from 'src/app/core/models/stations/view-station.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-station-characteristics',
  templateUrl: './station-characteristics.component.html',
  styleUrls: ['./station-characteristics.component.scss']
})
export class StationCharacteristicsComponent implements OnInit {
  @Input() 
  public stationId!: string;

  @Output()
  public valueChange = new EventEmitter<ViewStationModel>();

  protected station!: ViewStationModel;


  constructor(
    private stationsService: StationsService,
  ) {

  }

  ngOnInit() {

    if (this.stationId) {
      this.loadStation();
    }

  }


  protected onStationEdited(): void {
    this.loadStation();
  }

  private loadStation(): void {
    this.stationsService.findOne(this.stationId).pipe(
      take(1)
    ).subscribe((data) => {
      
      this.station = data;

      if (this.station.dateEstablished) {
        this.station.dateEstablished = this.station.dateEstablished.substring(0, 10);
      }

      if (this.station.dateClosed) {
        this.station.dateClosed = this.station.dateClosed.substring(0, 10);
      }

      this.valueChange.emit(this.station);

    });
  }


}
