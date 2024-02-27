import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StationModel } from '../models/station.model';
import { StationFormModel } from '../models/station-form.model';
import { StationElementModel } from '../models/station-element.model';
import { StationElementLimitModel } from '../models/station-element-limit.model';

@Injectable({
  providedIn: 'root'
})
export class StationsService {

  endPointUrl: string = " http://localhost:3000/stations";

  constructor(private http: HttpClient) { }

 public getStations(stationIds?: string[]): Observable<StationModel[]> {
    let params: HttpParams = new HttpParams();

    if (stationIds && stationIds.length > 0) {
      params = params.set('ids', stationIds.join(','));
    }

    return this.http.get<StationModel[]>(this.endPointUrl, { params: params })
      .pipe(
        catchError(this.handleError)
      );
  }

  public getStation(stationId: string): Observable<StationModel> {
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
    const url = `${this.endPointUrl}/${stationId}`;
    return this.http.delete<StationModel>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  getStationElements(stationId: string): Observable<StationElementModel[]> {
    const url = `${this.endPointUrl}/elements/${stationId}`;
    return this.http.get<StationElementModel[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  saveStationElements(stationId: string, elementIds: number[]): Observable<StationElementModel[]> {
    const url = `${this.endPointUrl}/elements/${stationId}`;
    return this.http.post<StationElementModel[]>(url, elementIds)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteStationElement(stationId: string, elementId: number): Observable<StationElementModel> {
    const url = `${this.endPointUrl}/elements/${stationId}/${elementId}`;
    return this.http.delete<StationElementModel>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  getStationElementLimits(stationId: string, elementId: number): Observable<StationElementLimitModel[]> {
    const url = `${this.endPointUrl}/element-limits/${stationId}/${elementId}`;
    return this.http.get<StationElementLimitModel[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  saveStationElementLimits(stationId: string, elementId: number, elementLimit: StationElementLimitModel[]): Observable<StationElementLimitModel[]> {
    const url = `${this.endPointUrl}/element-limits/${stationId}/${elementId}`;
    return this.http.post<StationElementLimitModel[]>(url, elementLimit)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteStationElementLimit(stationId: string, elementId: number, monthId: number): Observable<StationElementLimitModel> {
    const url = `${this.endPointUrl}/element-limits/${stationId}/${elementId}/${monthId}`;
    return this.http.delete<StationElementLimitModel>(url)
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

  deleteStationForm(stationId: string, formId: number): Observable<StationFormModel> {
    const url = `${this.endPointUrl}/forms/${stationId}/${formId}`;
    return this.http.delete<StationFormModel>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  //---todo. push to another class ----
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
