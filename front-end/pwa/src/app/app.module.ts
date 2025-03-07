//------------modules------------------------------
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { HTTP_INTERCEPTORS } from '@angular/common/http';

//--------------------------------------------
import { SharedModule } from './shared/shared.module';
import { MetadataModule } from './metadata/metadata.module';
//--------------------------------------------

//------------components------------------------------ 
import { HomeComponent } from './core/home/home.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { LoginComponent } from './core/login/login.component';  
import { PasswordResetComponent } from './core/password-reset/password-reset.component';
import { AccountVerificationComponent } from './core/account-verification/account-verification.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { AdminModule } from './admin/admin.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppAuthInterceptor } from './app-auth.interceptor';
import { DataExtractionModule } from './data-extraction/data-extraction.module';
import { DataAcquisitionModule } from './data-acquisition/data-ingestion.module';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    LoginComponent,
    PasswordResetComponent,
    AccountVerificationComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,   
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    MetadataModule,
    DataAcquisitionModule,
    DataExtractionModule,
    AdminModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppAuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
