import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { RepoService } from '../../shared/services/repo.service';
import { EntryForm } from '../../shared/models/entryform.model';
import { Element } from '../../shared/models/element.model';
import { DateUtils } from '../../shared/utils/date-utils';
import { EntryDataSource } from '../../shared/models/entrydatasource.model';
import { PagesDataService } from '../../shared/services/pages-data.service';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  entryDataSource: EntryDataSource;

  allEntrySelectors: { [key: string]: any }[] = [{ id: 'year', name: 'Year' }, { id: "month", name: 'Month' }, { id: 'day', name: 'Day' }, { id: 'hour', name: 'Hour' }, { id: 'elementId', name: 'Element' }];;
  allEntryFields: { [key: string]: any }[] = [];
  selectedEntrySelectorIds: string[] = [];
  selectedEntryFieldIds: string[] = [];
  selectedEntryControlId: string = '';
  selectedElementIds: number[] = [];
  selectedHourIds: number[] = [];
  formName: string = '';
  formDescription: string = '';
  errorMessage: string = '';

  constructor(private viewDataService: PagesDataService, public repo: RepoService, private location: Location) {

    this.entryDataSource = this.viewDataService.getViewNavigationData()['dataSourceData'];

    if (this.entryDataSource) {
      //get selection from data source
      this.formName = this.entryDataSource.name;
      this.formDescription = this.entryDataSource.description;
      const entryForm: EntryForm = this.getEntryForm(this.entryDataSource.extraMetadata);
      this.selectedEntrySelectorIds = entryForm.entrySelectors;
      this.selectedElementIds = entryForm.elements;
      this.selectedHourIds = entryForm.hours;
    } else {
      //create new entry data source
      this.entryDataSource = { id: 0, name: '', description: '', acquisitionTypeId: 1, extraMetadata: '' }
      //set entry selectors initial defaults
      this.selectedEntrySelectorIds = this.allEntrySelectors.slice(0, 4).map(item => item['id']);
      this.selectedHourIds = DateUtils.getHours().map(item => item['id']);
    }

    //set the control and the fields
    this.setEntryFieldsAndControl();

  }

  ngOnInit(): void {
  }

  getEntryForm(entryFormJsonString: string): EntryForm {
    let entryForm: EntryForm;
    if (entryFormJsonString === undefined || entryFormJsonString === null || entryFormJsonString === '') {
      entryForm = {
        entrySelectors: [],
        entryFields: [],
        entryControl: '',
        elements: [],
        hours: [],
        scale: 0,
        formValidations: '',
        samplePaperImage: '',
      };
    } else {
      entryForm = JSON.parse(entryFormJsonString);
    }

    return entryForm;
  }

  //changes the possible selection of entry fields and entry control
  setEntryFieldsAndControl(): void {

    //reset the possible entry fields to all entry selectors
    this.allEntryFields = [...this.allEntrySelectors];

    //remove selected entry selectors from the list of selectable entry fields
    this.allEntryFields = this.allEntryFields.filter(item => !this.selectedEntrySelectorIds.includes(item['id']));

    //set the new entry fields as the selected ones
    this.selectedEntryFieldIds =this.allEntryFields.map(item => item['id']);

    //set entry control
    this.setEntryControl();

  }

  setEntryControl(): void {
    if (this.selectedEntryFieldIds.length === 1) {
      this.selectedEntryControlId = 'vf';
    } else if (this.selectedEntryFieldIds.length === 2) {
      this.selectedEntryControlId = 'grid';
    } else {
      this.selectedEntryControlId = '';
    }
  }

  onSave(): void {

    if (!this.formName) {
      this.errorMessage = 'Enter form name';
      return;
    }

    if (!this.formDescription) {
      this.errorMessage = 'Enter form description';
      return;
    }

    if (!this.entrySelectorsValid()) {
      this.errorMessage = 'Select valid entry selectors';
      return;
    }

    if (!this.entryFieldsValid()) {
      this.errorMessage = 'Select valid entry fields';
      return;
    }

    if (this.selectedElementIds.length === 0) {
      this.errorMessage = 'Select elements';
    }

    if (this.selectedHourIds.length === 0) {
      this.errorMessage = 'Select hours';
    }

    this.entryDataSource.acquisitionTypeId = 1;
    this.entryDataSource.name = this.formName;
    this.entryDataSource.description = this.formDescription;
    
    const entryForm: EntryForm = this.getEntryForm('');
    entryForm.entrySelectors = this.selectedEntrySelectorIds;
    entryForm.entryFields = this.selectedEntryFieldIds;
    entryForm.entryControl = this.selectedEntryControlId;
    entryForm.elements = this.selectedElementIds;
    entryForm.hours = this.selectedHourIds;
    
    this.entryDataSource.extraMetadata = JSON.stringify(entryForm);

    //console.log("data source: ", this.entryDataSource);

    //todo. this will eventually be through subscription
    this.repo.saveDataSource(this.entryDataSource);

    //this should always just navigate back
    this.location.back();

  }

  onCancel(): void {
    this.location.back();
  }


  entrySelectorsValid(): boolean {
    //must be a minimum of 4 and maximum of 5
    return this.selectedEntrySelectorIds.length >= 3 && this.selectedEntrySelectorIds.length <= 4;
  }

  entryFieldsValid(): boolean {
    //must be a minimum of 1 or maximum of 2 depending on the selectors
    if (this.selectedEntrySelectorIds.length === 4) {
      return this.selectedEntryFieldIds.length === 1;
    } else if (this.selectedEntrySelectorIds.length === 3) {
      return this.selectedEntryFieldIds.length === 2;
    } else {
      return false;
    }
  }



}
