import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { ViewObservationQueryModel } from 'src/app/data-ingestion/models/view-observation-query.model';
import { Subject, takeUntil } from 'rxjs';
import { AppAuthService } from 'src/app/app-auth.service';
import { UserPermissionModel } from 'src/app/admin/users/models/user-permission.model';
import { DateRange } from 'src/app/shared/controls/date-range-input/date-range-input.component';
import { PagesDataService, ToastEventTypeEnum } from 'src/app/core/services/pages-data.service';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { GeneralSettingsService } from 'src/app/admin/general-settings/services/general-settings.service';
import { SettingIdEnum } from 'src/app/admin/general-settings/models/setting-id.enum';
import { ClimsoftDisplayTimeZoneModel } from 'src/app/admin/general-settings/models/settings/climsoft-display-timezone.model';

@Component({
  selector: 'app-data-flow-query-selection',
  templateUrl: './data-flow-query-selection.component.html',
  styleUrls: ['./data-flow-query-selection.component.scss']
})
export class DataFlowQuerySelectionComponent implements OnChanges, OnDestroy {

  @Input() public enableQueryButton: boolean = true;
  @Input() public dateRange: DateRange;


  @Output() public queryClick = new EventEmitter<ViewObservationQueryModel>()

  protected stationIds: string[] = [];
  //protected sourceId: number[] = [];
  protected elementId: number = 0;
  protected interval: number = 0;
  protected level: number = 0;
  protected queryAllowed: boolean = true;
  protected includeOnlyStationIds: string[] = [];
  private utcOffset: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private pagesDataService: PagesDataService,
    private appAuthService: AppAuthService,
    private generalSettingsService: GeneralSettingsService,
  ) {

    // Set default dates to 1 year
    const todayDate = new Date();
    const firstDate: Date = new Date();
    firstDate.setDate(todayDate.getDate() - 365);
    this.dateRange = { fromDate: DateUtils.getDateOnlyAsString(firstDate), toDate: DateUtils.getDateOnlyAsString(todayDate) };

    this.setStationsAllowed();

    // Get the climsoft time zone display setting
    this.generalSettingsService.findOne(SettingIdEnum.DISPLAY_TIME_ZONE).pipe(
      takeUntil(this.destroy$),
    ).subscribe((data) => {
      this.utcOffset = (data.parameters as ClimsoftDisplayTimeZoneModel).utcOffset;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setStationsAllowed(): void {
    this.appAuthService.user.pipe(
      takeUntil(this.destroy$),
    ).subscribe(user => {
      if (!user) {
        throw new Error('User not logged in');
      }

      if (user.isSystemAdmin) {
        this.includeOnlyStationIds = [];
        return;
      }

      if (!user.permissions) {
        this.queryAllowed = false;
        throw new Error('Developer error. Permissions NOT set.');
      }

      const permissions: UserPermissionModel = user.permissions;
      if (permissions.ingestionMonitoringPermissions) {
        this.includeOnlyStationIds = permissions.ingestionMonitoringPermissions.stationIds ? permissions.ingestionMonitoringPermissions.stationIds : [];
      } else {
        this.queryAllowed = false;
      }
    });
  }

  protected onQueryClick(): void {
    const observationFilter: ViewObservationQueryModel = { deleted: false };;

    // Get the data based on the selection filter

    if (this.stationIds.length > 0) {
      observationFilter.stationIds = this.stationIds;
    }

    if (this.elementId > 0) {
      observationFilter.elementIds = [this.elementId];
    } else {
      this.pagesDataService.showToast({ title: 'Data Flow', message: 'Element selection required', type: ToastEventTypeEnum.ERROR });
      return;
    }

    if (this.interval > 0) {
      observationFilter.intervals = [this.interval];
    } else {
      this.pagesDataService.showToast({ title: 'Data Flow', message: 'Interval selection required', type: ToastEventTypeEnum.ERROR });
      return;
    }

    observationFilter.level = this.level;

    // if (this.sourceIds.length > 0) {
    //   observationFilter.sourceIds = this.sourceIds;
    // }


    if (this.dateRange.fromDate) {
      observationFilter.fromDate = `${this.dateRange.fromDate}T00:00:00Z`;
      // Subtracts the offset to get UTC time if offset is plus and add the offset to get UTC time if offset is minus
      // Note, it's subtraction and NOT addition because this is meant to submit data to the API NOT display it
      observationFilter.fromDate = DateUtils.getDatetimesBasedOnUTCOffset(`${this.dateRange.fromDate}T00:00:00Z`, this.utcOffset, 'subtract');
    } else {
      this.pagesDataService.showToast({ title: 'Data Flow', message: 'From date selection required', type: ToastEventTypeEnum.ERROR });
      return;
    }

    if (this.dateRange.toDate) {
      // Subtracts the offset to get UTC time if offset is plus and add the offset to get UTC time if offset is minus
      // Note, it's subtraction and NOT addition because this is meant to submit data to the API NOT display it
      observationFilter.toDate = DateUtils.getDatetimesBasedOnUTCOffset(`${this.dateRange.toDate}T23:59:00Z`, this.utcOffset, 'subtract');
    } else {
      this.pagesDataService.showToast({ title: 'Data Flow', message: 'To date selection required', type: ToastEventTypeEnum.ERROR });
      return;
    }

    // Check maximum of 1 year

    if (this.isMoreThanOneCalendarYear(new Date(this.dateRange.fromDate), new Date(this.dateRange.toDate))) {
      this.pagesDataService.showToast({ title: 'Data Flow', message: 'Date range exceeds 1 year', type: ToastEventTypeEnum.ERROR });
      return;
    }

    this.queryClick.emit(observationFilter);
  }

  private isMoreThanOneCalendarYear(fromDate: Date, toDate: Date): boolean {
    const oneYearLater = new Date(fromDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return toDate > oneYearLater;
  }




}
