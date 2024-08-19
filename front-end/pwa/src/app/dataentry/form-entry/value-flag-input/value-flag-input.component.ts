import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ObservationsService } from 'src/app/core/services/observations/observations.service';
import { ViewObservationLogModel } from 'src/app/core/models/observations/view-observation-log.model';
import { ViewObservationLogQueryModel } from 'src/app/core/models/observations/view-observation-log-query.model';
import { take } from 'rxjs';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ObservationDefinition } from '../defintions/observation.definition';

/**
 * Component for data entry of observations
 */

@Component({
  selector: 'app-value-flag-input',
  templateUrl: './value-flag-input.component.html',
  styleUrls: ['./value-flag-input.component.scss']
})
export class ValueFlagInputComponent implements OnChanges {
  @Input()
  public id: string | number = '';

  @Input()
  public label: string = '';

  @Input()
  public observationDefinition!: ObservationDefinition;

  @Input()
  public displayHistoryOption: boolean = false;

  @Output()
  public valueChange = new EventEmitter<ObservationDefinition>();

  protected disableValueFlagEntry: boolean = false;

  constructor(private observationService: ObservationsService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["observationDefinition"]) {
      // Disable entry of future date times
      this.disableValueFlagEntry = new Date(this.observationDefinition.observation.datetime) > new Date()
    }
  }

  /**
   * Handles input change and updates its internal state
   * @param valueFlagInput e.g '200', '200E', 'M', '
   * @returns 
   */
  protected onInputEntry(valueFlagInput: string): void {
    // Validate input format validity. If there is a response then entry is invalid
    this.observationDefinition.updateValueFlagFromUserInput(valueFlagInput);
    this.valueChange.emit(this.observationDefinition);
  }

  /**
   * Hnadles Enter key pressed and updates its internal state
   */
  protected onEnterKeyPressed(): void {
    // If nothing has been input then put the M flag
    if (!this.observationDefinition.valueFlagForDisplay) {
      this.onInputEntry('M');
    }
  }

  /**
   * Raised when the comment component has its value changed
   */
  protected onCommentEntry(comment: string): void {
    this.observationDefinition.observation.comment = comment;
    this.valueChange.emit(this.observationDefinition);
  }

  /**
   * Raised when the log component is displayed 
   */
  protected loadObservationLog(): void {
    this.observationDefinition.loadObservationLog(this.observationService);
  }

}
