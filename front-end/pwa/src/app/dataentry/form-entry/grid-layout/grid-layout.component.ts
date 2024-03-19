import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core'; 
import { EntryForm } from 'src/app/core/models/entry-form.model';
import { ViewElementModel } from 'src/app/core/models/view-element.model'; 
import { EntryFieldItem, EntryFormFilter, FormEntryUtil } from '../form-entry.util';
import { CreateObservationModel } from 'src/app/core/models/create-observation.model';

@Component({
  selector: 'app-grid-layout',
  templateUrl: './grid-layout.component.html',
  styleUrls: ['./grid-layout.component.scss']
})
export class GridLayoutComponent implements OnInit, OnChanges {
  @Input() elements!: ViewElementModel[];
  @Input() formFilter!: EntryFormFilter;
  @Input() formMetadata!: EntryForm;
  @Input() dbObservations!: CreateObservationModel[];
  @Output() valueChange = new EventEmitter<CreateObservationModel>();
  @Output() public enableSave = new EventEmitter<boolean>();

  protected rowFieldDefinitions!: [number, string][];
  protected colFieldDefinitions!: [number, string][];
  protected entryObservations!: CreateObservationModel[][];
  protected entryTotals!: { value: number | null, errorMessage: string | null }[];
 

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    //only proceed with seting up the control if all inputs have been set.
    if (this.dbObservations && this.elements && this.elements.length > 0 &&
      this.formFilter && this.formMetadata) {

      this.setup();

    } else {
      this.entryObservations = [];
    }

  }

  protected get rowHeaderName(): string{
    return this.formMetadata.fields[0]
  }

  private setup(): void {

    if (!(this.formMetadata.fields.length > 1 && this.formMetadata.fields[1])) {
      return;
    }

    //get entry field to use for control definitions

    const entryFieldForRow = this.formMetadata.fields[0];
    const entryFieldForColumn = this.formMetadata.fields[1];

    const rowFieldDefs: [number, string][] = FormEntryUtil.getEntryFieldDefs(
      entryFieldForRow, this.elements, this.formFilter.year, this.formFilter.month, this.formMetadata.hours
    );

    const colFieldDefs: [number, string][] = FormEntryUtil.getEntryFieldDefs(
      entryFieldForColumn, this.elements, this.formFilter.year, this.formFilter.month, this.formMetadata.hours
    );

    const rowFieldItems: EntryFieldItem = { fieldProperty: entryFieldForRow, fieldValues: rowFieldDefs.map(data => (data[0])) }
    const colFieldItems: EntryFieldItem = { fieldProperty: entryFieldForColumn, fieldValues: colFieldDefs.map(data => (data[0])) }
    const entryObservations: CreateObservationModel[][] = FormEntryUtil.getEntryObservationsForGridLayout(this.formFilter, [rowFieldItems, colFieldItems], this.dbObservations);

    this.rowFieldDefinitions = rowFieldDefs;
    this.colFieldDefinitions = colFieldDefs;
    this.entryObservations = entryObservations;
    if (this.formMetadata.validateTotal) {
      const entryTotals = [];
      for (let colIndex = 0; colIndex < this.colFieldDefinitions.length; colIndex++) {
        entryTotals.push({ value: this.getColumnTotal(colIndex), errorMessage: '' });
      }
      this.entryTotals = entryTotals;

    }
  }

  public getEntryObservation(rowIndex: number, colIndex: number): CreateObservationModel {
    return this.entryObservations[rowIndex][colIndex];
  }

  protected onValueChange(colIndex: number): void {
    if (this.formMetadata.validateTotal) {
      const entryTotal = this.entryTotals[colIndex];
      entryTotal.errorMessage = null;
      entryTotal.value = null;
    }

    this.enableSave.emit(!this.formMetadata.validateTotal);
  }


  protected onInputBlur(entryObservation: CreateObservationModel): void {
    this.valueChange.emit(entryObservation);
  }

  protected onTotalValueChange(colIndex: number, value: number | null): void {
    this.entryTotals[colIndex].value = value;
    // If no error, then emit true
    // if error detected emit false
    this.enableSave.emit(this.allColumnTotalsValid());
  }


  private getColumnTotal(colIndex: number): number | null {
    const colObservations: CreateObservationModel[] = []
    for (let rowIndex = 0; rowIndex < this.rowFieldDefinitions.length; rowIndex++) {
      colObservations.push(this.entryObservations[rowIndex][colIndex]);
    }
    return FormEntryUtil.getTotal(colObservations, this.elements);
  }

  private allColumnTotalsValid(): boolean {
    for (let colIndex = 0; colIndex < this.colFieldDefinitions.length; colIndex++) {
      const expectedTotal = this.getColumnTotal(colIndex);
      const entryTotal = this.entryTotals[colIndex];
      entryTotal.errorMessage = FormEntryUtil.checkTotal(expectedTotal, entryTotal.value);
      if (entryTotal.errorMessage) {
        return false;
      }
    }

    return true;
  }

}
