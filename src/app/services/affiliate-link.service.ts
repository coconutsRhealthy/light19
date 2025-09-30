import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AffiliateLinkService {

  private affiliateLinks: {[key: string]: { url: string, dummyCode: string }} = {
    'bylashbabe': {
        url: 'https://bylashbabe.com?sca_ref=3638091.TQRuyJNRG1',
        dummyCode: 'STARLASH'
    },
    'myproteinnl': {
        url: 'https://tidd.ly/3Dvhdyg',
        dummyCode: 'MPDISKI'
    },
    'smartphonehoesjes.nl': {
        url: 'https://tidd.ly/3FRwREQ',
        dummyCode: 'SHXDISKI725'
    },
    'veromoda': {
        url: 'https://www.stylink.it/AdZbXhpwmw',
        dummyCode: 'VERO20DRN'
    },
    'ginatricot': {
        url: 'https://www.stylink.it/ryMdpCQqA3q',
        dummyCode: 'VIP20QZJ'
    },
    'hunkemoller': {
        url: 'https://tidd.ly/4j17AXp',
        dummyCode: 'HUNK5CUZ'
    },
    'thuisbezorgd': {
        url: 'https://tidd.ly/4jpALTJ',
        dummyCode: 'THUI25HN7'
    },
    'footlocker': {
        url: 'https://tidd.ly/3G2Kxgs',
        dummyCode: 'FOOT25JUV'
    },
    'ninjakitchen': {
        url: 'https://tidd.ly/42pkFTr',
        dummyCode: 'NINJ15BBG'
    },
    'samsung': {
        url: 'https://tidd.ly/42Jik72',
        dummyCode: 'SAMS5HR9'
    },
    'yesstyle': {
        url: 'https://www.yesstyle.com/en/home.html?rco=YESGIRL23&utm_term=YESGIRL23&utm_medium=Influencer&utm_source=dynamic&mcg=influencer',
        dummyCode: 'YESS25JQL'
    },
    'asos': {
        url: 'https://www.stylink.it/lg3mpUa423',
        dummyCode: 'ASOS10NKD'
    },
    'stevemadden': {
        url: 'https://www.stylink.it/AdZbXh7gYM',
        dummyCode: 'SHOPPING30QO9'
    },
    'lookfantastic': {
        url: 'https://tidd.ly/4iykJXb',
        dummyCode: 'LFDISKI'
    },
    'h&m': {
        url: 'https://www.stylink.it/jnNwDTowPY',
        dummyCode: 'PROMO10Q17'
    },
    'bodyandfit.com': {
        url: 'https://tidd.ly/3Rbf9yz',
        dummyCode: 'LOVELY258E2'
    },
    'westwing': {
        url: 'https://www.stylink.it/ZqG7gSdn0q',
        dummyCode: 'WEST20UYH'
    },
    'idealofsweden': {
        url: 'https://www.idealofsweden.eu/?utm_medium=brand-ambassador&ref=bb-m47m59',
        dummyCode: 'IDEAL15BD'
    },
    'aliexpress': {
        url: 'https://tidd.ly/44qRvWs',
        dummyCode: 'ALIE15LM0'
    },
    'adidas': {
        url: 'https://tidd.ly/4iTlN7Q',
        dummyCode: 'SOPHIE15RUS'
    },
    'only': {
        url: 'https://www.stylink.it/5xZndfMoYe',
        dummyCode: 'LOVELY20BTS'
    },
    'nike': {
        url: 'https://www.stylink.it/vR0jnhYnlR',
        dummyCode: 'JULIA30O0T'
    },
    'prozis': {
        url: 'https://prozis.com/NfHG',
        dummyCode: 'PEPER'
    },
    'stylevana': {
        url: 'https://tidd.ly/4dsPX0F',
        dummyCode: 'STYL20YJ3'
    },
    'temu': {
        url: 'https://temu.to/m/u0p32ew176i',
        dummyCode: 'apu12458'
    },
    'easytoys': {
        url: 'https://tidd.ly/4ntIXoT',
        dummyCode: 'EASY30HOV'
    },
    'iciparisxl': {
        url: 'https://tidd.ly/4lMFsJA',
        dummyCode: 'ICIP30GYR'
    },
    'yehwang_wholesale': {
        url: 'https://bit.ly/43fOjKa',
        dummyCode: 'HAPPY10SZI'
    },
    'desenio': {
        url: 'https://desen.io/?ref=bb-m47m59',
        dummyCode: 'PROMO15756'
    },
    'ullapopken.nl': {
        url: 'https://tidd.ly/4mmCMCH',
        dummyCode: 'SHOP106LK'
    },
    'maletasgreenwich': {
        url: 'https://tidd.ly/4lPQy0v',
        dummyCode: 'MALE15ZVO'
    },
    'voghion': {
        url: 'https://tidd.ly/3Ep876s',
        dummyCode: 'VOGH5S3X'
    },
    'shirttuning.nl': {
        url: 'https://tidd.ly/4lAMjp6',
        dummyCode: 'SHIR25YVG'
    },
    'street-one.nl': {
        url: 'https://tidd.ly/44fnr0c',
        dummyCode: 'STYLE20NUQ'
    },
    'zooplus.nl': {
        url: 'https://tidd.ly/44NnZKP',
        dummyCode: 'LISA51AW'
    },
    'cecil.nl': {
        url: 'https://tidd.ly/3Sb7l06',
        dummyCode: 'OFF25C7J'
    },
    'stradivarius': {
        url: 'https://tidd.ly/3YTQORZ',
        dummyCode: 'PROMO150OX'
    },
    'greetz.nl': {
        url: 'https://tidd.ly/42NSCOV',
        dummyCode: 'GREE20GGN'
    },
    'albelli': {
        url: 'https://tidd.ly/4ms3olS',
        dummyCode: 'MARIE25BM1'
    },
    'otrium': {
        url: 'https://tidd.ly/3FpcLSm',
        dummyCode: 'OTRI3009T'
    },
    'zelesta.nl': {
        url: 'https://tidd.ly/4dyxrUU',
        dummyCode: 'BEAUTY25VEL'
    },
    'smartphoto.nl': {
        url: 'https://www.smartphoto.nl/foto_tt?tt=4903_12_448474_&r=%2F',
        dummyCode: 'VIP5IRR'
    },
    'secretsales.nl': {
        url: 'https://tidd.ly/43Atcoa',
        dummyCode: 'STYLE5DCR'
    },
    'keepitsneaker': {
        url: 'https://tidd.ly/4deFHcA',
        dummyCode: 'JULIA30O7A'
    },
    'fashionette': {
        url: 'https://tidd.ly/4j3pE2h',
        dummyCode: 'FASH30XMQ'
    },
    'vidaxl': {
        url: 'https://tidd.ly/42PSPRQ',
        dummyCode: 'BEAUTY15Q83'
    },
    'charlottetilbury': {
        url: 'https://shop.charlottetilbury.com/or/camref:1110lNBf/[p_id:1110l734]/destination:https%3A%2F%2Fwww.charlottetilbury.com%2Fnl',
        dummyCode: 'CHAR5Q0C'
    },
    'boohoo': {
        url: 'https://tidd.ly/3ZsqrTt',
        dummyCode: 'BOOH5I0M'
    },
    'boohooman': {
        url: 'https://tidd.ly/3GZs30J',
        dummyCode: 'BOOH2506Z'
    },
    'sansbeaute': {
        url: 'https://tidd.ly/3EZGXUh',
        dummyCode: 'SANS20KIH'
    },
    'bstn.com': {
        url: 'https://tidd.ly/3FgECUP',
        dummyCode: 'PROMO54VH'
    },
    'sharkclean.nl': {
        url: 'https://tidd.ly/4dp8Dyx',
        dummyCode: 'ANNA15VGZ'
    },
    'prenatal': {
        url: 'https://tidd.ly/43lmYHH',
        dummyCode: 'PREN20935'
    },
    'wish.com': {
        url: 'https://click.linksynergy.com/deeplink?id=q0MVTK*mZVE&mid=53194&murl=https%3A%2F%2Fwww.wish.com%2Fnl',
        dummyCode: 'SOPHIE5FFQ'
    },
    'mvolo.nl': {
        url: 'https://tidd.ly/3H0Mw5m',
        dummyCode: 'MVOL253PS'
    },
    'bulk.com': {
        url: 'https://tidd.ly/43rbsdJ',
        dummyCode: 'LISA20OVK'
    },
    'spacenk.com': {
        url: 'https://tidd.ly/4dFlWeo',
        dummyCode: 'WELCOME30GID'
    },
    'naduvi.nl': {
        url: 'https://tidd.ly/3HnUdT9',
        dummyCode: 'HAPPY52WJ'
    },
    'kitchenaid': {
        url: 'https://tidd.ly/4dwNti2',
        dummyCode: 'WELCOME30R2P'
    },
    'malelions': {
        url: 'https://tidd.ly/3Z1dr7b',
        dummyCode: 'MALE5JJ0'
    },
    'fotocadeau.nl': {
        url: 'https://tidd.ly/3Z1dIXL',
        dummyCode: 'JULIA207MF'
    },
    '123jaloezie.nl': {
        url: 'https://tidd.ly/3SR4dqy',
        dummyCode: '123J30FG2'
    },
    'upfront': {
        url: 'https://tidd.ly/4nfNOdh',
        dummyCode: 'ACTIE10'
    },
    'lounge by zalando': {
        url: 'https://tidd.ly/3ZknIvm',
        dummyCode: 'MARIE5MXP'
    },
    'jhpfashion.nl': {
        url: 'https://tidd.ly/4kaBWGU',
        dummyCode: 'DISKI10'
    },
    'picnic': {
        url: 'https://tidd.ly/4jkKLxg',
        dummyCode: 'PICN30TL0'
    },
    'amazon': {
        url: 'https://amzn.to/4lyoE8A',
        dummyCode: 'SUMMER5SQE'
    },
    'tefal': {
        url: 'https://tidd.ly/44tjrJB',
        dummyCode: 'TEFA15YU3'
    },
    'tennis-point.nl': {
        url: 'https://tidd.ly/4kB6hPn',
        dummyCode: 'TENN20E43'
    },
    'lampenlicht.nl': {
        url: 'https://tidd.ly/3Tlo5m2',
        dummyCode: 'MARIE1089N'
    },
    'earkings.nl': {
        url: 'https://tidd.ly/3UjR75T',
        dummyCode: 'WELCOME30D5O'
    },
    'large.nl': {
        url: 'https://tidd.ly/3TiNQ6E',
        dummyCode: 'LARG574V'
    },
    'cashbackxl': {
        url: 'https://www.cashbackxl.nl?share=wouter-c9c3bf',
        dummyCode: 'geen code nodig'
    },
    'dyson': {
        url: 'https://tidd.ly/4dloiic',
        dummyCode: 'WELCOME5XME'
    },
    'coolblue': {
        url: 'https://tidd.ly/3GSohGZ',
        dummyCode: 'COOL30SR8'
    },
    'douglas': {
        url: 'https://tidd.ly/4ldZ0VD',
        dummyCode: 'DOUG2005X'
    },
    'shein': {
        url: 'https://www.awin1.com/cread.php?awinmid=18055&awinaffid=1870794&ued=https%3A%2F%2Fnl.shein.com%2F',
        dummyCode: 'SHEI20Y9P'
    },
    'emmasleepnl': {
        url: 'https://tidd.ly/47ACnr9',
        dummyCode: 'EMMA25YB9'
    },
    'ugg': {
        url: 'https://tidd.ly/4lw3s2q',
        dummyCode: 'UGG20YBB'
    },
    'jeanscentre.nl': {
        url: 'https://tidd.ly/3GmmSIe',
        dummyCode: 'WELCOME108U3'
    },
    'pearle': {
        url: 'https://tidd.ly/44oWOpz',
        dummyCode: 'SHOPPING25IC5'
    },
    'converse': {
        url: 'https://tidd.ly/4jEbhCy',
        dummyCode: 'SOPHIE25JGX'
    },
    'skateshop': {
        url: 'https://clk.tradedoubler.com/click?p=376362&a=3427761&url=https%3A%2F%2Fwww.skateshop.be%2Fnl%2F',
        dummyCode: 'SKAT10M5V'
    },
    'purenaturegoods': {
        url: 'https://tidd.ly/3FaGtdY',
        dummyCode: 'PURE5CDA'
    },
    'stekkies': {
        url: 'https://in.stekkies.com/t/t?a=1962471956&as=1971143404&t=2&tk=1',
        dummyCode: 'LOVELY259AQ'
    },
    'lycamobile': {
        url: 'https://clk.tradedoubler.com/click?p=335732&a=3427761&url=https%3A%2F%2Fwww.lycamobile.nl%2Fnl%2F%3Fsrsltid%3DAfmBOooraQEWMEo01s4s6rdU6wIjdzSKc_WeseYPUlJv7Ukv-RcyQxEW',
        dummyCode: 'LYCA2563B'
    },
    'fotogeschenk': {
        url: 'https://www.fotogeschenk.nl/foto/?tt=642_12_448474_&r=%2F',
        dummyCode: 'HAPPY30CQR'
    },
    'basalbasics.nl': {
        url: 'https://clk.tradedoubler.com/click?p=345870&a=3427761&url=https%3A%2F%2Fwww.basalbasics.nl%2F',
        dummyCode: 'BASA302OU'
    },
    'hairworldshop.nl': {
        url: 'https://clk.tradedoubler.com/click?p=358618&a=3427761&url=https%3A%2F%2Fwww.hairworldshop.nl%2F',
        dummyCode: 'HAIR25ZBE'
    },
    'vitamine.shop': {
        url: 'https://clk.tradedoubler.com/click?p=315858&a=3427761&url=https%3A%2F%2Fvitamine.shop%2F',
        dummyCode: 'VITA20TZ4'
    },
    'mimmti.com': {
        url: 'https://tc.tradetracker.net/?c=30770&m=12&a=448474&r=&u=%2F',
        dummyCode: 'MIMM10JHM'
    },
    'acrylfoto.nl': {
        url: 'https://www.acrylfoto.nl/foto/?tt=3380_12_448474_&r=%2F',
        dummyCode: 'FASHION20T8S'
    },
    'namly.nl': {
        url: 'https://clk.tradedoubler.com/click?p=379967&a=3427761&url=https%3A%2F%2Fwww.namly.nl%2F',
        dummyCode: 'NAML57VV'
    },
    'sixt': {
        url: 'https://tidd.ly/3H8Oz7y',
        dummyCode: 'SIXT15W2E'
    },
    'iphone-cases.nl': {
        url: 'https://tidd.ly/44LjD74',
        dummyCode: 'SHOP25DK2'
    },
    'tuinmeubelshop.nl': {
        url: 'https://tidd.ly/4mlk526',
        dummyCode: 'TUIN15OI1'
    },
    'jadedlondon': {
        url: 'https://tidd.ly/44NF2MZ',
        dummyCode: 'MARIE25L84'
    },
    'muchachomalo': {
        url: 'https://tidd.ly/3YYwvDa',
        dummyCode: 'LISA25X0P'
    },
    'parfumdreams.nl': {
        url: 'https://tidd.ly/43nW6GR',
        dummyCode: 'PARF25I8N'
    },
    'melanojewelry': {
        url: 'https://tidd.ly/4mMtHU3',
        dummyCode: 'MELA15RS8'
    },
    'dryze.nl': {
        url: 'https://tidd.ly/4kc4WPj',
        dummyCode: 'DRYZ1553S'
    },
    'odido zakelijk': {
        url: 'https://tidd.ly/3H2v7t8',
        dummyCode: 'SOPHIE10BKH'
    },
    'odido thuis': {
        url: 'https://tidd.ly/4mtzOwf',
        dummyCode: 'ANNA257M1'
    },
    'odido mobiel': {
        url: 'https://tidd.ly/45nqt2M',
        dummyCode: 'ODID25JP4'
    },
    'vitaepro.nl': {
        url: 'https://tidd.ly/4ki4LRI',
        dummyCode: 'SHOP20TH1'
    },
    'action': {
        url: 'https://tidd.ly/4nxwoZW',
        dummyCode: 'VIP20R32'
    },
    'bluetomato': {
        url: 'https://tidd.ly/4ldkSBs',
        dummyCode: 'BEAUTY257PX'
    },
    'schuurman schoenen': {
        url: 'https://tidd.ly/3ZXRHtp',
        dummyCode: 'SCHU15SN9'
    },
    '50plusmobiel': {
        url: 'https://tidd.ly/3TNztXZ',
        dummyCode: 'SHOPPING5U6K'
    },
    'lucovitaal': {
        url: 'https://tidd.ly/4l8jxfd',
        dummyCode: 'LUCO257DD'
    },
    'guess': {
        url: 'https://tidd.ly/3I55PuV',
        dummyCode: 'GUES5WI3'
    },
    'happy-size.nl': {
        url: 'https://tidd.ly/3VAKX1Y',
        dummyCode: 'HS-15'
    },
    'koreanskincare': {
        url: 'https://tidd.ly/4peUaus',
        dummyCode: 'KORSK15'
    },
    'wildrefill': {
        url: 'https://tidd.ly/4mUIifD',
        dummyCode: 'wiegeeftkorting'
    },
    'tenways': {
        url: 'https://tidd.ly/42mKnsj',
        dummyCode: 'TENWAYS15'
    },
    'olivida.nl': {
        url: 'https://olivida.nl/diski',
        dummyCode: 'DIKSI10'
    },
    'bydreamlash.nl': {
        url: 'https://bydreamlash.nl?sca_ref=9354637.Pe3nBHQSbeg8',
        dummyCode: 'EVA15'
    }
  };

  constructor() { }

  public getAffiliateLink(company: string): string | undefined {
    if(company.includes('(') && !company.includes('(gratis')) {
      var parts = company.split('(');
      company = parts[0].trim();
    }

    const url = this.affiliateLinks[company]?.url;

    if(url === undefined || url.trim() === '') {
      return undefined;
    }

    return url;
  }
}
