import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; 
import { StationModel } from '../models/station.model';
import { StationFormModel } from '../models/station-form.model';

@Injectable({
  providedIn: 'root'
})
export class StationsService {

  endPointUrl: string = " http://localhost:3000/stations";

  constructor(private http: HttpClient) { }

  getStations(): Observable<StationModel[]> { 
    return this.http.get<StationModel[]>(this.endPointUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getStation(stationId: string): Observable<StationModel> { 
    const url = `${this.endPointUrl}/${stationId}`;
    console.log(url)
    return this.http.get<StationModel>(url)
      .pipe(
        catchError(this.handleError)
      );
  }



  save(station: StationModel): Observable<StationModel> {
    return this.http.post<StationModel>(this.endPointUrl, station)
      .pipe(
        catchError(this.handleError)
      );
  }

  delete(stationId: number): Observable<StationModel> {
    //todo use json as body of ids?
    const url = `${this.endPointUrl}/${stationId}`; 
    return this.http.delete<StationModel>(url)
      .pipe(
        catchError(this.handleError)
      );
  }


  getStationForms(stationId: string): Observable<StationFormModel[]> { 
    const url = `${this.endPointUrl}/forms/${stationId}`;
    return this.http.get<StationFormModel[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  saveStationForms(stationId: string, formIds: number[]): Observable<StationFormModel[]> {
    const url = `${this.endPointUrl}/forms/${stationId}`; 
    return this.http.post<StationFormModel[]>(url, formIds)
      .pipe(
        catchError(this.handleError)
      );
  }




  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
  
}
