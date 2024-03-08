import { Component, OnDestroy, OnInit } from '@angular/core';
import { ViewPortSize, ViewportService } from 'src/app/core/services/viewport.service';
import { PagesDataService, ToastEvent } from '../services/pages-data.service';
import { Subscription, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserRole } from '../models/enums/user-roles.enum';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  //holds the features navigation items
  protected featuresNavItems: any[] = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'bi bi-sliders',
      open: false,
      children: []
    },
    {
      name: 'Data Entry',
      url: '/dataentry',
      icon: 'bi bi-file-earmark-text',
      open: false,
      children: [
        {
          name: 'Forms',
          url: '/station-form-selection',
          featureTitle: 'Data Entry'
        },
        {
          name: 'Import',
          url: '/import-entry',
          featureTitle: 'Import Data'
        },
        {
          name: 'View Entries',
          url: '/view-entry',
          featureTitle: 'View Entries'
        }
      ]
    },

    {
      name: 'Metadata',
      url: '/metadata',
      icon: 'bi bi-chat-dots',
      open: false,
      children: [        
        {
          name: 'Elements',
          url: '/elements',
          featureTitle: 'Elements'
        },
        {
          name: 'Forms',
          url: '/forms',
          featureTitle: 'Entry Forms'
        },
        {
          name: 'Stations',
          url: '/stations',
          featureTitle: 'Stations'
        }
      ]
    },
    {
      name: 'Users',
      url: '/user',
      icon: 'bi bi-people',
      open: false,
      children: []
    }


  ];

  protected bOpenSideNav: boolean = false;
  protected pageHeaderName: string = '';
  protected toasts: ToastEvent[] = [];
  protected userSub!: Subscription;
  protected displayUserDropDown: boolean = false;

  constructor(private viewPortService: ViewportService,
    private authService: AuthService,
    private pagesDataService: PagesDataService, private router: Router) {

    this.viewPortService.viewPortSize.subscribe((viewPortSize) => {
      this.bOpenSideNav = viewPortSize === ViewPortSize.Large;
    });

    this.pagesDataService.pageHeader.subscribe(name => {
      this.pageHeaderName = name;
    });

    this.pagesDataService.toastEvents.subscribe(toast => {
      this.showToast(toast);
    });

  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.setAllowedNavigationLinks(user.roleId);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  protected logOut(): void {
    this.authService.logout().pipe(take(1)).subscribe(data => {
      this.authService.removeUser();
      //TODO. test why this doesn't work here but works in app component. Has something to do with the route .
      //should go to app component route
      //this.router.navigate(['../../login']);
    });
  }

  private showToast(currentToast: ToastEvent) {

    this.toasts.push(currentToast);

    // automatically hide the toast after 3 seconds
    setTimeout(() => {
      if (this.toasts.length > 0) {
        //remove the first
        this.toasts.splice(0, 1);
      }
    }, 3000);

  }

  private setAllowedNavigationLinks(roleId: number): void {
    // TODO. Change this implementation after changing the structure of the array
    if (roleId !== UserRole.Administrator) {
      this.featuresNavItems.splice(3, 1);
    }

  }


}
