import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { StationCacheModel, StationsCacheService } from '../../services/stations-cache.service';
import { Subject, takeUntil } from 'rxjs';
import { SelectionOptionTypeEnum } from '../stations-search-dialog.component'; 
import { ViewStationObsEnvModel } from '../../models/view-station-obs-env.model';

interface SearchModel {
  environment: ViewStationObsEnvModel;
  selected: boolean;
}

@Component({
  selector: 'app-station-environments-search',
  templateUrl: './station-environments-search.component.html',
  styleUrls: ['./station-environments-search.component.scss']
})
export class StationEnvironmentsSearchComponent implements OnChanges, OnDestroy {
  @Input() public searchValue!: string;
  @Input() public selectionOption!: SelectionOptionTypeEnum;
  @Output() public searchedIdsChange = new EventEmitter<string[]>();

  protected environments: SearchModel[] = [];
  protected stations: StationCacheModel[] = [];

  private destroy$ = new Subject<void>();

  constructor( 
    private stationsCacheService: StationsCacheService
  ) {

    this.stationsCacheService.cachedStations.pipe(
      takeUntil(this.destroy$),
    ).subscribe(stations => {
      this.loadFocus();
      this.stations = stations
    });
  }

  private async loadFocus() {
    this.environments = (await this.stationsCacheService.getStationObsEnv()).map(environment => {
      return {
        environment: environment, selected: false
      }
    });;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchValue'] && this.searchValue) {
      this.onSearchInput(this.searchValue);
    }

    if (changes['selectionOption']) {
      this.onOptionSelected(this.selectionOption);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onSearchInput(searchValue: string): void {
    // Make the searched items be the first items
    this.environments.sort((a, b) => {
      // If search is found, move it before `b`, otherwise after
      if (a.environment.name.toLowerCase().includes(searchValue)) {
        return -1;
      }
      return 1;
    });

  }

  protected onSelected(selection: SearchModel): void {
    selection.selected = !selection.selected;
    this.emitSearchedStationIds();
  }

  private onOptionSelected(option: SelectionOptionTypeEnum): void {
    switch (option) {
      case SelectionOptionTypeEnum.SELECT_ALL:
        this.selectAll(true);
        break;
      case SelectionOptionTypeEnum.DESLECT_ALL:
        this.selectAll(false);
        break;
      case SelectionOptionTypeEnum.SORT_SELECTED:
        this.sortBySelected();
        break;
      default:
        break;
    }
  }

  private selectAll(select: boolean): void {
    for (const item of this.environments) {
      item.selected = select;
    }
    this.emitSearchedStationIds();
  }

  private sortBySelected(): void {
    // Sort the array so that items with `selected: true` come first
    this.environments.sort((a, b) => {
      if (a.selected === b.selected) {
        return 0; // If both are the same (either true or false), leave their order unchanged
      }
      return a.selected ? -1 : 1; // If `a.selected` is true, move it before `b`, otherwise after
    });
  }

  private emitSearchedStationIds() {
    // TODO. a hack around due to event after view errors: Investigate later.
    setTimeout(() => {
      const searchedStationIds: string[] = [];
      const selectedEnvironments = this.environments.filter(item => item.selected);
      for (const selectedEnvironment of selectedEnvironments) {
        for (const station of this.stations) {
          if (station.stationObsEnvironmentId === selectedEnvironment.environment.id) {
            searchedStationIds.push(station.id);
          }
        }
      }
      this.searchedIdsChange.emit(searchedStationIds);
    }, 0);
  }

}
