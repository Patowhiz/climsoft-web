export interface DataAvailabilityQueryModel {
    stationIds: string[];
    elementId: number;
    interval: number;  
    durationType: 'days_of_month' | 'months_of_year' | 'years' ;
    durationDaysOfMonth: string;
    durationMonthsOfYear: number;
    durationYears: number[];
}