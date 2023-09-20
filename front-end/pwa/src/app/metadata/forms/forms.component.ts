import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Source } from '../../core/models/source.model';
import { DataClicked } from '../../shared/controls/data-list-view/data-list-view.component';
import { SourcesService } from 'src/app/core/services/sources.service';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {

  sources: Source[] = [];

  constructor(private sourceService: SourcesService, private router: Router, private route: ActivatedRoute) {
    this.loadSources();
  }

  ngOnInit(): void {
  }

  private loadSources() {
    //get data sources of source type forms
    this.sourceService.getSources(1).subscribe((data) => {
      this.sources = data;
    });
  }

  onFormClicked(dataClicked: { [key: string]: any }): void {
    this.router.navigate(['form-builder', dataClicked['id']], { relativeTo: this.route.parent });
  }

  onNewForm() {
    this.router.navigate(['form-builder'], { relativeTo: this.route.parent });
  }


}
