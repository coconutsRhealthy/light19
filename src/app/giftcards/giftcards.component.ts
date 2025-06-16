import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { DiscountsService } from '../services/discounts.service';
import { MetaService } from '../services/meta.service';

declare let gtag: Function;

@Component({
  selector: 'app-giftcards',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './giftcards.component.html',
  styleUrls: ['./giftcards.component.css', './../app.component.css']
})
export class GiftcardsComponent implements OnInit {

  giftCardCompany: string | null = null;
  giftCardUrl: string | null = null;

  starsEmoji = "\u{2728}";
  checkmarkEmoji = "\u{2705}";

  steps: any[] = [];
  webshopImageUrls: { [key: string]: string } = {};

  constructor(private route: ActivatedRoute, private meta: MetaService, private discountsService: DiscountsService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const company = params.get('company');
      this.setCompanyAndUrl(company);
    });
  }

  private setCompanyAndUrl(company: string | null): void {
    if (company) {
      this.discountsService.getDiscounts().subscribe((data) => {
      const matchingDiscount = data
        .map((line) => {
          const [parsedCompany, discountCode, percentage, , date] = line.split(', ');
          return { company: parsedCompany, discountCode, percentage, date };
        })
        .filter((discount) =>
          discount.discountCode.includes('woolsocks.eu') && discount.company === company
        )
        .find(() => true);

        if (matchingDiscount) {
          this.giftCardCompany = matchingDiscount.company;
          this.giftCardUrl = matchingDiscount.discountCode;
        }

        this.initializeWebshopImageUrls();
        this.initializeSteps();
        this.updateMeta();
      });
    }
  }

  initializeSteps() {
    this.steps = [
          {
            imageUrl: this.getStepImageUrl(this.giftCardCompany),
            title: 'Stap 1:',
            description: this.getStepDescription(1, "Klik hierboven op de knop 'Ontvang je Giftcard'. Onderstaand venster opent in een nieuwe tab. Klik op 'Doorgaan met e-mail'. Vul je mailadres in en klik op doorgaan. Download de Woolsocks app.")
          },
          {
            imageUrl: 'https://i.ibb.co/JmpDR3D/Screenshot-20241009-195007-2.png',
            title: 'Stap 2:',
            description: 'Open de Woolsocks app en klik op continue with email. Vul nu het mailadres in dat je bij de vorige stap opgegeven hebt en klik op Continue.'
          },
          {
            imageUrl: 'https://i.ibb.co/994CSP1/Screenshot-20241009-195211-2.png',
            title: 'Stap 3:',
            description: "Er wordt nu een mail van Woolsocks naar dit mailadres gestuurd. Open deze en klik in de mail op de link 'Verify your email'"
          },
          {
            imageUrl: 'https://i.ibb.co/vYQz4Cx/Screenshot-20241009-195300-2.png',
            title: 'Stap 4:',
            description: 'Je gaat nu automatisch terug naar de Woolsocks app en wordt nu gevraagd om een pincode in te stellen. Zodra je dit gedaan hebt krijg je een popup dat er een giftcard voor je klaarligt.'
          },
          {
            imageUrl: 'https://i.ibb.co/nbbdMJJ/Screenshot-20241009-195325-2.png',
            title: 'Stap 5:',
            description: this.getStepDescription(5, "De giftcard moet nog geunlocked worden. Dit doe je door je bankrekening te koppelen in Woolsocks. Dit is veilig en levert je ook extra voordelen op in de Woolsocks app, zoals tips waar je kan besparen en verschillende cashbacks.")
          },
          {
            imageUrl: 'https://i.ibb.co/TmTgFw9/Screenshot-20241009-195417-3.png',
            title: 'Stap 6:',
            description: this.getStepDescription(6, "Nadat je je bankrekening gekoppeld hebt wordt de giftcard vrijgegeven. Je kunt nu gewoon op de normale manier een aankoop doen bij de shop waar de giftcard voor is (dit hoeft dus niet via de Woolsocks app). Zodra je de aankoop gedaan hebt zal Woolsocks dit automatisch detecteren en de €5 giftcard aan je uitkeren in de Woolsocks app. Dit kun je in de app zien in de 'Money' tab (icoontje rechtsonderin), linksboven zie je een icoontje met jouw teruggekregen geld.")
          },
          {
            imageUrl: 'https://i.ibb.co/txvp42q/Screenshot-20241009-195538-3.png',
            title: 'Stap 7:',
            description: "Als je op het icoontje linksboven klikt krijg je een knop 'payout', en kun je het geld overmaken naar je gewone bankrekening."
          },
      ];
  }

  initializeWebshopImageUrls() {
    this.webshopImageUrls = {
      'about you': 'https://i.ibb.co/V25KDZz/1000037850.png',
      'achateshop.com': 'https://i.ibb.co/yY7MkgP/1000037868.png',
      'airup': 'https://i.ibb.co/Vgk85NS/1000037854.png',
      'arket': 'https://i.ibb.co/VxxNkRR/1000037862.png',
      'custtom.nl': 'https://i.ibb.co/QdNTXc1/1000037870.png',
      'decathlon': 'https://i.ibb.co/WcsXjdx/1000037857.png',
      'dominos': 'https://i.ibb.co/v3WxCJV/1000037856.png',
      'dutchies.com': 'https://i.ibb.co/LdxNYdS/1000037867.png',
      'efteling': 'https://i.ibb.co/SVHjQQy/1000037853.png',
      'esn': 'https://i.ibb.co/dQqKcjg/1000037852.png',
      'fashiontiger.nl': 'https://i.ibb.co/GPX6DZz/1000037861.png',
      'ginatricot': 'https://i.ibb.co/0QHXhbZ/1000037848.png',
      'gutsgusto': 'https://i.ibb.co/1nQSQPD/1000037849.png',
      'h&m': 'https://i.ibb.co/sj163j6/1000037845.png',
      'leolive': 'https://i.ibb.co/hZR4Zmv/1000037864.png',
      'loavies': 'https://i.ibb.co/VYHZQZB/1000037847.png',
      'maniacnails': 'https://i.ibb.co/3rkRXyC/1000037858.png',
      'maniko-nails.nl': 'https://i.ibb.co/K03GYNJ/1000037865.png',
      'myjewellery': 'https://i.ibb.co/hWHbH6S/1000037844.png',
      'pinkgellac': 'https://i.ibb.co/CWtG0tX/1000037846.png',
      'rosental-organics.nl': 'https://i.ibb.co/ZJ39mw3/1000037869.png',
      'sellpy': 'https://i.ibb.co/dfPYqHs/1000037866.png',
      'snuggs': 'https://i.ibb.co/pRzp6R7/1000037860.png',
      'stronger': 'https://i.ibb.co/k5KRmZk/1000037859.png',
      'tessv': 'https://i.ibb.co/q9czcg7/1000037863.png',
      'uber eats': 'https://i.ibb.co/xSNmtfD/1000037855.png',
      'wehkamp': 'https://i.ibb.co/P19bKzV/1000037851.png',
      'zalando': 'https://i.ibb.co/2nBfzFx/Screenshot-20241009-193905-2.png',
      'shein': 'https://i.ibb.co/HrfKfTV/shein.png',
      'nakdfashion': 'https://i.ibb.co/30gntWt/nakd.png',
      'bijenkorf': 'https://i.ibb.co/vcynxhD/bijenkorf.png',
      'zara': 'https://i.ibb.co/p123FfP/zara.png',
      'asos': 'https://i.ibb.co/q5fBQm9/asos.png',
      'aliexpress': 'https://i.ibb.co/ggtR95G/aliexpress.png',
      'bol.com': 'https://i.ibb.co/znRqSGm/bol-com.png',
      'bershka': 'https://i.ibb.co/WHzJwh9/bershka.png',
      'stradivarius': 'https://i.ibb.co/vjynr50/stradivarius.png',
      'hunkemoller': 'https://i.ibb.co/4V1L5yp/hunkemoller.png',
      'mostwanted': 'https://i.ibb.co/zG1gYcj/mostwanted.png',
      'iciparisxl': 'https://i.ibb.co/NWHj1dD/iciparisxl.png',
      'douglas': 'https://i.ibb.co/qM6F3Zs/douglas.png',
      'nike': 'https://i.ibb.co/ch0R74N/nike.png',
    };
  }

  getStepImageUrl(webshop: string | null): string {
    const defaultImageUrl = 'https://i.ibb.co/2nBfzFx/Screenshot-20241009-193905-2.png';

    if (!webshop) {
        return defaultImageUrl;
    }
    return this.webshopImageUrls[webshop] || defaultImageUrl;
  }

  getStepDescription(stepNumber: number, baseValue: string) {
    if(stepNumber === 1) {
      if (this.giftCardCompany) {
        return baseValue.replace('Ontvang je Giftcard', 'Ontvang ' + this.getFormattedGiftCardCompany() + ' Giftcard');
      }
    } else if(stepNumber === 5) {
      if (this.giftCardCompany && this.giftCardCompany.toLowerCase() !== 'zalando') {
        return baseValue += ' (NB: in de screenshot zie je als voorbeeld een giftcard van Zalando, maar het werkt hetzelfde voor de giftcard van ' + this.getFormattedGiftCardCompany() + ')';
      }
    } else if(stepNumber === 6) {
      if (this.giftCardCompany) {
        return baseValue.replace('de shop waar de giftcard voor is', this.getFormattedGiftCardCompany());
      }
    }

    return baseValue;
  }

  getFormattedGiftCardCompany(): string {
    const company = this.giftCardCompany || '';

    if (company.toLowerCase() === 'h&m' || company.toLowerCase() === 'esn') {
      return company.toUpperCase();
    }

    return this.toTitleCase(company);
  }

  private toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private updateMeta() {
     if(this.giftCardCompany) {
        this.meta.updateTitle(this.getFormattedGiftCardCompany() + " €5 giftcard");
        this.meta.updateMetaInfo("Bespaar met deze giftcard €5 bij " + this.getFormattedGiftCardCompany(), "diski.nl", this.getFormattedGiftCardCompany() + ", Giftcard, Besparen, Tegoedbon");
     } else {
        this.meta.updateTitle("Diski €5 giftcards voor heel veel webshops");
        this.meta.updateMetaInfo("Bespaar met giftcards €5 bij heel veel webshops zoals Zalando, MyJewellery en Wehkamp", "diski.nl", "Tegoedbon, Giftcard, Besparen");
     }

     this.meta.setNoIndex();
  }

  sendGiftcardEventsToGa() {
    if (typeof gtag === 'function') {
      gtag('event', 'giftcard', {
        'event_category': 'Giftcard',
        'event_label': 'giftcard_page_actionbutton'
      });

      gtag('event', 'giftcard', {
        'event_category': 'Giftcard',
        'event_label': 'giftcard_page_actionbutton_' + this.giftCardCompany
      });
    } else {
      console.error('gtag is not defined');
    }
  }
}
