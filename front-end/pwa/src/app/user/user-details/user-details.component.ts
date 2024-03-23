import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CreateUserModel } from 'src/app/core/models/create-user.model';
import { ViewElementModel } from 'src/app/core/models/view-element.model';
import { UserRoleEnum } from 'src/app/core/models/enums/user-role.enum';
import { PagesDataService } from 'src/app/core/services/pages-data.service';
import { UsersService } from 'src/app/core/services/users.service';
import { StringUtils } from 'src/app/shared/utils/string.utils';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  private userId: number | null = null;
  protected user!: CreateUserModel;
  protected bEnableSave: boolean = true;//todo. should be false by default

  constructor(
    private pagesDataService: PagesDataService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private location: Location,
  ) {
    this.pagesDataService.setPageHeader('User Detail');
  }

  ngOnInit() {

    const userId = this.route.snapshot.params['id'];
    //console.log("element id", elementId)
    if (StringUtils.containsNumbersOnly(userId)) {
      this.userId = +userId;
      this.usersService.getUser(userId).subscribe((data) => {
        this.user = data;
      });
    } else {
      this.user = { name: "", email: "", phone: "", role: UserRoleEnum.ADMINISTRATOR, authorisedStationIds: null, extraMetadata: null, disabled: false };
    }

  }

  protected get userRoleIsNotAdmin(){
    return this. user.role!== UserRoleEnum.ADMINISTRATOR
  }

  protected onRoleSelection(role: UserRoleEnum | null): void {
    if (role) {
      this.user.role = role;
    }

  }

  protected onStationsSelection(stationIds: string[]): void {
    this.user.authorisedStationIds = stationIds.length > 0 ? stationIds : null;
  }

  protected onSaveClick(): void {
    // TODO. do validations


    if (this.userId) {

      this.usersService.update(this.userId, this.user).subscribe((data) => {
        if (data) {
          this.pagesDataService.showToast({
            title: 'User Details', message: `${data.name} updated`, type: 'success'
          });

          this.location.back();
        }

      });

    } else {

      this.usersService.create(this.user).subscribe((data) => {
        if (data) {
          this.pagesDataService.showToast({
            title: 'User Details', message: `${data.name} saved`, type: 'success'
          });

          this.location.back();
        }

      });
    }

  }

  protected onCancelClick(): void {
    this.location.back();
  }
}
