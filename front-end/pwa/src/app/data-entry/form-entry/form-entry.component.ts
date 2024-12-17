import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ObservationsService } from 'src/app/core/services/observations/observations.service';
import { PagesDataService, ToastEventTypeEnum } from 'src/app/core/services/pages-data.service';
import { StringUtils } from 'src/app/shared/utils/string.utils';
import { CreateObservationModel } from 'src/app/core/models/observations/create-observation.model';
import { catchError, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { FormEntryDefinition } from './defintions/form-entry.definition';
import { ViewSourceModel } from 'src/app/metadata/sources/models/view-source.model';
import { ViewEntryFormModel } from 'src/app/metadata/sources/models/view-entry-form.model';
import { SameInputStruct } from './assign-same-input/assign-same-input.component';
import { QCTestsService } from 'src/app/core/services/elements/qc-tests.service';
import { QCTestTypeEnum } from 'src/app/core/models/elements/qc-tests/qc-test-type.enum';
import { UpdateQCTestModel } from 'src/app/core/models/elements/qc-tests/update-qc-test.model';
import { SourcesCacheService } from 'src/app/metadata/sources/services/sources-cache.service';
import { StationCacheModel, StationsCacheService } from 'src/app/metadata/stations/services/stations-cache.service';
import { UserFormSettingsComponent, UserFormSettingStruct } from './user-form-settings/user-form-settings.component';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';

@Component({
  selector: 'app-form-entry',
  templateUrl: './form-entry.component.html',
  styleUrls: ['./form-entry.component.scss']
})
export class FormEntryComponent implements OnInit, OnDestroy {
  /** Station details */
  protected station!: StationCacheModel;

  /** Source (form) details */
  protected source!: ViewSourceModel;

  /** Definitions used to determine form functionalities */
  protected formDefinitions!: FormEntryDefinition;

  private totalIsValid!: boolean;

  protected displayExtraInfoOption: boolean = false;

  protected refreshLayout: boolean = false;
  protected incrementDateSelector: boolean = false;
  protected gridNavigation: 'horizontal' | 'vertical' = 'horizontal';

  protected openSameInputDialog: boolean = false;
  protected openUserFormSettingsDialog: boolean = false;

  private destroy$ = new Subject<void>();

  protected defaultYearMonthValue!: string;
  protected defaultDateValue!: string;

  constructor
    (private pagesDataService: PagesDataService,
      private sourcesCacheService: SourcesCacheService,
      private stationsCacheService: StationsCacheService,
      private observationService: ObservationsService,
      private qcTestsService: QCTestsService,
      private route: ActivatedRoute,
      private location: Location,
      private localStorage: LocalStorageService,) {
    this.pagesDataService.setPageHeader('Data Entry');
    this.setUserFormSettings();
  }

  ngOnInit(): void {
    const stationId = this.route.snapshot.params['stationid'];
    const sourceId = +this.route.snapshot.params['sourceid'];

    // Get station name and switch to form metadata retrieval
    this.stationsCacheService.findOne(stationId).pipe(
      takeUntil(this.destroy$),
      switchMap(stationData => {
        if (stationData) {
          this.station = stationData;
          return this.sourcesCacheService.findOne(+sourceId).pipe(takeUntil(this.destroy$));
        } else {
          return of(null);
        }
      })
    ).subscribe(sourceData => {
      if (!sourceData) {
        // TODO. Display the necessary feedback.
        return;
      }
      this.source = sourceData;
      // TODO. find a way of correctly chaining this.
      // Get all the range threshold qc's
      this.qcTestsService.findQCTestByType(QCTestTypeEnum.RANGE_THRESHOLD).pipe(takeUntil(this.destroy$)).subscribe(data => {
        const qcTests: UpdateQCTestModel[] = data.filter(item => (!item.disabled));
        // Set the form definitions from the parameters
        this.formDefinitions = new FormEntryDefinition(this.station, this.source, this.source.parameters as ViewEntryFormModel, qcTests);
        this.loadObservations();

        /** Gets default date value (YYYY-MM-DD) used by date selector */
        this.defaultDateValue = new Date().toISOString().slice(0, 10);

        // Gets default year-month value (YYYY-MM) used by year-month selector
        this.defaultYearMonthValue = this.formDefinitions.yearSelectorValue + '-' + StringUtils.addLeadingZero(this.formDefinitions.monthSelectorValue);
      });


    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setUserFormSettings(): void {
    const savedUserFormSetting = this.localStorage.getItem<UserFormSettingStruct>(UserFormSettingsComponent.USER_FORM_SETTING_STORAGE_NAME);
    if (savedUserFormSetting) {
      this.gridNavigation = savedUserFormSetting.gridNavigation === 'vertical' ? 'vertical' : 'horizontal';
      this.incrementDateSelector = savedUserFormSetting.incrementDateSelector;
    }
  }

  /**
   * Used to determine whether to display element selector 
   */
  protected get displayElementSelector(): boolean {
    return this.formDefinitions.formMetadata.selectors.includes('ELEMENT');
  }

  /**
   * Used to determine whether to display date selector
   */
  protected get displayDateSelector(): boolean {
    return this.formDefinitions.formMetadata.selectors.includes('DAY');
  }

  /**
   * Used to determine whether to display year-month selector
   */
  protected get displayYearMonthSelector(): boolean {
    return !this.displayDateSelector;
  }

  /**
   * Used to determine whether to display hour selector
   */
  protected get displayHourSelector(): boolean {
    return this.formDefinitions.formMetadata.selectors.includes('HOUR');
  }

  protected get utcDifference(): string {
    const utcDiff: number = this.source.utcOffset;
    let strUtcDiff: string = "in";

    if (utcDiff > 0) {
      // Subtract the offset to get UTC time. Local time is ahead of UTC, so to move "back" to UTC
      strUtcDiff = `-${utcDiff}`;
    } else if (utcDiff < 0) {
      // Add the offset to get UTC time. Local time is behind UTC, so to move "forward" to UTC
      strUtcDiff = `-${Math.abs(utcDiff)}`;
    }

    return ` (${strUtcDiff} UTC)`;
  }

  /**
   * Loads any existing observations from the database
   */
  private loadObservations(): void {
    // Reset controls
    this.totalIsValid = false;
    this.refreshLayout = false;

    this.observationService.findRaw(this.formDefinitions.createObservationQuery()).pipe(
      take(1),
      catchError(error => {
        console.error('Failed to load observation data', error);
        return of([]); // TODO. Appropriate fallback needed
      })
    ).subscribe(data => {
      this.formDefinitions.createEntryObsDefs(data);
      this.refreshLayout = true;
    });

  }


  /**
   * Handles changes in element selection by updating internal state
   * @param id 
   * @returns 
   */
  public onElementChange(id: number | null): void {
    if (id === null) {
      return;
    }

    this.formDefinitions.elementSelectorValue = id;
    this.loadObservations();
  }

  /**
   * Handles changes in year and month selection by updating internal state
   * @param yearMonth 
   * @returns 
   */
  protected onYearMonthChange(yearMonth: string | null): void {
    if (yearMonth === null) {
      return;
    }

    const date: Date = new Date(yearMonth);
    this.formDefinitions.yearSelectorValue = date.getFullYear();
    this.formDefinitions.monthSelectorValue = date.getMonth() + 1;
    this.loadObservations();
  }

  /**
   * Handles changes in year, month and day selection by updating internal state
   * @param strDate 
   * @returns 
   */
  protected onDateChange(strDate: string | null): void {
    if (strDate === null) {
      return;
    }

    const oDate: Date = new Date(strDate);
    this.formDefinitions.yearSelectorValue = oDate.getFullYear();
    this.formDefinitions.monthSelectorValue = oDate.getMonth() + 1;
    this.formDefinitions.daySelectorValue = oDate.getDate();
    this.loadObservations();
  }

  /**
   * Handles changes in hour selection by updating internal state
   * @param hour 
   * @returns 
   */
  protected onHourChange(hour: number | null): void {
    if (hour === null) {
      return;
    }

    this.formDefinitions.hourSelectorValue = hour;
    this.loadObservations();
  }

  /**
   * Handles validation of total input from the layouts
   * @param totalIsValid 
   */
  protected onTotalIsValid(totalIsValid: boolean) {
    this.totalIsValid = totalIsValid;
  }

  /**
   * Updates its internal state depending on the options passed
   * @param option  'Same Input' | 'Clear Input' | 'Add Extra Info' | 'Settings'
   */
  protected onOptions(option: 'Same Input' | 'Clear Input' | 'Add Extra Info' | 'Settings'): void {
    switch (option) {
      case 'Same Input':
        this.openSameInputDialog = true;
        break;
      case 'Clear Input':
        this.clear();
        break;
      case 'Add Extra Info':
        this.displayExtraInfoOption = !this.displayExtraInfoOption;
        break;
      case 'Settings':
        this.openUserFormSettingsDialog = true;
        break;
    }
  }

  /**
   * Sets the same value flag to all entry fields
   * @param input 
   */
  protected onAssignSameValue(input: SameInputStruct): void {
    for (const obsDef of this.formDefinitions.allObsDefs) {
      // Check if value flag is empty
      if (StringUtils.isNullOrEmpty(obsDef.valueFlagForDisplay)) {
        // Set the new the value flag input
        obsDef.updateValueFlagFromUserInput(input.valueFlag);
        obsDef.updateCommentInput(input.comment);
      }
    }
  }

  /**
  * Clears all the observation value flags if they are not cleared and updates its internal state
  */
  private clear(): void {
    for (const obsDef of this.formDefinitions.allObsDefs) {
      // Clear the value flag input
      obsDef.updateValueFlagFromUserInput('');
      obsDef.updateCommentInput('');
      obsDef.updatePeriodInput(this.formDefinitions.formMetadata.period);
    }
  }

  protected onUserFormStetingChange(userFormSetting: UserFormSettingStruct): void {
    this.gridNavigation = userFormSetting.gridNavigation;
    this.incrementDateSelector = userFormSetting.incrementDateSelector;
  }

  /**
   * Handles saving of observations by sending the data to the server and updating intenal state
   */
  protected onSave(): void {
    // Get observations that have changes and have either value or flag, that is, ignore blanks or unchanged values.
    const newObservations: CreateObservationModel[] | null = this.checkValidityAndGetChanges();
    if (newObservations !== null) {
      // Send to server for saving
      this.observationService.save(newObservations).subscribe((data) => {
        const multipleObs = `${newObservations.length} observation${newObservations.length === 1 ? '' : 's'} `
        if (data) {
          this.pagesDataService.showToast({
            title: 'Observations', message: `${multipleObs}saved`, type: ToastEventTypeEnum.SUCCESS
          });

          if (this.incrementDateSelector) {
            this.sequenceToNextDate();
          }
          this.loadObservations();
        } else {
          this.pagesDataService.showToast({
            title: 'Observations', message: `${multipleObs}NOT saved`, type: ToastEventTypeEnum.ERROR
          });
        }
      });
    }
  }

  /**
   * Determine the ability to save based on whether there are changes and all observation changes are valid
   * @returns 
   */
  private checkValidityAndGetChanges(): CreateObservationModel[] | null {
    if (!this.formDefinitions) {
      this.pagesDataService.showToast({ title: 'Observations', message: `Form parameters not set`, type: ToastEventTypeEnum.ERROR });
      return null;
    }

    // Set total as valid, because everything has been cleared
    if (this.formDefinitions.formMetadata.requireTotalInput && !this.totalIsValid) {
      this.pagesDataService.showToast({ title: 'Observations', message: `Total value not entered`, type: ToastEventTypeEnum.ERROR });
      return null;
    }

    for (const obsDef of this.formDefinitions.allObsDefs) {
      // Check for change validity
      if (!obsDef.observationChangeIsValid) {
        this.pagesDataService.showToast({ title: 'Observations', message: `Invalid value detected`, type: ToastEventTypeEnum.ERROR });
        return null;
      }
    }

    // Get observations that have changes and have either value or flag, that is, ignore blanks or unchanged values.
    let newObservations: CreateObservationModel[] = this.formDefinitions.allObsDefs.filter(
      item => item.observationChanged && (item.observation.value !== null || item.observation.flag !== null
      )).map(item => item.observation);

    if (newObservations.length === 0) {
      this.pagesDataService.showToast({ title: 'Observations', message: `No changes made`, type: ToastEventTypeEnum.ERROR });
      return null;
    }

    return newObservations;
  }

  private sequenceToNextDate(): void {
    const currentYearValue: number = this.formDefinitions.yearSelectorValue;
    const currentMonthValue: number = this.formDefinitions.monthSelectorValue; // 1-indexed (January = 1)
    const today = new Date();

    let newYear = currentYearValue;
    let newMonth = currentMonthValue;
    let newDay: number | null = null;

    if (this.formDefinitions.daySelectorValue) {
      let currentDayValue = this.formDefinitions.daySelectorValue;

      const daysInMonth = new Date(newYear, newMonth, 0).getDate(); // Get days in the current month
      if (currentDayValue < daysInMonth) {
        newDay = currentDayValue + 1; // Sequence to the next day
      } else {
        // If it's the last day of the month, sequence to the first day of the next month
        newDay = 1;
        if (newMonth < 12) {
          newMonth++;
        } else {
          // If it's December, sequence to January of the next year
          newMonth = 1;
          newYear++;
        }
      }
    } else {
      // If daySelectorValue is not defined, sequence to the next month
      if (newMonth < 12) {
        newMonth++;
      } else {
        // If it's December, sequence to January of the next year
        newMonth = 1;
        newYear++;
      }
    }

    // Ensure sequencing does not exceed the current date
    const newDate = new Date(newYear, newMonth - 1, newDay || 1); // Use 1 if no day is specified
    if (newDate > today) {
      console.warn("Sequencing exceeds the current date. No changes applied.");
      return;
    }

    // Update the form definitions with the sequenced values
    this.formDefinitions.yearSelectorValue = newYear;
    this.formDefinitions.monthSelectorValue = newMonth;
    if (newDay !== null) {
      this.formDefinitions.daySelectorValue = newDay;
      /** Gets default date value (YYYY-MM-DD) used by date selector */
      this.defaultDateValue = this.formDefinitions.yearSelectorValue + '-' + StringUtils.addLeadingZero(this.formDefinitions.monthSelectorValue)+ '-' + StringUtils.addLeadingZero(this.formDefinitions.daySelectorValue);
    }

    // Gets default year-month value (YYYY-MM) used by year-month selector
    this.defaultYearMonthValue = this.formDefinitions.yearSelectorValue + '-' + StringUtils.addLeadingZero(this.formDefinitions.monthSelectorValue);

    console.log('year month: ', this.defaultYearMonthValue);
  }

  /**
   * Handles cancel event and routes the application back to previous route page
   */
  protected onCancel(): void {
    this.location.back();
  }


}
