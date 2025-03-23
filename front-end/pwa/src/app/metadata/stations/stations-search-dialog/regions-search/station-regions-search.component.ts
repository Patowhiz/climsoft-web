import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AppDatabase } from 'src/app/app-database';
import { StationSearchHistoryModel } from '../../models/stations-search-history.model';
import { StationCacheModel, StationsCacheService } from '../../services/stations-cache.service';
import { Subject, take, takeUntil } from 'rxjs';
import { RegionsCacheService } from 'src/app/metadata/regions/services/regions-cache.service';
import { ViewRegionModel } from 'src/app/metadata/regions/models/view-region.model';
import { StringUtils } from 'src/app/shared/utils/string.utils';
import { SelectionOptionTypeEnum } from '../stations-search-dialog.component';

export interface RegionSearchModel {
  region: ViewRegionModel;
  selected: boolean;
  formattedRegionType: string;
}

@Component({
  selector: 'app-station-regions-search',
  templateUrl: './station-regions-search.component.html',
  styleUrls: ['./station-regions-search.component.scss']
})
export class StationRegionSearchComponent implements OnChanges, OnDestroy {

  @Input() public search!: string;
  @Input() public selectionOption!: SelectionOptionTypeEnum;
  @Output() public regionsSelectionChange = new EventEmitter<RegionSearchModel[]>();

  protected regions: RegionSearchModel[] = [];

  private destroy$ = new Subject<void>();

  constructor(private regionsService: RegionsCacheService,) {
    // Get all regions 
    this.regionsService.cachedRegions.pipe(
      takeUntil(this.destroy$),
    ).subscribe((data) => {
      this.regions = data.map(region => {
        return {
          region: region, selected: false, formattedRegionType: StringUtils.formatEnumForDisplay(region.regionType)
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['search'] && this.search) {
      this.onSearchInput(this.search);
    }

    if (changes['selection']) {
      this.onOptionSelected(this.selectionOption);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onSearchInput(searchValue: string): void {
    // Make the searched items be the first items
    this.regions.sort((a, b) => {
      // If search is found, move it before `b`, otherwise after
      if (a.region.id.toString().toLowerCase().includes(searchValue)
        || a.region.name.toLowerCase().includes(searchValue)
        || a.region.regionType.toLowerCase().includes(searchValue)) {
        return -1;
      }
      return 1;
    });
  }

  protected onSelected(stationSelection: RegionSearchModel): void {
    stationSelection.selected = !stationSelection.selected;
    this.regionsSelectionChange.emit(this.regions)
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
    for (const item of this.regions) {
      item.selected = select;
    }
    this.regionsSelectionChange.emit(this.regions);
  }

  private sortBySelected(): void {
    // Sort the array so that items with `selected: true` come first
    this.regions.sort((a, b) => {
      if (a.selected === b.selected) {
        return 0; // If both are the same (either true or false), leave their order unchanged
      }
      return a.selected ? -1 : 1; // If `a.selected` is true, move it before `b`, otherwise after
    });
  }


}
