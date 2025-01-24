import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { AppConfigService } from 'src/app/app-config.service';
import { ViewUserModel } from 'src/app/admin/users/models/view-user.model';
import { CreateUserModel } from 'src/app/admin/users/models/create-user.model';
import { ChangePasswordModel } from 'src/app/admin/users/models/change-password.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private endPointUrl: string  ;

  constructor(private appConfigService: AppConfigService, private http: HttpClient) {
    this.endPointUrl = `${this.appConfigService.apiBaseUrl}/users`;
  }

  public findAll(): Observable<ViewUserModel[]> {
    return this.http.get<ViewUserModel[]>(this.endPointUrl);
  }

  public findOne(userId: string): Observable<ViewUserModel> {
    return this.http.get<ViewUserModel>(`${this.endPointUrl}/${userId}`);
  }

  public create(createUserDto: CreateUserModel): Observable<ViewUserModel> {
    return this.http.post<ViewUserModel>(`${this.endPointUrl}/create`, createUserDto);
  }

  public update(userId: number, createUserDto: CreateUserModel): Observable<ViewUserModel> {
    return this.http.patch<ViewUserModel>(`${this.endPointUrl}/update/${userId}`, createUserDto);
  }

  public changeUserPassword(changedPassword: ChangePasswordModel): Observable<ViewUserModel> {
    return this.http.patch<ViewUserModel>(`${this.endPointUrl}/change-password`, changedPassword);
  }

}
