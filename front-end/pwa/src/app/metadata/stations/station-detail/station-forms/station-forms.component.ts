import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PagesDataService, ToastEventTypeEnum } from 'src/app/core/services/pages-data.service';
import { StationFormsService } from 'src/app/metadata/stations/services/station-forms.service';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, tap, catchError, finalize, takeUntil, take } from 'rxjs/operators';
import { ViewSourceModel } from 'src/app/metadata/sources/models/view-source.model';
import { StationCacheModel } from '../../services/stations-cache.service';

@Component({
  selector: 'app-station-forms',
  templateUrl: './station-forms.component.html',
  styleUrls: ['./station-forms.component.scss']
})
export class StationFormsComponent implements OnChanges {

  @Input()
  public station!: StationCacheModel;

  protected forms!: ViewSourceModel[];

  private destroy$ = new Subject<void>();

  public constructor(
    private stationFormsService: StationFormsService,
    private pagesDataService: PagesDataService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.station) {
      this.loadForms();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected loadForms(): void {
    this.stationFormsService.getFormsAssignedToStations(this.station.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.forms = data;
    });
  }

  protected get formIds(): number[] {
    return this.forms.map(form => form.id) ?? [];
  }

  protected onFormsEdited(formIds: number[]): void {
    if(formIds.length>0){
      this.stationFormsService.putFormsAssignedToStations(this.station.id, formIds).pipe(
        take(1)).subscribe(data => {
          this.loadForms();
          this.pagesDataService.showToast({ title: "Station Forms", message: `Forms allocated: ${data.length}`, type: ToastEventTypeEnum.SUCCESS });
        });
    }else{
      // this.stationFormsService.dele(this.station.id).pipe(
      //   take(1)).subscribe(data => {
      //     this.loadForms();
      //     this.pagesDataService.showToast({ title: "Station Forms", message: "Forms Allocation Deleted" , type: ToastEventTypeEnum.SUCCESS });
      //   });
    }
   
  }



}
