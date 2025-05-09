import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { StringUtils } from '../../utils/string.utils';
import { ServerTypeEnum } from 'src/app/metadata/connectors/server-type.enum';

@Component({
  selector: 'app-server-type-input',
  templateUrl: './server-type-input.component.html',
  styleUrls: ['./server-type-input.component.scss']
})
export class ServerTypeInputComponent implements OnChanges {
  @Input() public label: string = 'Server Type';
  @Input() public errorMessage!: string;
  @Input() public includeOnlyIds!: ServerTypeEnum[];
  @Input() public selectedId!: ServerTypeEnum | null;
  @Output() public selectedIdChange = new EventEmitter<ServerTypeEnum | null>();

  protected options!: ServerTypeEnum[];
  protected selectedOption!: ServerTypeEnum | null;

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    //load options once
    if (!this.options) {
      this.options = Object.values(ServerTypeEnum);
    }

    if (this.includeOnlyIds && this.includeOnlyIds.length > 0) {
      this.options = this.options.filter(
        data => this.includeOnlyIds.includes(data));
    }

    // Only react to changes if selectedId actually changes and is not the first change
    if (this.selectedId) {
      const found = this.options.find(period => period === this.selectedId);
      if (found && found !== this.selectedOption) {
        this.selectedOption = found;
      }
    }

  }

  protected optionDisplayFunction(option: ServerTypeEnum): string {
    return StringUtils.formatEnumForDisplay (option);
  }

  protected onSelectedOptionChange(selectedOption: ServerTypeEnum | null) {
    this.selectedOption = selectedOption;
    this.selectedIdChange.emit(selectedOption ? selectedOption : null);
  }
}
