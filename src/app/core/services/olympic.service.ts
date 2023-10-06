import { OlympicCountry } from './../models/Olympic';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<OlympicCountry[]>([]);
  constructor(private http: HttpClient) { }

  loadInitialData() {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),

      catchError((error, caught) => {
        console.error('An error occurred:', error);
        // can be useful to end loading state and let the user know something went wrong
        this.olympics$.error('Une erreur s\'est produite lors du chargement des données.');

        return caught;
      })
    );
  }

  getOlympics(): Observable<OlympicCountry[]> {
    return this.olympics$.asObservable();
  }
}
