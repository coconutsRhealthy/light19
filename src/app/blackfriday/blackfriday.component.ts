import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { isPlatformBrowser } from '@angular/common';


interface WebshopKorting {
  webshop_name: string;
  url: string;
  korting_text: string;
  korting_text_nl: string;
  date: string;
}

@Component({
  selector: 'app-blackfriday',
  imports: [FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './blackfriday.component.html',
  styleUrls: ['./blackfriday.component.css', './../app.component.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'nl' },
  ]
})
export class BlackfridayComponent implements OnInit {

  private jsonUrl = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/spotted_promotions.json';

  discounts: WebshopKorting[] = [];
  filteredDiscounts: WebshopKorting[] = [];
  searchTerm: string = '';
  logos: { [companyName: string]: string } = {};
  initialPageLoad = true;

  constructor(
    private http: HttpClient,
    private affiliateLinkService: AffiliateLinkService,
    private meta: MetaService,
    private datePipe: DatePipe,
    private logosService: LogosService
  ) {
    const monthYear = this.meta.getDateString();
    this.meta.updateTitle("Overzicht van actuele sales en aanbiedingen in " + monthYear + " | Diski")
    this.meta.updateMetaInfo("Bekijk de nieuwste sales en aanbiedingen van populaire webshops. Bespaar eenvoudig online in " + monthYear + " via diski.nl.", "diski.nl", "kortingscode, korting, sale, aanbiedingen");
  }

  ngOnInit() {
    this.initialPageLoad = true;

    const urlWithNoCache = `${this.jsonUrl}?t=${new Date().getTime()}`;

    this.http.get<WebshopKorting[]>(urlWithNoCache).subscribe((data) => {
      this.discounts = data.map((item) => {
        const affiliateLink = this.affiliateLinkService.getAffiliateLink(item.webshop_name);
        return {
          ...item,
          url: affiliateLink || item.url  // <-- hier vervangen we de url
        };
      });

      this.filteredDiscounts = [...this.discounts];
      this.initialPageLoad = false;
    });

    this.logosService.getAllLogos().subscribe(data => {
      this.logos = data;
    });
  }

    onSearch() {
      const normalizedSearchTerm = this.searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');

      this.filteredDiscounts = this.discounts.filter((discount) => {
        const normalizedCompany = discount.webshop_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizedCompany.includes(normalizedSearchTerm);
      });
    }

    formatDate(date: string): string {
      return this.datePipe.transform(new Date(date), 'd MMM') ?? '';
    }

  getLogoUrl(companyName: string): string | undefined {
    const cleanName = companyName.replace(/\s*\(.*$/, '');
    return this.logos[cleanName];
  }
}
