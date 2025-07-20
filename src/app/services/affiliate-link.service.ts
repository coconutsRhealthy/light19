import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AffiliateLinkService {

  private affiliateLinks: { [key: string]: string } = {
    'bylashbabe': 'https://bylashbabe.com?sca_ref=3638091.TQRuyJNRG1',
    'myproteinnl': 'https://tidd.ly/3Dvhdyg',
    'smartphonehoesjes.nl': 'https://tidd.ly/3FRwREQ',
    'veromoda': 'https://www.stylink.it/AdZbXhpwmw',
    'ginatricot': 'https://www.stylink.it/ryMdpCQqA3q',
    'hunkemoller': 'https://tidd.ly/4j17AXp',
    'thuisbezorgd': 'https://tidd.ly/4jpALTJ',
    'footlocker': 'https://tidd.ly/3G2Kxgs',
    'ninjakitchen': 'https://tidd.ly/42pkFTr',
    'samsung': 'https://tidd.ly/42Jik72',
    'yesstyle': 'https://www.yesstyle.com/en/home.html?rco=YESGIRL23&utm_term=YESGIRL23&utm_medium=Influencer&utm_source=dynamic&mcg=influencer',
    'asos': 'https://www.stylink.it/lg3mpUa423',
    'stevemaddeneu': 'https://www.stylink.it/AdZbXh7gYM',
    'lookfantastic': 'https://tidd.ly/4iykJXb',
    'hm': 'https://www.stylink.it/jnNwDTowPY',
    'h&m': 'https://www.stylink.it/jnNwDTowPY',
    'bodyandfit.com': 'https://tidd.ly/3Rbf9yz',
    'westwing': 'https://www.stylink.it/ZqG7gSdn0q',
    'lightinthebox': 'https://www.stylink.it/nkP3nIRNj0',
    'idealofsweden': 'https://www.idealofsweden.eu/?utm_medium=brand-ambassador&ref=bb-m47m59',
    'zaful': 'https://lt45.net/c/?si=14546&li=1774866&wi=387380&ws=zaful',
    'superdry': 'https://rkn3.net/c/?si=14965&li=1650750&wi=387380&ws=superdry',
    'aliexpress': 'https://tidd.ly/44qRvWs',
    'adidas': 'https://tidd.ly/4iTlN7Q',
    'nanabeebi': 'https://tc.tradetracker.net/?c=30770&m=12&a=448474&r=disna&u=%2F',
    'reginajewelry': 'https://www.reginajewelry.co/?ref=bb-jezj8p',
    'only': 'https://www.stylink.it/5xZndfMoYe',
    'nike': 'https://www.stylink.it/vR0jnhYnlR',
    'prozis': 'https://prozis.com/NfHG',
    'stylevana': 'https://tidd.ly/4dsPX0F',
    'temu': 'https://temu.to/m/u0p32ew176i',
    'temu (gratis producten)': 'https://temu.to/m/e74veq9vg5u',
    'easytoys': 'https://tidd.ly/4ntIXoT',
    'iciparisxl': 'https://tidd.ly/4lMFsJA',
    'yehwang_wholesale': 'https://bit.ly/43fOjKa',
    'desenio': 'https://desen.io/?ref=bb-m47m59',
    'ullapopken.nl': 'https://tidd.ly/4mmCMCH',
    'maletasgreenwich': 'https://tidd.ly/4lPQy0v',
    'voghion': 'https://tidd.ly/3Ep876s',
    'shirttuning.nl': 'https://tidd.ly/4lAMjp6',
    'street-one.nl': 'https://tidd.ly/44fnr0c',
    'zooplus.nl': 'https://tidd.ly/44NnZKP',
    'cecil.nl': 'https://tidd.ly/3Sb7l06',
    'stradivarius': 'https://tidd.ly/3YTQORZ',
    'greetz.nl': 'https://tidd.ly/42NSCOV',
    'albelli': 'https://tidd.ly/4ms3olS',
    'esn': 'https://tidd.ly/3F1sqHD',
    'otrium': 'https://tidd.ly/3FpcLSm',
    'zelesta.nl': 'https://tidd.ly/4dyxrUU',
    'hellofresh.nl': 'https://tidd.ly/3FgGL2U',
    'smartphoto.nl': 'https://www.smartphoto.nl/foto_tt?tt=4903_12_448474_&r=%2F',
    'secretsales.nl': 'https://tidd.ly/43Atcoa',
    'keepitsneaker': 'https://tidd.ly/4deFHcA',
    'fashionette': 'https://tidd.ly/4j3pE2h',
    'vidaxl': 'https://tidd.ly/42PSPRQ',
    'charlottetilbury': 'https://shop.charlottetilbury.com/or/camref:1110lNBf/[p_id:1110l734]/destination:https%3A%2F%2Fwww.charlottetilbury.com%2Fnl',
    'boohoo': 'https://tidd.ly/3ZsqrTt',
    'boohooman': 'https://tidd.ly/3GZs30J',
    'sansbeaute': 'https://tidd.ly/3EZGXUh',
    'bstn.com': 'https://tidd.ly/3FgECUP',
    'sharkclean.nl': 'https://tidd.ly/4dp8Dyx',
    'prenatal': 'https://tidd.ly/43lmYHH',
    'wish.com': 'https://click.linksynergy.com/deeplink?id=q0MVTK*mZVE&mid=53194&murl=https%3A%2F%2Fwww.wish.com%2Fnl',
    'mvolo.nl': 'https://tidd.ly/3H0Mw5m',
    'bulk.com': 'https://tidd.ly/43rbsdJ',
    'spacenk.com': 'https://tidd.ly/4dFlWeo',
    'naduvi.nl': 'https://tidd.ly/3HnUdT9',
    'kitchenaid': 'https://tidd.ly/4dwNti2',
    'malelions': 'https://tidd.ly/3Z1dr7b',
    'fotocadeau.nl': 'https://tidd.ly/3Z1dIXL',
    '123jaloezie.nl': 'https://tidd.ly/3SR4dqy',
    'upfront': 'https://tidd.ly/4nfNOdh',
    'lounge by zalando': 'https://tidd.ly/3ZknIvm',
    'jhpfashion.nl': 'https://tidd.ly/4kaBWGU',
    'picnic': 'https://tidd.ly/4jkKLxg',
    'amazon': 'https://amzn.to/4lyoE8A',
    'tefal': 'https://tidd.ly/44tjrJB',
    'tennis-point.nl': 'https://tidd.ly/4kB6hPn',
    'lampenlicht.nl': 'https://tidd.ly/3Tlo5m2',
    'shein': 'https://tidd.ly/4i3O8YM',
    'earkings.nl': 'https://tidd.ly/3UjR75T',
    'large.nl': 'https://tidd.ly/3TiNQ6E',
    'cashbackxl': 'https://www.cashbackxl.nl?share=wouter-c9c3bf',
  };

  constructor() { }

  public getAffiliateLink(company: string): string | undefined {
    if(company.includes('(') && !company.includes('(gratis')) {
      var parts = company.split('(');
      company = parts[0].trim();
    }

    return this.affiliateLinks[company];
  }
}
