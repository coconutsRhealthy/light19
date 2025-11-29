import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Statische JSON importeren
import discountsData from './discounts_static_test.json';

@Injectable({
  providedIn: 'root',
})
export class DiscountsService {

  constructor() {}

  // Huidige getDiscounts() vervangt HTTP-call door statische data
  getDiscounts(): Observable<string[]> {
    return of(discountsData);
  }
}
