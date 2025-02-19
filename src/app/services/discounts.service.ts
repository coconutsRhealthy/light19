import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DiscountsService {
  private manifestUrl = '/manifest.json';

  constructor(private http: HttpClient) {}

  getDiscounts(): Observable<string[]> {
    const timestamp = new Date().getTime();
    const cacheBustedUrl = `${this.manifestUrl}?cache-bust=${timestamp}`;

    return this.http.get<{ latestDiscounts: string }>(cacheBustedUrl).pipe(
      switchMap(manifest => this.http.get<string[]>(`/${manifest.latestDiscounts}`))
    );
  }
}
