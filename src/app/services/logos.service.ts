import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import logosData from '../data/logos_static_test.json';

@Injectable({
  providedIn: 'root',
})
export class LogosService {

  constructor() {}

  getAllLogos(): Observable<{ [companyName: string]: string }> {
    return of(logosData);
  }
}
