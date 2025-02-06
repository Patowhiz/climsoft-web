import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { ViewGeneralSettingsComponent } from './general-settings/view-general-settings/view-general-settings.component';
import { EditGeneralSettingComponent } from './general-settings/edit-general-setting/edit-general-setting.component';
import { ClimsoftBoundaryComponent } from './general-settings/edit-general-setting/climsoft-boundary/climsoft-boundary.component';
import { MetadataModule } from '../metadata/metadata.module';
import { ClimsoftDisplayTimezoneComponent } from './general-settings/edit-general-setting/climsoft-display-timezone/climsoft-display-timezone.component';
import { ClimsoftV4Component } from './climsoft-v4/climsoft-v4.component';
import { ViewUsersComponent } from './users/view-users/view-users.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';
import { UserRoleSingleInputComponent } from './users/user-role-single-input/user-role-single-input.component';
import { PasswordChangeComponent } from './users/password-change/password-change.component';

@NgModule({
  declarations: [
    ViewGeneralSettingsComponent,
    EditGeneralSettingComponent,
    ClimsoftBoundaryComponent, 
    ClimsoftDisplayTimezoneComponent,
    ClimsoftV4Component,
    ViewUsersComponent,
    UserDetailsComponent,
    UserRoleSingleInputComponent,
    PasswordChangeComponent,
  ],
  imports: [
    SharedModule,
    MetadataModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
