import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";
import { StringUtils } from "src/shared/utils/string.utils";
import { SourceDefinitionValidity } from "./create-update-source.dto";

export type ExtraSelectorControlType = 'ELEMENT' | 'DAY' | 'HOUR';
export type LayoutType = 'LINEAR' | 'GRID';

export class CreateEntryFormDTO implements SourceDefinitionValidity {

  /** Defines the extra entry selectors used by the form to get data */
  // TODO. Do validations
  selectors: [ExtraSelectorControlType, ExtraSelectorControlType?];

  /** Defines the entry fields used by the form to display and enter data */
  // TODO. Do validations
  fields: [ExtraSelectorControlType, ExtraSelectorControlType?];

  /** Layout used by entry fields */
  // TODO. Do validations
  layout: LayoutType;

  /** Elements ids allowed to be recorded by the form */
  @Transform(({ value }) => value ? StringUtils.mapCommaSeparatedStringToNumberArray(value.toString()) : [])
  @IsInt({ each: true })
  elementIds: number[];

  /** Hours allowed to be recorded by the form */
  @Transform(({ value }) => value ? StringUtils.mapCommaSeparatedStringToNumberArray(value.toString()) : [])
  @IsInt({ each: true })
  hours: number[];

  /** Period for observation */
  @IsInt()
  period: number;

  /** 
   * Determines whether to allow entries that don't pass observation limits.
   * If true, when limits are exceeded, data entry will not be allowed.
   */
  @IsBoolean()
  enforceLimitCheck: boolean;

  /**
  * Determines whether user is required to type in observation total or not.
  */
  @IsBoolean()
  requireTotalInput: boolean;

  isValid(): boolean {
    return true;
  }
}