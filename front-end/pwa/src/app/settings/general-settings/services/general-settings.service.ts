import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CreateViewGeneralSettingModel } from 'src/app/settings/general-settings/models/create-view-general-setting.model';
import { environment } from 'src/environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { UpdateGeneralSettingModel } from 'src/app/settings/general-settings/models/update-general-setting.model';

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingsService {
  private endPointUrl: string = `${environment.apiUrl}/general-settings`;

  constructor(private http: HttpClient) { }

  public findOne(id: number): Observable<CreateViewGeneralSettingModel> {
    const url = `${this.endPointUrl}/${id}`;
    return this.http.get<CreateViewGeneralSettingModel>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  public findAll(): Observable<CreateViewGeneralSettingModel[]> {
    return this.http.get<CreateViewGeneralSettingModel[]>(`${this.endPointUrl}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  public update(id: number, updateDto: UpdateGeneralSettingModel): Observable<CreateViewGeneralSettingModel> {
    return this.http.patch<CreateViewGeneralSettingModel>(`${this.endPointUrl}/${id}`, updateDto)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {

    //console.log('auth error', error)

    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened. please try again later.'));
  }

}
