import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppDatabase } from 'src/app/app-database';
import { StationSearchHistoryModel } from '../models/stations-search-history.model';
import { StationCacheModel, StationsCacheService } from '../services/stations-cache.service';
import { take } from 'rxjs';

interface StationSearchModel {
  station: StationCacheModel;
  selected: boolean;
}

@Component({
  selector: 'app-stations-search-dialog',
  templateUrl: './stations-search-dialog.component.html',
  styleUrls: ['./stations-search-dialog.component.scss']
})
export class StationsSearchDialogComponent {

  @Output()
  public searchedIdsChange = new EventEmitter<string[]>();

  protected open: boolean = false;
  protected activeTab: 'new' | 'history' = 'history';
  protected previousSearches!: StationSearchHistoryModel[];
  protected stationsSelections!: StationSearchModel[];

  protected searchName: string = '';
  protected saveSearch: boolean = false;
  protected numOfSelectedIds: number = 0;

  constructor(private stationsCacheService: StationsCacheService) {
  }

  public showDialog(selectedIds?: string[]): void {
    this.open = true;
    if (selectedIds && selectedIds.length > 0) {
      this.setStationSelections(selectedIds);
      this.activeTab = 'new';
    } else {
      this.loadSearchHistory();
    }
  }

  private async loadSearchHistory(): Promise<void> {
    this.previousSearches = await AppDatabase.instance.stationsSearchHistory.toArray();
  }

  protected onTabChange(selectedTab: 'new' | 'history'): void {
    this.searchName = '';
    this.saveSearch = false;
    if (selectedTab === 'new') {
      this.setStationSelections([]);
    }

    this.activeTab = selectedTab;
  }

  protected onPreviousSearchSelected(selectedSearch: StationSearchHistoryModel): void {
    this.searchName = selectedSearch.name;
    this.setStationSelections(selectedSearch.stationIds);
  }

  protected onEditPreviousSearch(selectedSearch: StationSearchHistoryModel): void {
    this.searchName = selectedSearch.name;
    this.saveSearch = selectedSearch.name ? true : false;

    this.setStationSelections(selectedSearch.stationIds);
    this.sortStationSelectionBySelected();
    this.activeTab = 'new';
  }

  protected async onDeletePreviousSearch(selectedSearch: StationSearchHistoryModel): Promise<void> {
    await AppDatabase.instance.stationsSearchHistory.delete(selectedSearch.name);
    this.loadSearchHistory();
  }



  protected onSearchInput(searchValue: string): void {
    // Make the searched items be the first items
    this.stationsSelections.sort((a, b) => {
      // If search is found, move it before `b`, otherwise after
      if (a.station.id.toLowerCase().includes(searchValue)
        || a.station.name.toLowerCase().includes(searchValue)
        || a.station.wmoId.toLowerCase().includes(searchValue)
        || a.station.wigosId.toLowerCase().includes(searchValue)
        || a.station.icaoId.toLowerCase().includes(searchValue)) {
        return -1;
      }
      return 1;
    });
  }

  protected onOptionClick(options: 'Filter' | 'Select All' | 'Deselect All' | 'Sort Selected'): void {
    switch (options) {
      case 'Filter':
        // TODO
        break;
      case 'Select All':
        this.selectAll(true);
        break;
      case 'Deselect All':
        this.selectAll(false);
        break;
      case 'Sort Selected':
        this.sortStationSelectionBySelected();
        break;
      default:
        break;
    }

  }

  protected onStationSelected(stationSelection: StationSearchModel): void {
    stationSelection.selected = !stationSelection.selected;
  }

  private selectAll(select: boolean): void {
    for (const item of this.stationsSelections) {
      item.selected = select;
    }
  }

  protected onSearchNameInput(searchName: string): void {
    this.searchName = searchName;
  }

  protected onOkClick(): void {
    const searchedIds: string[] = this.stationsSelections.filter(item => item.selected).map(item => item.station.id);
    if (this.searchName && searchedIds.length > 0) {
      AppDatabase.instance.stationsSearchHistory.put({ name: this.searchName, stationIds: searchedIds });
    }
    this.searchedIdsChange.emit(searchedIds);
  }

  private setStationSelections(searchedIds: string[]): void {
    this.stationsCacheService.cachedStations.pipe(take(1)).subscribe(stations => {
      this.stationsSelections = stations.map(station => {
        return {
          station: station,
          selected: searchedIds.includes(station.id),
        };
      });
      // Set number of selected ids
      this.numOfSelectedIds = this.stationsSelections.filter(item => item.selected).length;
    });
  }

  private sortStationSelectionBySelected(): void {
    // Sort the array so that items with `selected: true` come first
    this.stationsSelections.sort((a, b) => {
      if (a.selected === b.selected) {
        return 0; // If both are the same (either true or false), leave their order unchanged
      }
      return a.selected ? -1 : 1; // If `a.selected` is true, move it before `b`, otherwise after
    });
  }

}
