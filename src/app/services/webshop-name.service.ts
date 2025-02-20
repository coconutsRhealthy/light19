import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebshopNameService {

  private webshopNames: { [key: string]: string } = {
    'airup': 'air up',
    'bathandbodyworksnl': 'Bath and Body Works',
    'bjornborg': 'Björn Borg',
    'bodyandfit.com': 'Body en Fit',
    'christineleduc': 'Christine le Duc',
    'danielwellington': 'Daniel Wellington',
    'emmasleepnl': 'Emma Sleep',
    'ginatricot': 'Gina Tricot',
    'gutsgusto': 'Guts en Gusto',
    'hellofresh.nl': 'HelloFresh',
    'hm': 'H&M',
    'hunkemoller': 'Hunkemöller',
    'icaniwill': 'ICANIWILL',
    'idealofsweden': 'iDeal of Sweden',
    'leolive': 'Le Olive',
    'myproteinnl': 'Myprotein',
    'nakdfashion': 'NAKD',
    'stevemaddeneu': 'Steve Madden',
    'wefashionstories': 'WE Fashion',
    'zonnebrillen.com': 'Zonnebrillen.com',
    'aliexpress': 'AliExpress'
  };

  constructor() { }

  public getWebshopName(webshop: string): string | undefined {
    return this.webshopNames[webshop];
  }
}
