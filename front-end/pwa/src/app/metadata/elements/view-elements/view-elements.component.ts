import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { CreateViewElementModel } from 'src/app/metadata/elements/models/create-view-element.model';
import { PagesDataService, ToastEventTypeEnum } from 'src/app/core/services/pages-data.service';
import { ElementsCacheService } from '../services/elements-cache.service';

@Component({
  selector: 'app-view-elements',
  templateUrl: './view-elements.component.html',
  styleUrls: ['./view-elements.component.scss']
})
export class ViewElementsComponent implements OnDestroy {

  private allElements!: CreateViewElementModel[];
  protected elements!: CreateViewElementModel[];
  private searchedIds!: number[];

  private destroy$ = new Subject<void>();

  protected optionClicked: 'Add' | 'Import' | 'Download' | 'Delete All' | undefined;

  constructor(
    private pagesDataService: PagesDataService,
    private elementsCacheService: ElementsCacheService,
    private router: Router,
    private route: ActivatedRoute) {

    this.pagesDataService.setPageHeader('Elements');

    this.elementsCacheService.cachedElements.pipe(
      takeUntil(this.destroy$),
    ).subscribe(items => {
      this.allElements = items;
      this.filterBasedOnSearchedIds(); 
    });

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSearchInput(searchedIds: number[]): void {
    this.searchedIds = searchedIds;
    this.filterBasedOnSearchedIds();
  }

  private filterBasedOnSearchedIds(): void {
    this.elements = this.searchedIds && this.searchedIds.length > 0 ? this.allElements.filter(item => this.searchedIds.includes(item.id)) : this.allElements;
  }

  protected onOptionsClicked(option: 'Add' | 'Import' | 'Download' | 'Delete All'): void {
    this.optionClicked = option;
    if(option === 'Delete All'){
      this.elementsCacheService.deleteAll().pipe(take(1)).subscribe(data => {
        if (data) {
          this.pagesDataService.showToast({ title: "Elements Deleted", message: `All elements deleted`, type: ToastEventTypeEnum.SUCCESS});
        }
      });
    }
  }

  protected onOptionsDialogClosed(): void {
    this.optionClicked = undefined;
  }

  protected onEditElement(element: CreateViewElementModel): void {
    this.router.navigate(['element-detail', element.id], { relativeTo: this.route.parent });
  }

  protected get downloadLink(): string {
    return this.elementsCacheService.downloadLink;
  } 

}
