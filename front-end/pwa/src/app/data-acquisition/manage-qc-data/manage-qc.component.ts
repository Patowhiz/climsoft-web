import { Component } from '@angular/core';
import { PagesDataService } from 'src/app/core/services/pages-data.service';

@Component({
  selector: 'app-manage-qc',
  templateUrl: './manage-qc.component.html',
  styleUrls: ['./manage-qc.component.scss']
})
export class ManageQCComponent {

  protected activeTab: 'source' | 'qc' = 'source';

  constructor(private pagesDataService: PagesDataService) {
    this.pagesDataService.setPageHeader('Manage QC');
  }

  protected onTabClick(selectedTab: 'source' | 'qc'): void {
    this.activeTab = selectedTab;
  }

}
