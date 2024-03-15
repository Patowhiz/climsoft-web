import { SourceTypeEnum } from "../entities/source.entity";

export class ViewSourceDto {
    id: number; 
    name: string; 
    description: string; 
    extraMetadata: string|null; 
    sourceType: SourceTypeEnum | null; 
}