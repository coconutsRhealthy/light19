import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogosService {
  private logosUrl = 'logos.json';

  constructor(private http: HttpClient) {}

  getAllLogos(): Observable<{ [companyName: string]: string }> {
    return this.http.get<{ [companyName: string]: string }>(this.logosUrl);
  }
}
