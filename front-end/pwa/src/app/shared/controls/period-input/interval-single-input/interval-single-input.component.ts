import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { Interval, IntervalsUtil } from '../Intervals.util';

// TODO. Make this control to be editable
@Component({
  selector: 'app-period-single-input',
  templateUrl: './interval-single-input.component.html',
  styleUrls: ['./interval-single-input.component.scss']
})
export class IntervalSingleInputComponent implements OnChanges {
  @Input() public id: string = '';
  @Input() public label: string = '';
  @Input() public errorMessage: string = '';
  @Input() public includeOnlyIds!: number[];
  @Input() public selectedId!: number | null;
  @Output() public selectedIdChange = new EventEmitter<number>();

  protected options!: Interval[];
  protected selectedOption!: Interval | null;

  constructor() { 
    this.options = IntervalsUtil.possibleIntervals;
  }

  ngOnChanges(changes: SimpleChanges): void {

    //load options once
    if (this.includeOnlyIds && this.includeOnlyIds.length > 0) {
      this.options = IntervalsUtil.possibleIntervals.filter(data => this.includeOnlyIds.includes(data.id));
    }

    // Only react to changes if selectedId actually changes and is not the first change
    if (this.selectedId) {
      const found = this.options.find(period => period.id === this.selectedId);
      if (found && found !== this.selectedOption) {
        //console.log('setting found: ', found)
        this.selectedOption = found;
      }

    }

  }

  protected optionDisplayFunction(option: Interval): string {
    return option.name;
  }

  protected onSelectedOptionChange(selectedOption: Interval | null) {
    //console.log('period selection',' this.selectedOption: ', this.selectedOption, ' selectedOption', selectedOption);
    if (selectedOption) {
      this.selectedId = selectedOption.id;
      this.selectedIdChange.emit(selectedOption.id);
    }

  }
}
