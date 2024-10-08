
import { ViewElementDto } from "src/metadata/elements/dtos/elements/view-element.dto";
import { CreateEntryFormDTO } from "./create-entry-form.dto";

export class ViewEntryFormDTO extends CreateEntryFormDTO {
    elementsMetadata: ViewElementDto[];
}