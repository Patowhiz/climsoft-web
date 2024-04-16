import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { StationObsProcessingMethodEnum } from 'src/app/core/models/stations/station-obs-Processing-method.enum';
import { StringUtils } from 'src/app/shared/utils/string.utils';

@Component({
  selector: 'app-station-obs-method-single-input',
  templateUrl: './station-obs-method-single-input.component.html',
  styleUrls: ['./station-obs-method-single-input.component.scss']
})
export class StationObsMethodSingleInputComponent implements OnInit, OnChanges {
  @Input() public label: string = 'Observation Method';
  @Input() public errorMessage: string = '';
  @Input() public includeOnlyIds!: StationObsProcessingMethodEnum[];
  @Input() public selectedId!: StationObsProcessingMethodEnum | null;
  @Output() public selectedIdChange = new EventEmitter<StationObsProcessingMethodEnum | null>();

  protected options!: StationObsProcessingMethodEnum[];
  protected selectedOption!: StationObsProcessingMethodEnum | null;

  constructor() {

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {


    //load options once
    if (!this.options) {
      this.options = Object.values(StationObsProcessingMethodEnum);;
    }

    if (this.includeOnlyIds && this.includeOnlyIds.length > 0) {
      this.options = Object.values(StationObsProcessingMethodEnum).filter(
        data => this.includeOnlyIds.includes(data));
    }

    // Only react to changes if selectedId actually changes and is not the first change
    if (this.selectedId) {
      const found = this.options.find(period => period === this.selectedId);
      if (found && found !== this.selectedOption) {
        //console.log('setting found: ', found)
        this.selectedOption = found;
      }

    }

  }

  protected optionDisplayFunction(option: StationObsProcessingMethodEnum): string {
    return StringUtils.capitalizeFirstLetter(option);
  }

  protected onSelectedOptionChange(selectedOption: StationObsProcessingMethodEnum | null) {
    this.selectedIdChange.emit(selectedOption? selectedOption: null);
  }
}
