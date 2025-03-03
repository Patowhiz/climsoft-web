import { Component } from '@angular/core'; 
import { take } from 'rxjs'; 
import { ObservationDefinition } from '../../form-entry/defintions/observation.definition';
import { ElementCacheModel, ElementsCacheService } from 'src/app/metadata/elements/services/elements-cache.service';
import { ViewSourceModel } from 'src/app/metadata/sources/models/view-source.model';
import { PagingParameters } from 'src/app/shared/controls/page-input/paging-parameters';
import { Period, PeriodsUtil } from 'src/app/shared/controls/period-input/period-single-input/Periods.util';
import { ViewObservationQueryModel } from 'src/app/core/models/observations/view-observation-query.model';
import { PagesDataService } from 'src/app/core/services/pages-data.service';
import { SourceTemplatesCacheService } from 'src/app/metadata/sources/services/source-templates-cache.service';

interface ObservationEntry {
  obsDef: ObservationDefinition;
  delete: boolean;
  newStationId: string;
  newElementId: number;
}

@Component({
  selector: 'app-qc-data',
  templateUrl: './qc-data.component.html',
  styleUrls: ['./qc-data.component.scss']
})
export class QCDataComponent {

  protected stationId: string | null = null;
  protected sourceId: number | null = null;
  protected elementId: number | null = null;
  protected period: number | null = null;
  protected elevation: number | null = null;
  protected fromDate: string | null = null;
  protected toDate: string | null = null;
  protected hour: number | null = null;
  protected useEntryDate: boolean = false;
  protected observationsEntries: ObservationEntry[] = [];
  private elementsMetadata: ElementCacheModel[] = [];
  private sourcessMetadata: ViewSourceModel[] = [];
  private periods: Period[] = PeriodsUtil.possiblePeriods;
  protected pageInputDefinition: PagingParameters = new PagingParameters();
  private observationFilter!: ViewObservationQueryModel;
  protected enableSave: boolean = false;
  protected numOfChanges: number = 0;

  constructor(
    private pagesDataService: PagesDataService,
    private elementService: ElementsCacheService,
    private sourcesService: SourceTemplatesCacheService, 
  ) {

    this.elementService.cachedElements.pipe(take(1)).subscribe(data => {
      this.elementsMetadata = data;
    });

    this.sourcesService.cachedSources.pipe(take(1)).subscribe(data => {
      this.sourcessMetadata = data;
    });
  }


  protected onViewClick(): void {
    
  }

}
