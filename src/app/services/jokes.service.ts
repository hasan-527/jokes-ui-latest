import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Joke {
  id: string;
  joke: string;
}

@Injectable({
  providedIn: 'root'
})
export class JokesService {
  // Adjust baseUrl if your backend uses a different prefix
  private baseUrl = '/api/jokes';

  constructor(private http: HttpClient) {}

  getRandomJoke(): Observable<Joke> {
    return this.http.get<Joke>(`${this.baseUrl}/random`);
  }

  // Expects backend endpoint returning either { results: Joke[] } or Joke[] directly.
  searchJokes(term: string): Observable<Joke[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<any>(`${this.baseUrl}/search`, { params }).pipe(
      map(res => {
        if (!res) { return []; }
        if (Array.isArray(res)) { return res as Joke[]; }
        if (Array.isArray(res.results)) { return res.results as Joke[]; }
        // fallback attempt for common icanhazdadjoke shape
        if (res.results) { return res.results as Joke[]; }
        return [];
      })
    );
  }
}