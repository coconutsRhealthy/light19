import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WieheeftsaleService {
  private wieheeftsaleUrl = '/wieheeftsale.json';

  constructor(private http: HttpClient) {}

  getWieheeftsaleLinks(): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(this.wieheeftsaleUrl);
  }
}
