import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppDatabase } from 'src/app/app-database';
import { ViewStationQueryModel } from 'src/app/core/models/stations/view-station-query.model';

@Component({
  selector: 'app-stations-search-dialog',
  templateUrl: './stations-search-dialog.component.html',
  styleUrls: ['./stations-search-dialog.component.scss']
})
export class StationsSearchDialogComponent {

  @Output()
  public searchedIdsChange = new EventEmitter<string[]>();

  private searchedIds!: string[];

  protected open: boolean = false;
  protected activeTab: 'new' | 'history' = 'history';
  protected searchName: string = '';

  public openDialog(): void {
    this.searchedIds = [];
    this.open = true;
  }

  protected onTabClick(selectedTab: 'new' | 'history'): void {
    this.activeTab = selectedTab;
  }

  protected onIdsSelected(searchedIds: string[]): void {
    this.searchedIds = searchedIds;
  }

  protected onSearchNameInput(searchName: string) {
    this.searchName = searchName;
  }

  protected onOkClick(): void {
    if (this.searchedIds.length > 0 && this.searchName) {
      AppDatabase.instance.stationsSearchHistory.put({ name: this.searchName, stationIds: this.searchedIds });
    }

    this.searchedIdsChange.emit(this.searchedIds);
  }

}
