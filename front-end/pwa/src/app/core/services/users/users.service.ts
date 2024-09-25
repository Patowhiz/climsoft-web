import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';  
import { ViewUserModel } from '../../models/users/view-user.model';
import { CreateUserModel } from '../../models/users/create-user.model';
import { ChangePasswordModel } from '../../models/users/change-password.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private endPointUrl: string = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

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
