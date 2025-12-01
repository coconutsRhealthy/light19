import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Statische JSON importeren
//TODO: correct location
import logosData from './logos_static_test.json';

@Injectable({
  providedIn: 'root',
})
export class LogosService {

  constructor() {}

  // Huidige getLogos() vervangt HTTP-call door statische data
  getAllLogos(): Observable<{ [companyName: string]: string }> {
    return of(logosData);
  }
}
