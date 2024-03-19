import { ElementDomainEnum } from "../enums/element-domain.enum";

export class ViewElementDto {
    id: number;
    name: string;
    abbreviation: string; 
    description: string;
    units: string;
    type: string;
    subdomain: string;
    domain: ElementDomainEnum;
    lowerLimit: number| null;
    upperLimit: number| null;
    entryScaleFactor: number| null;
    comment: string | null; 
}