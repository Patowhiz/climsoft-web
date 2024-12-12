import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { ViewStationObsFocusModel } from 'src/app/core/models/stations/view-station-obs-focus.model';
import { StationsCacheService } from 'src/app/metadata/stations/services/stations-cache.service';

@Component({
  selector: 'app-station-obs-focus-single-input',
  templateUrl: './station-obs-focus-single-input.component.html',
  styleUrls: ['./station-obs-focus-single-input.component.scss']
})
export class StationObservationFocusSingleInputComponent implements OnInit, OnChanges {
  @Input() public label: string = 'Observation Focus';
  @Input() errorMessage: string = '';
  @Input() public includeOnlyIds!: number[];
  @Input() public selectedId!: number | null;
  @Output() public selectedIdChange = new EventEmitter<number | null>();

  protected options!: ViewStationObsFocusModel[];
  protected selectedOption!: ViewStationObsFocusModel | null;

  constructor(private stationsCacheService: StationsCacheService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    //load the elements once
    if (!this.options || (this.includeOnlyIds && this.includeOnlyIds.length > 0)) {
      this.setOptions();
    } else {
      this.setInputSelectedOption();
    }

  }

  // TODO. Temporary. Later convert to an observable
  private async setOptions() {
    this.options = await this.stationsCacheService.getStationObsFocus();
    this.setInputSelectedOption();
  }

  private setInputSelectedOption(): void {
    if (this.options && this.selectedId) {
      const found = this.options.find(data => data.id === this.selectedId);
      this.selectedOption = found ? found : null;
    }
  }

  protected optionDisplayFunction(option: ViewStationObsFocusModel): string {
    return option.name;
  }

  protected onSelectedOptionChange(selectedOption: ViewStationObsFocusModel | null) {
    //console.log('focus change: ', selectedOption);
    this.selectedOption = selectedOption;
    if (selectedOption) {
      this.selectedId = selectedOption.id;
      this.selectedIdChange.emit(selectedOption.id);
    } else {
      this.selectedIdChange.emit(null);
    }

  }
}
