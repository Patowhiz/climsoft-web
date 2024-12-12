import { Component, OnDestroy, OnInit } from '@angular/core';
import { ViewPortSize, ViewportService } from 'src/app/core/services/view-port.service';
import { PagesDataService, ToastEvent } from '../services/pages-data.service';
import { Subscription, take } from 'rxjs';
import { AppAuthService } from '../../app-auth.service';
import { UserRoleEnum } from '../models/users/user-role.enum';

type mainMenus = 'Dashboard' | 'Data Entry' | 'Metadata' | 'Users' | 'Settings';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {


  //holds the features navigation items
  protected featuresNavItems: { name: mainMenus, url: string, icon: string, open: boolean, children: { name: string, url: string, featureTitle: string }[] }[] = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'bi bi-sliders',
      open: false,
      children: []
    },
    {
      name: 'Data Entry',
      url: '/data-entry',
      icon: 'bi bi-file-earmark-text',
      open: false,
      children: [
        {
          name: 'Forms',
          url: '/station-form-selection',
          featureTitle: 'Form Data Entry'
        },
        {
          name: 'Import',
          url: '/import-selection',
          featureTitle: 'Import Data Entry'
        },
        {
          name: 'Manage Data',
          url: '/manage-data',
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
          name: 'Stations',
          url: '/stations',
          featureTitle: 'Stations'
        },
        {
          name: 'Regions',
          url: '/view-regions',
          featureTitle: 'Regions'
        },
        {
          name: 'Sources',
          url: '/sources',
          featureTitle: 'Sources'
        },
      ]
    },
    {
      name: 'Users',
      url: '/users',
      icon: 'bi bi-people',
      open: false,
      children: []
    },
    {
      name: 'Settings',
      url: '/settings',
      icon: 'bi bi-people',
      open: false,
      children: [
        {
          name: 'General',
          url: '/view-general-settings',
          featureTitle: 'General'
        },
      ]
    }


  ];

  protected bOpenSideNav: boolean = false;
  protected pageHeaderName: string = '';
  protected toasts: ToastEvent[] = [];
  protected userSub!: Subscription;
  protected displayUserDropDown: boolean = false;

  constructor(private viewPortService: ViewportService,
    private authService: AppAuthService,
    private pagesDataService: PagesDataService) {
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.setAllowedNavigationLinks(user.role);
      }
    });

    this.viewPortService.viewPortSize.subscribe((viewPortSize) => {
      this.bOpenSideNav = viewPortSize === ViewPortSize.LARGE;
    });

    this.pagesDataService.pageHeader.subscribe(name => {
      // To prevent `ExpressionChangedAfterItHasBeenCheckedError` raised in dvelopment mode 
      // where a child component changes a parent component’s data during a lifecycle hook like `ngOnInit` or ``ngAfterViewInit`
      // Wrap the changes in time out function
      setTimeout(() => {
        this.pageHeaderName = name;
      }, 0);


    });

    this.pagesDataService.toastEvents.subscribe(toast => {
      this.showToast(toast);
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

  private setAllowedNavigationLinks(role: UserRoleEnum): void {
    // Change the navigation links accessible if user not admin
    if (role !== UserRoleEnum.ADMINISTRATOR) {
      const adminModules: mainMenus[] = ['Metadata', 'Users', 'Settings'];
      this.featuresNavItems = this.featuresNavItems.filter(item => !adminModules.includes(item.name));
    }
  }


}
