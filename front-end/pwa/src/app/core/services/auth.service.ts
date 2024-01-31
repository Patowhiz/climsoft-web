import { Injectable } from '@angular/core';
import { LoggedInUserDto } from '../models/dtos/logged-in-user.dto';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user: BehaviorSubject<LoggedInUserDto | null> = new BehaviorSubject<LoggedInUserDto | null>(null);

  private endPointUrl: string = "http://localhost:3000/users";

  constructor(private http: HttpClient) {
    this.autoLogin();
  }

  public get user() {
    return this._user;
  }

  private autoLogin(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this._user.next(JSON.parse(user));
    }
  }

  public login(username: string, password: string) {
    return this.http.post<LoggedInUserDto>(`${this.endPointUrl}/login`, { username: username, password: password })
      .pipe(
        catchError((error) => this.handleError(error)),
        tap((data) => this.handleAuthentication(data))
      );
  }

  public logout() {
    return this.http.post<LoggedInUserDto>(`${this.endPointUrl}/logout`, {})
      .pipe(
        catchError((error) => this.handleError(error)),
        tap((data) => {

          console.log('logout data', data);

        

          this.removeUser();
        })
      );
  }

  private handleAuthentication(loggedInUser: LoggedInUserDto) {
    this.updateUserExpiryDateAndSave(loggedInUser)
    this._user.next(loggedInUser)
  }

  public removeUser(){
      localStorage.removeItem('user');

          this._user.next(null);
  }

  public updateUserExpiryDateAndSave(loggedInUser?: LoggedInUserDto): void {
    if (!loggedInUser && this._user.value) {
      loggedInUser = this._user.value
    }
    if (loggedInUser) {
      //calculate the expiry date based on expires in value that is set in the server 
      loggedInUser.expirationDate = new Date(new Date().getTime() + loggedInUser.expiresIn).getTime();

      //save the user data
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    }



  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string = 'An unknown error occurred. Please try again later.';
    if (error.error && error.error.message) {
      switch (error.error.message) {
        case 'INVALID_CREDENTIALS':
          errorMessage = 'Wrong username or password';
      }
    }

    return throwError(() => new Error(errorMessage));
  }



}
