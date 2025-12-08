import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import discountsData from '../data/discounts_static_test.json';

@Injectable({
  providedIn: 'root',
})
export class DiscountsService {

  constructor() {}

  getDiscounts(): Observable<string[]> {
    return of(discountsData);
  }
}
