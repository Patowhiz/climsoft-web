import { CreateUpdateSourceModel, SourceDefinitionValidity } from "./create-update-source.model";

export type ExtraSelectorControlType = 'ELEMENT' | 'DAY' | 'HOUR';
export type FieldType = 'ELEMENT' | 'DAY' | 'HOUR';
export type LayoutType = 'LINEAR' | 'GRID';

export interface CreateEntryFormModel extends SourceDefinitionValidity {
    /** Defines the extra entry selectors used by the form to get data */
    selectors: [ExtraSelectorControlType, ExtraSelectorControlType?];

    /** Defines the entry fields used by the form to display and enter data */
    fields: [FieldType, FieldType?];

    /** Layout used by entry fields */
    layout: LayoutType;

    /** Elements ids allowed to be recorded by the form */
    elementIds: number[];

    /** Hours allowed to be recorded by the form */
    hours: number[];

    /** Period for observation */
    period: number;


    /**
     * Determines whether to allow entries that don't pass observation limits.
     * If true, when limits are exceeded, data entry will not be allowed.
     * Note, this is only enforced on the front end.
     */
    enforceLimitCheck: boolean;

    /**
     * Determines whether user is required to type in observation total or not.
     * Note, this is only enforced on the front end.
     */
    requireTotalInput: boolean;
}