import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AffiliateLinkService } from '../services/affiliate-link.service';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


interface WebshopKorting {
  webshop_name: string;
  url: string;
  korting_text: string;
  korting_text_nl: string;
  date: string;
}

@Component({
  selector: 'app-wieheeftsale',
  imports: [FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './wieheeftsale.component.html',
  styleUrls: ['./wieheeftsale.component.css', './../app.component.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'nl' },
  ]
})
export class WieheeftsaleComponent implements OnInit {

  private jsonUrl = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/spotted_promotions.json';

  discounts: WebshopKorting[] = [];
  filteredDiscounts: WebshopKorting[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 18;

  isModalVisible = false;
  selectedDiscount: WebshopKorting | null = null;

  sortByCompanyAscending = false;
  sortByDateAscending = false;

  logos: { [companyName: string]: string } = {};

  isNewlookBannerExpanded = false;
  isNewlookBannerVisible = true;

  initialPageLoad = true;
  lastSentTerm: string = '';

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private platformId = inject(PLATFORM_ID);

  dateStringLatestShops: string = '';
  newShopsCount: number = 0;
  latestShops: string[] = [];
  isShopsModalVisible: boolean = false;

  bolHref!: string;
  bolImgSrc!: string;
  bolPixelSrc!: string;
  bolType!: string;

  constructor(
    private http: HttpClient,
    private affiliateLinkService: AffiliateLinkService,
    private analyticsEventService: AnalyticsEventService,
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

    this.itemsPerPage = (this.isBrowser && window.innerWidth < 768) ? 18 : 30;

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

      this.page = 1;

      if (this.searchTerm.length >= 5) {
        const termToSend = normalizedSearchTerm.slice(0, 5);
        if (termToSend !== this.lastSentTerm) {
          this.lastSentTerm = termToSend;
          this.analyticsEventService.sendEventToGa("Search_typing", "search_typing_" + termToSend);
        }
      }
    }

    get paginatedDiscounts(): WebshopKorting[] {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredDiscounts.slice(start, end);
    }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDiscounts.length / this.itemsPerPage);
  }

    formatDate(date: string): string {
      return this.datePipe.transform(new Date(date), 'd MMM') ?? '';
    }

    sortByCompany() {
      this.sortByCompanyAscending = !this.sortByCompanyAscending;

      this.filteredDiscounts.sort((a, b) => {
        const comparison = a.webshop_name.localeCompare(b.webshop_name);
        return this.sortByCompanyAscending ? comparison : -comparison;
      });
    }

  sortByDate() {
    this.sortByDateAscending = !this.sortByDateAscending;

    this.filteredDiscounts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return this.sortByDateAscending
        ? dateA - dateB
        : dateB - dateA;
    });
  }

  getLogoUrl(companyName: string): string | undefined {
    const cleanName = companyName.replace(/\s*\(.*$/, '');
    return this.logos[cleanName];
  }
}
