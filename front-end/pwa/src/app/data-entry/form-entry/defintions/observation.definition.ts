import { take } from "rxjs";
import { RangeThresholdQCTestParamsModel } from "src/app/core/models/elements/qc-tests/qc-test-parameters/range-qc-test-params.model";
import { ViewElementModel } from "src/app/core/models/elements/view-element.model";
import { CreateObservationModel } from "src/app/core/models/observations/create-observation.model";
import { FlagEnum } from "src/app/core/models/observations/flag.enum";
import { ViewObservationLogQueryModel } from "src/app/core/models/observations/view-observation-log-query.model";
import { ViewObservationLogModel } from "src/app/core/models/observations/view-observation-log.model";
import { ObservationsService } from "src/app/core/services/observations/observations.service";
import { DateUtils } from "src/app/shared/utils/date.utils";
import { NumberUtils } from "src/app/shared/utils/number.utils";
import { StringUtils } from "src/app/shared/utils/string.utils";

/**
 * Holds the definitions used by the value flag component for data display and entry validations
 */
export class ObservationDefinition {
    private elementMetadata: ViewElementModel;
    private _observation: CreateObservationModel;
    private _valueFlagForDisplay: string = "";
    private _valueFlagForDisplayDB: string = "";

    /**
     * Determines whether to invalidate missing value input
     */
    private allowMissingValues: boolean;
 
    /**
     * Determines whether the value input will be scaled or not (using the element entry factor).
     * Also determines whether _valueFlagForDisplay will be ins scaled or unscaled format. 
     */
    private scaleValue: boolean;

    /**
     * Holds the observation log used of the linked observation model.
     * Used by the log components
     */
    private _observationLog: ViewObservationLogModel[] = [];

    /**
     * Holds the validation error message when value flag is invalid. 
     */
    private _validationErrorMessage: string = "";

    /**
     * Determines whether to enforce range threshold checks or not.
     */
    private rangeThreshold: RangeThresholdQCTestParamsModel | undefined;

    constructor(observation: CreateObservationModel, elementMetadata: ViewElementModel, allowMissingValues: boolean , scaleValue: boolean, rangeThreshold: RangeThresholdQCTestParamsModel | undefined) {
        this._observation = observation;
        this.elementMetadata = elementMetadata;
        this.allowMissingValues = allowMissingValues;
        this.scaleValue = scaleValue;
        this.rangeThreshold = rangeThreshold;
        this._valueFlagForDisplay = this.getValueFlagForDisplay(this.observation.value, this.observation.flag);
        this._valueFlagForDisplayDB = this._valueFlagForDisplay;
    }

    public get valueFlagForDisplay(): string {
        return this._valueFlagForDisplay;
    }

    public get valueFlagForDisplayDB(): string {
        return this._valueFlagForDisplayDB;
    }

    public get observation(): CreateObservationModel {
        return this._observation;
    }

    public get observationLog(): ViewObservationLogModel[] {
        return this._observationLog;
    }

    public get validationErrorMessage(): string {
        return this._validationErrorMessage;
    }

    public get observationChangeIsValid(): boolean {
        // Both value and flag should not be null, and there should be no validation error messages
        return !(this.observation.value === null && this.observation.flag === null) && this._validationErrorMessage.length === 0;
    }

    public get observationChanged(): boolean {
        return this._valueFlagForDisplay !== this._valueFlagForDisplayDB;
    }

    public get comment(): string | null {
        return this.observation.comment;
    }

    public updateCommentInput(comment: string): void {
        this.observation.comment = StringUtils.isNullOrEmpty(comment) ? null : comment;
    }

    /**
     * Checks validity of the value flag input and if valid sets it as the new value for observation value and flag.
     * Updates it's internal state depending on the validity of the value flag input
     * @param valueFlagInput  e.g '200', '200E', 'M', ''
     * @param enforceLimitCheck whether to enforce limit check or not
     * @returns empty string if value flag contents are valid, else returns the error message.
     */
    public updateValueFlagFromUserInput(valueFlagInput: string): void {
        // clear previous values first
        this.observation.value = null;
        this.observation.flag = null;
        this._valueFlagForDisplay = valueFlagInput;
        this._validationErrorMessage = "";

        // Validate input format validity. If there is a response then entry is invalid
        this._validationErrorMessage = this.checkInputFormatValidity(valueFlagInput)
        if (!StringUtils.isNullOrEmpty(this._validationErrorMessage)) {
            return;
        }

        // Extract and set the value and flag
        const extractedScaledValFlag = StringUtils.splitNumbersAndTrailingNonNumericCharactersOnly(valueFlagInput);

        // Transform the value to actual scale 
        const value: number | null = extractedScaledValFlag[0] === null ? null : this.getValueBasedOnScaleDefintion(extractedScaledValFlag[0]);

        // Transform the flag letter
        const flagLetter: string | null = extractedScaledValFlag[1] === null ? null : extractedScaledValFlag[1].toUpperCase();

        // If there is a value input then validate
        if (value !== null) {
            this._validationErrorMessage = this.checkValueLimitsValidity(value);
            if (!StringUtils.isNullOrEmpty(this._validationErrorMessage)) {
                return;
            }  
           
        }

        // If there is a flag input then validate
        if (flagLetter !== null) {
            this._validationErrorMessage = this.checkFlagLetterValidity(value, flagLetter);
            if (!StringUtils.isNullOrEmpty(this._validationErrorMessage)) {
                return;
            }
        }

        // Set the value and flag to the observation model 
        this.observation.value = value;
        this.observation.flag = flagLetter ? this.findFlag(flagLetter) : null;
        this._validationErrorMessage = "";
        this._valueFlagForDisplay = this.getValueFlagForDisplay(this.observation.value, this.observation.flag);
    }

    private getValueFlagForDisplay(value: number | null, flag: FlagEnum | null): string {
        const unScaledValue: number | null = this.scaleValue ? this.getUnScaledValue(value) : value;
        const valueStr = unScaledValue === null ? '' : unScaledValue.toString();
        const flagStr = flag === null ? '' : flag[0].toUpperCase();
        return valueStr + flagStr;
    }


    /**
     * Used internally to scale the value from the user input.
     * By default, values are asssumed to be unscaled when input by user, e.g 105 instead of 10.5, that's why this is is false.
     * @param value 
     * @returns 
     */
    private getValueBasedOnScaleDefintion(value: number): number {
        if (!this.scaleValue) {
            return value;
        }

        const element = this.elementMetadata;
        return element.entryScaleFactor ? value / element.entryScaleFactor : value;
    }

    public getUnScaledValue(value: number | null): number | null {
        // To remove rounding errors use number utils round off
        return value && this.elementMetadata.entryScaleFactor ? NumberUtils.roundOff(value * this.elementMetadata.entryScaleFactor, 4) : value;
    }


    /**
     * Validates a value flag input by checking on acceptible input formats
     * @param valueFlagInput 
     * @returns empty string if valid
     */
    private checkInputFormatValidity(valueFlagInput: string): string {
        // Check for emptiness
        if (StringUtils.isNullOrEmpty(valueFlagInput, false)) {
            return this.allowMissingValues ? '' : 'Missing value not allowed';
        }

        // Check for white spaces.
        if (StringUtils.isNullOrEmpty(valueFlagInput, true)) {
            return 'Empty spaces not allowed';
        }

        // Check if it's all string. Applies when its flag M entered.
        if (StringUtils.doesNotContainNumericCharacters(valueFlagInput)) {
            return '';
        }

        // Check for correct input format.
        if (!StringUtils.containsNumbersAndTrailingNonNumericCharactersOnly(valueFlagInput)) {
            return 'Incorrect input format not allowed';
        }

        // Check for any decimals.
        const splitNum: number | null = StringUtils.splitNumbersAndTrailingNonNumericCharactersOnly(valueFlagInput)[0];
        if (splitNum !== null) {
            if (this.scaleValue && String(splitNum).includes('.')) return 'Decimals not allowed';
        }

        return '';
    }

    /**
     * Validates the value against the element limits
     * @param value Unscaled value
     * @returns empty string if value is valid.
     */
    private checkValueLimitsValidity(value: number): string {

         // If no range thresholds given, then return empty, no need for validations
         if(!this.rangeThreshold){
             return '';  
         }

        const element = this.elementMetadata;
        // Get the scale factor to use. An element may not have a scale factor
        const scaleFactor: number = element.entryScaleFactor ? element.entryScaleFactor : 1;

        if (value < this.rangeThreshold.lowerThreshold) {
            return `Value less than lower limit ${this.rangeThreshold.lowerThreshold * scaleFactor}`;
        }

        if (value > this.rangeThreshold.upperThreshold) {
            return `Value higher than upper limit ${this.rangeThreshold.upperThreshold * scaleFactor}`;
        }

        return '';
    }

    /**
     * Validates the flag letter. 
     * @param value 
     * @param flagLetter 
     * @returns empty string if valid
     */
    private checkFlagLetterValidity(value: number | null, flagLetter: string): string {

        if (flagLetter.length > 1) {
            return 'Invalid Flag, single letter expected';
        }

        const flagFound: FlagEnum | null = this.findFlag(flagLetter);
        if (!flagFound) {
            return 'Invalid Flag';
        }

        if (!this.allowMissingValues && flagFound === FlagEnum.MISSING) {
            return 'Missing value not allowed';
        }

        if (value !== null && flagFound === FlagEnum.MISSING) {
            return 'Invalid Flag, M is used for missing value ONLY';
        }

        if (value === null && flagFound !== FlagEnum.MISSING) {
            return 'Invalid Flag, use M flag for missing value';
        }



        return '';
    }


    private findFlag(inputFlag: string): FlagEnum | null {
        return Object.values<FlagEnum>(FlagEnum).find(f => f[0].toLowerCase() === inputFlag[0].toLowerCase()) || null;
    }

    public loadObservationLog(observationService: ObservationsService): void {
        // Note the function is called twice, when drop down is opened and when it's closed
        // So this obsLog truthy check prevents unnecessary reloading

        if (this._observationLog && this._observationLog.length > 0) {
            // No need to reload the log
            return;
        }

        // Create an observation log query dto.
        const query: ViewObservationLogQueryModel = {
            stationId: this.observation.stationId,
            elementId: this.observation.elementId,
            sourceId: this.observation.sourceId,
            elevation: this.observation.elevation,
            datetime: this.observation.datetime,
            period: this.observation.period
        };

        observationService.findObsLog(query).pipe(
            take(1)
        ).subscribe(data => {
            // Transform the log data accordingly
            this._observationLog = data.map(item => {
                // Display the values in scaled form 
                if (this.scaleValue && item.value && this.elementMetadata.entryScaleFactor) {
                    // To remove rounding errors number utils round off
                    item.value = this.getUnScaledValue(item.value);
                }

                // Convert the entry date time to current local time
                item.entryDateTime = DateUtils.getDateInSQLFormatFromDate(new Date(item.entryDateTime), true)
                return item;
            }
            )
        });
    }

}