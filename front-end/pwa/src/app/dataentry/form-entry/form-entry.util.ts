
import { ElementModel } from 'src/app/core/models/element.model';
import { ObservationModel } from 'src/app/core/models/observation.model';
import { DataSelectorsValues } from './form-entry.component';
import { EntryType } from 'src/app/core/models/entry-form.model';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ArrayUtils } from 'src/app/shared/utils/array.utils';

export interface EntryFormFilter {
  stationId: string;
  sourceId: number;
  period: number;
  year: number;
  month: number;
  elementId?: number;
  day?: number;
  hour?: number;

  //limit?: number;
  //offset?: number;
}

export interface EntryFieldItem { fieldProperty: EntryType, fieldValues: number[] }

export class FormEntryUtil {

  public static getEntryFieldDefs(entryField: EntryType, elements: ElementModel[], year: number, month: number, hours: number[]): [number, string][] {

    let fieldDefs: [number, string][] = [];

    switch (entryField) {
      case 'ELEMENT':
        //create field definitions for the selected elements only
        fieldDefs = ArrayUtils.getTuppleWithNumbersAsKeys(elements, "id", "abbreviation");
        break;
      case 'DAY':
        //create field definitions for days of the selected month only
        //note, there is no days selection in the form builder
        fieldDefs = ArrayUtils.getTuppleWithNumbersAsKeys(DateUtils.getDaysInMonthList(year, month), "id", "name");
        break;
      case 'HOUR':
        //create field definitions for the selected hours only
        //note there is always hours selection in the form builder
        fieldDefs = ArrayUtils.getTuppleWithNumbersAsKeys(DateUtils.getHours(hours), "id", "name");
        break;
      default:
      //Not supported
      //todo. display error in set up 
    }

    return fieldDefs;
  }

  public static getEntryObservationsForLinearLayout(formFilter: EntryFormFilter, entryFieldItem: EntryFieldItem, dbObservations: ObservationModel[]): ObservationModel[] {

    const entryObservations: ObservationModel[] = [];
    for (const firstFieldValue of entryFieldItem.fieldValues) {

      const entryObservation: ObservationModel = FormEntryUtil.getEntryObservation(formFilter, [{ entryFieldProperty: entryFieldItem.fieldProperty, entryPropFieldValue: firstFieldValue }])

      entryObservations.push(FormEntryUtil.getExistingObservationIfItExists(dbObservations, entryObservation));

    }

    return entryObservations;
  }

  public static getEntryObservationsForGridLayout(formFilter: EntryFormFilter, entryFieldItems: [EntryFieldItem, EntryFieldItem], dbObservations: ObservationModel[]): ObservationModel[][] {

    const entryObservations: ObservationModel[][] = [];
    for (const firstFieldValue of entryFieldItems[0].fieldValues) {
      const subArrEntryObservations: ObservationModel[] = [];
      for (const secondFieldValue of entryFieldItems[1].fieldValues) {
        const entryObservation: ObservationModel = this.getEntryObservation(formFilter,
          [{ entryFieldProperty: entryFieldItems[0].fieldProperty, entryPropFieldValue: firstFieldValue },
          { entryFieldProperty: entryFieldItems[1].fieldProperty, entryPropFieldValue: secondFieldValue }]);

        subArrEntryObservations.push(this.getExistingObservationIfItExists(dbObservations, entryObservation));
      }

      entryObservations.push(subArrEntryObservations);

    }

    return entryObservations;
  }


  private static getEntryObservation(formFilter: EntryFormFilter,
    entryFields: [
      { entryFieldProperty: EntryType, entryPropFieldValue: number },
      { entryFieldProperty: EntryType, entryPropFieldValue: number }?
    ]): ObservationModel {
    //create new entr data
    const entryObservation: ObservationModel = {
      stationId: formFilter.stationId,
      sourceId: formFilter.sourceId,
      elementId: 0, level: 'surface',
      datetime: '',
      value: null, flag: null, qcStatus: 0,
      period: formFilter.period,
      comment: null, log: null
    };

    //set other fields
    if (formFilter.elementId ) {
      entryObservation.elementId = formFilter.elementId;
    }

    let datetimeVars: [number, number, number, number] = [-1, -1, -1, -1];

    datetimeVars[0] = formFilter.year;
    datetimeVars[1] = formFilter.month;

    if (formFilter.day ) {
      datetimeVars[2] = formFilter.day;
    }

    if (formFilter.hour ) {
      datetimeVars[3] = formFilter.hour;
    }

    //set entry field
    const firstEntryField = entryFields[0]
    if (firstEntryField.entryFieldProperty === 'ELEMENT') {
      entryObservation.elementId = firstEntryField.entryPropFieldValue;
    } else if (firstEntryField.entryFieldProperty === 'DAY') {
      datetimeVars[2] = firstEntryField.entryPropFieldValue;
    } else if (firstEntryField.entryFieldProperty === 'HOUR') {
      datetimeVars[3] = firstEntryField.entryPropFieldValue;
    } else {
      // Not supported yet
      // Todo throw an error
    }

    if (entryFields.length > 1 && entryFields[1]) {

      const secondEntryField = entryFields[1];
      if (secondEntryField.entryFieldProperty === 'ELEMENT') {
        entryObservation.elementId = secondEntryField.entryPropFieldValue;
      } else if (secondEntryField.entryFieldProperty === 'DAY') {
        datetimeVars[2] = secondEntryField.entryPropFieldValue;
      } else if (secondEntryField.entryFieldProperty === 'HOUR') {
        datetimeVars[3] = secondEntryField.entryPropFieldValue;
      } else {
        // Not supported yet
        // Todo throw an error
      }

    }

    //set datetime from date time variables. year-month-day hour. JS months are 0 based 
    entryObservation.datetime = DateUtils.getDateInSQLFormat(datetimeVars[0], datetimeVars[1], datetimeVars[2], datetimeVars[3], 0, 0);

    return entryObservation;
  }



  private static getExistingObservationIfItExists(dbObservations: ObservationModel[], entryObservation: ObservationModel): ObservationModel {
    for (const dbObservation of dbObservations) {
      // Look for the observation element id and date time.
      if (
        entryObservation.stationId === dbObservation.stationId &&
        entryObservation.elementId === dbObservation.elementId &&
        entryObservation.sourceId === dbObservation.sourceId &&
        entryObservation.level === dbObservation.level &&
        entryObservation.datetime === dbObservation.datetime &&
        entryObservation.period === dbObservation.period) {
        return dbObservation;
      }
    }

    return entryObservation;

  }


  public static getScaledValue(element: ElementModel, unscaledValue: number): number {
    //return element ? parseFloat((unscaledValue * element.entryScaleFactor).toFixed(2)) : 0;
    return element.entryScaleFactor ? unscaledValue * element.entryScaleFactor : unscaledValue;
  }

  public static getTotal(entryObservations: ObservationModel[], elements: ElementModel[]): number | null {
    let total = 0;
    let allAreNull: boolean = true;

    if (entryObservations.length > 0) {
      // Create a map for quick element lookup
      const elementsMap = new Map(elements.map(element => [element.id, element]));
      for (const obs of entryObservations) {
        if (obs.value !== null) {
          const element = elementsMap.get(obs.elementId);
          total = element ? total + FormEntryUtil.getScaledValue(element, obs.value) : total;
          allAreNull = false;
        }
      }
    }

    return allAreNull ? null : total;

  }


  public static checkTotal(expectedTotal: number | null, inputTotal: number | null): string {

    let errorMessage: string = '';

    if (inputTotal !== expectedTotal) {
      if (expectedTotal !== null) {
        errorMessage = `Expected total is ${expectedTotal}`;
      } else {
        errorMessage = `No total total expected`;
      }
    }

    return errorMessage;
  }


}
