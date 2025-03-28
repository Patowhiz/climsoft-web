import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { PagesDataService, ToastEventTypeEnum } from 'src/app/core/services/pages-data.service'; 
import { ExportTemplatesService } from '../services/export-templates.service';
import { ViewExportTemplateModel } from '../models/view-export-template.model';

@Component({
  selector: 'app-view-export-templates',
  templateUrl: './view-export-templates.component.html',
  styleUrls: ['./view-export-templates.component.scss']
})
export class ViewExportTemplatesComponent  {
  protected exports!: ViewExportTemplateModel[];

  constructor(
    private pagesDataService: PagesDataService,
    private exportsService: ExportTemplatesService,
    private router: Router,
    private route: ActivatedRoute) {
    this.pagesDataService.setPageHeader('Export Templates');

    this.exportsService.findAll().pipe(
     take(1),
    ).subscribe((data) => {
      this.exports = data ;
    });

  }

  protected onOptionsClicked(option: 'Add' |'Delete All') {
    switch (option) {
      case 'Add':        
        this.router.navigate(['export-detail', 'new'], { relativeTo: this.route.parent });
        break; 
      case 'Delete All':
        this.exportsService.deleteAll().pipe(
          take(1)
        ).subscribe(data => {
          this.pagesDataService.showToast({ title: "Exports Deleted", message: `All Exports deleted`, type: ToastEventTypeEnum.SUCCESS });
        });
        break;
      default:
        throw new Error('Developer error, option not supported');
    }
  }

  protected onEditExport(exportId: number): void {
    this.router.navigate(['export-detail', exportId], { relativeTo: this.route.parent });
  }

}
