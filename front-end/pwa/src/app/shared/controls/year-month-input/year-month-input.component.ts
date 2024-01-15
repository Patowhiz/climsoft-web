import { Component,Input ,EventEmitter,Output} from '@angular/core';

@Component({
  selector: 'app-year-month-input',
  templateUrl: './year-month-input.component.html',
  styleUrls: ['./year-month-input.component.scss']
})
export class YearMonthInputComponent {
  @Input() public label: string = 'Year-month';
  @Input() public disabled: boolean = false;
  @Input() public hintMessage!: string;
  @Input() public errorMessage!: string | null;
  @Input() public value!: string;
  @Output() public valueChange = new EventEmitter<string >();
  @Output() public inputClick = new EventEmitter<string >();
  @Output() public inputEnterKeyPress = new EventEmitter<string>();
  @Output() public inputBlur = new EventEmitter<string >();

  protected onValueChange(value: string) {
    this.valueChange.emit(value);
  }

  protected onInputClick(): void {
    this.inputClick.emit(this.value);
  }
  protected onEnterKeyPressed() {
    this.inputEnterKeyPress.emit(this.value);
  }

  protected onInputBlur() {
    this.inputBlur.emit(this.value);
  }

}
