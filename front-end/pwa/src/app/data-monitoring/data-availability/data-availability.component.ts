import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ViewObservationQueryModel } from 'src/app/data-ingestion/models/view-observation-query.model';
import { PagesDataService, ToastEventTypeEnum } from 'src/app/core/services/pages-data.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ViewSourceModel } from 'src/app/metadata/source-templates/models/view-source.model';
import { IntervalsUtil } from 'src/app/shared/controls/period-input/Intervals.util';
import { SourceTemplatesCacheService } from 'src/app/metadata/source-templates/services/source-templates-cache.service';
import { ElementCacheModel, ElementsCacheService } from 'src/app/metadata/elements/services/elements-cache.service';
import { GeneralSettingsService } from 'src/app/admin/general-settings/services/general-settings.service';
import { ClimsoftDisplayTimeZoneModel } from 'src/app/admin/general-settings/models/settings/climsoft-display-timezone.model';
import { StationCacheModel, StationsCacheService } from 'src/app/metadata/stations/services/stations-cache.service';
import { DateUtils } from 'src/app/shared/utils/date.utils'; 

import * as echarts from 'echarts'; 
import { CreateObservationModel } from 'src/app/data-ingestion/models/create-observation.model';
import { ObservationsService } from 'src/app/data-ingestion/services/observations.service';
import { SettingIdEnum } from 'src/app/admin/general-settings/models/setting-id.enum';
import { DataAvailabilityQueryModel } from './models/data-availability-query.model';

interface Observation {
  obsDef: CreateObservationModel;
  stationName: string;
  elementAbbrv: string;
  sourceName: string;
  formattedDatetime: string;
  intervalName: string;
}

@Component({
  selector: 'app-data-availability',
  templateUrl: './data-availability.component.html',
  styleUrls: ['./data-availability.component.scss']
})
export class DataAvailabilityComponent implements AfterViewInit, OnDestroy {
  private stationsMetadata: StationCacheModel[] = [];
  private elementsMetadata: ElementCacheModel[] = [];
  private sourcesMetadata: ViewSourceModel[] = [];

  protected enableQueryButton: boolean = true;
  private utcOffset: number = 0;

  private chartInstance!: echarts.ECharts;

  private destroy$ = new Subject<void>();

  constructor(
    private pagesDataService: PagesDataService,
    private stationsCacheService: StationsCacheService,
    private elementService: ElementsCacheService,
    private sourcesService: SourceTemplatesCacheService,
    private observationService: ObservationsService,
    private generalSettingsService: GeneralSettingsService,
  ) {
    this.pagesDataService.setPageHeader('Data Availability');

    this.stationsCacheService.cachedStations.pipe(
      takeUntil(this.destroy$),
    ).subscribe(data => {
      this.stationsMetadata = data;
    });

    this.elementService.cachedElements.pipe(
      takeUntil(this.destroy$),
    ).subscribe(data => {
      this.elementsMetadata = data;
    });

    this.sourcesService.cachedSources.pipe(
      takeUntil(this.destroy$),
    ).subscribe(data => {
      this.sourcesMetadata = data;
    });

    // Get the climsoft time zone display setting
    this.generalSettingsService.findOne(SettingIdEnum.DISPLAY_TIME_ZONE).pipe(
      takeUntil(this.destroy$),
    ).subscribe((data) => {
      this.utcOffset = (data.parameters as ClimsoftDisplayTimeZoneModel).utcOffset;
    });
  }

  ngAfterViewInit(): void {
    this.chartInstance = echarts.init(document.getElementById('dataFlowMonitoringChart')!);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  protected onQueryClick(observationFilter: DataAvailabilityQueryModel): void {

    if(1===1){
      return;
    }
  

    this.enableQueryButton = false;
 
    this.observationService.findProcessed(observationFilter).pipe(
      take(1)
    ).subscribe({
      next: data => {

        const observationViews: Observation[] = data.map(observation => {

          const stationMetadata = this.stationsMetadata.find(item => item.id === observation.stationId);
          if (!stationMetadata) {
            throw new Error("Developer error: Station not found.");
          }

          const elementMetadata = this.elementsMetadata.find(item => item.id === observation.elementId);
          if (!elementMetadata) {
            throw new Error("Developer error: Element not found.");
          }

          const sourceMetadata = this.sourcesMetadata.find(item => item.id === observation.sourceId);
          if (!sourceMetadata) {
            throw new Error("Developer error: Source not found.");
          }

          const obsView: Observation = {
            obsDef: observation,
            stationName: stationMetadata.name,
            elementAbbrv: elementMetadata.name,
            sourceName: sourceMetadata.name,
            formattedDatetime: DateUtils.getPresentableDatetime(observation.datetime, this.utcOffset),
            intervalName: IntervalsUtil.getIntervalName(observation.interval)
          }
          return obsView;

        });

        this.generateChart(observationViews);
      },
      error: err => {
        this.pagesDataService.showToast({ title: 'Data Flow', message: err, type: ToastEventTypeEnum.ERROR });
        this.enableQueryButton = true;
      },
      complete: () => {
        this.enableQueryButton = true;
      }
    });
  }

  private generateChart(observations: Observation[]) {
    if (observations.length == 0) {
      this.pagesDataService.showToast({ title: 'Data Flow', message: 'No data', type: ToastEventTypeEnum.INFO });
      this.chartInstance.setOption({});
      return;
    };

    const intervalMinutes = observations[0].obsDef.interval;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Step 1: Group observations by station
    const stationGroups = new Map<string, Observation[]>();
    for (const obs of observations) {
      if (!stationGroups.has(obs.obsDef.stationId)) {
        stationGroups.set(obs.obsDef.stationId, []);
      }
      stationGroups.get(obs.obsDef.stationId)!.push(obs);
    }

    // Step 2: Get global time range
    const allTimestamps = observations.map(o => new Date(o.obsDef.datetime).getTime());
    const start = Math.min(...allTimestamps);
    const end = Math.max(...allTimestamps);

    // Step 3: Create full timeline
    const timeline: number[] = [];
    for (let t = start; t <= end; t += intervalMs) {
      timeline.push(t);
    }

    // Step 4: Prepare series data for each station
    const series = Array.from(stationGroups.entries()).map(([stationId, records]) => {
      const name = `${stationId} - ${records[0].stationName}`;

      const valueMap = new Map<number, number | null>();
      for (const r of records) {
        valueMap.set(new Date(r.obsDef.datetime).getTime(), r.obsDef.value);
      }

      const data: [number, number | null][] = timeline.map(t => [t, valueMap.get(t) ?? null]);

      return {
        name: name,
        type: 'line',
        data: data,
        connectNulls: false,
        showSymbol: false,
        smooth: false,
        lineStyle: { width: 2 }
      };
    });


    // Step 5: Set up chart
    const chartOptions = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const lines = params.map((p: any) => {
            const value = p.data[1] !== null ? p.data[1] : '<i>Missing</i>';
            return `${p.marker} ${p.seriesName}: ${value}`;
          });
          const formattedDatetime = DateUtils.getPresentableDatetime(new Date(params[0].data[0]).toISOString(), this.utcOffset);
          return `${formattedDatetime}<br/>${lines.join('<br/>')}`;
        }
      },
      legend: {
        type: 'scroll',
        top: 10,
        //orient: 'vertical',
      },
      xAxis: {
        type: 'time',
        name: 'Datetime',
        nameLocation: 'middle',
        nameGap: 25
      },
      yAxis: {
        type: 'value',
        name: 'Value',
        nameLocation: 'middle',
        nameGap: 35
      },
      //dataZoom: [], 
      series: series,
      grid: {
        left: '5%',
        right: '8%',
        bottom: '15%'
      }
    };

    this.chartInstance.setOption(chartOptions);

  }




}
