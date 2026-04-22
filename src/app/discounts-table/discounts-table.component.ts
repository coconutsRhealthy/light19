import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { DiscountsService } from '../services/discounts.service';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { VisitorProfileService } from '../services/visitor-profile.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ModalComponent } from '../modal/modal.component';
import { ModalShopsComponent } from '../modal-shops/modal-shops.component';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    sendCopyCodeToGa: (company: string) => void;
  }
}

interface Discount {
  company: string;
  discountCode: string;
  percentage: string;
  influencer: string;
  date: string;
  index: number;
  affiliateLink?: string | null;
}

@Component({
  selector: 'app-discounts-table',
  imports: [FooterComponent, NavbarComponent, FormsModule, ModalComponent, ModalShopsComponent, RouterModule],
  templateUrl: './discounts-table.component.html',
  styleUrls: ['./discounts-table.component.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'nl' },
  ]
})
export class DiscountsTableComponent implements OnInit {
  discounts: Discount[] = [];
  filteredDiscounts: Discount[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 18;
  isModalVisible = false;
  selectedDiscount: any = null;
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

  constructor(private discountsService: DiscountsService, private affiliateLinkService: AffiliateLinkService, private analyticsEventService: AnalyticsEventService,
                private meta: MetaService, private datePipe: DatePipe, private logosService: LogosService, private route: ActivatedRoute,
                private visitorProfile: VisitorProfileService) {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Diski | Online shoppen met kortingscodes in " + monthYear);
    this.meta.updateMetaInfo("De nieuwste werkende kortingscodes van een groot aantal webshops; Bespaar op online shoppen in " + monthYear + " via diski.nl", "diski.nl", "Kortingscode, Korting");
  }

  ngOnInit() {
    this.initialPageLoad = true;

    if (this.isBrowser && window.innerWidth < 768) {
      this.itemsPerPage = 18;
    } else {
      this.itemsPerPage = 30;
    }

    this.discountsService.getDiscounts().subscribe((data) => {
      this.discounts = data.map((line, index) => {
        const [company, discountCode, percentage, influencer, date] = line.split(', ');
        return {
          company,
          discountCode,
          percentage,
          influencer,
          date,
          index: index
        };
      });
      this.filteredDiscounts = this.discounts;
      this.updateLatestDiscountInfo();

      this.route.fragment.subscribe(fragment => {
        if (!fragment) return;

        const params = new URLSearchParams(fragment);
        if (params.has('i')) {
          const index = Number(params.get('i'));

          if (!isNaN(index) && index >= 0 && index < this.discounts.length) {
            const item = this.discounts[index];

            item.affiliateLink = this.affiliateLinkService.getAffiliateLink(item.company);
            this.openModal(item);
          }
        }
      });

      this.initialPageLoad = false;
    });

    this.logosService.getAllLogos().subscribe(data => {
      this.logos = data;
    });

    if(this.isBrowser) {
        this.fillBolVariables()
    }
  }

  onSearch() {
    const normalizedSearchTerm = this.searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');

    this.filteredDiscounts = this.discounts.filter((discount) => {
      const normalizedCompany = discount.company.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedCompany.includes(normalizedSearchTerm);
    });

    this.page = 1;

    if (this.searchTerm.length >= 5 || normalizedSearchTerm === 'temu') {
      const termToSend = normalizedSearchTerm.slice(0, 5);
      if (termToSend !== this.lastSentTerm) {
        this.lastSentTerm = termToSend;
        this.visitorProfile.trackSearch(termToSend);
        this.analyticsEventService.sendEventToGa("Search_typing", "search_typing_" + termToSend);
      }
    }
  }

  get paginatedDiscounts(): Discount[] {
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

  openModal(discount: any) {
    this.selectedDiscount = discount;
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedDiscount = null;
  }

  openShopsModal() {
    this.isShopsModalVisible = true;
  }

  closeShopsModal() {
    this.isShopsModalVisible = false;
  }

  formatDate(date: string): string {
    const formattedDate = this.getDateFromDateString(date);
    return this.datePipe.transform(formattedDate, 'd MMM') ?? '';
  }

  getDateFromDateString(dateString: string) {
    dateString = dateString + "";
    var dateStringArray = dateString.split("-");
    var month = Number(dateStringArray[0]) - 1;
    var day = Number(dateStringArray[1]);
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, month, day);
  }

  sortByCompany() {
    this.sortByCompanyAscending = !this.sortByCompanyAscending;
    this.filteredDiscounts.sort((a, b) => {
      const comparison = a.company.localeCompare(b.company);
      return this.sortByCompanyAscending ? comparison : -comparison;
    });
  }

  sortByDate() {
    this.sortByDateAscending = !this.sortByDateAscending;
    this.filteredDiscounts.sort((a, b) => {
      const dateA = this.getDateFromDateString(a.date);
      const dateB = this.getDateFromDateString(b.date);

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      const adjustedDateA = (dateA.getMonth() === 0 || dateA.getMonth() === 1 || dateA.getMonth() === 2) &&
        (dateB.getMonth() === 11 || dateB.getMonth() === 10 || dateB.getMonth() === 9)
        ? new Date(nextYear, dateA.getMonth(), dateA.getDate())
        : new Date(currentYear, dateA.getMonth(), dateA.getDate());

      const adjustedDateB = (dateB.getMonth() === 0 || dateB.getMonth() === 1 || dateB.getMonth() === 2) &&
        (dateA.getMonth() === 11 || dateA.getMonth() === 10 || dateA.getMonth() === 9)
        ? new Date(nextYear, dateB.getMonth(), dateB.getDate())
        : new Date(currentYear, dateB.getMonth(), dateB.getDate());

      return this.sortByDateAscending
        ? adjustedDateA.getTime() - adjustedDateB.getTime()
        : adjustedDateB.getTime() - adjustedDateA.getTime();
    });
  }

  affiliateModalAction(discount: Discount) {
    this.visitorProfile.trackCompanyClick('company_click_homepage', discount.company);

    const affiliateLink = this.affiliateLinkService.getAffiliateLink(discount.company);

    if(affiliateLink !== undefined) {
      this.openNewPageWithCodeDetailModal(discount.index, affiliateLink);
    } else {
      this.openModal(discount);
    }
  }

  openNewPageWithCodeDetailModal(codeTableIndex: number, affiliateLink: string) {
    if (!this.isBrowser) return;

    const baseUrl = window.location.origin;
    const url = `${baseUrl}#i=${encodeURIComponent(codeTableIndex)}`;

    window.open(url, '_blank');
    location.href = affiliateLink;
  }

  getCorrectFormatDiscountPercentage(rawDiscountPercentage: string): string {
    if(!rawDiscountPercentage.includes("€") && !rawDiscountPercentage.includes("vzk") && !rawDiscountPercentage.includes("gifts")) {
      rawDiscountPercentage = rawDiscountPercentage + "%";
    }

    return rawDiscountPercentage;
  }

  getLogoUrl(companyName: string): string | undefined {
    const cleanName = companyName.replace(/\s*\(.*$/, '');
    return this.logos[cleanName];
  }

  toggleNewlookBanner() {
    this.isNewlookBannerExpanded = !this.isNewlookBannerExpanded;
  }

  closeNewlookBanner(event: MouseEvent) {
    event.stopPropagation();
    this.isNewlookBannerVisible = false;
  }

  isBlackFriday(discount: any): boolean {
    return discount?.influencer?.startsWith('BF_');
  }

  getBlackFridayButtonClasses(index: number) {
     if(index < 6) {
         return "tw-w-full tw-rounded-2xl tw-p-3 lg:tw-p-4 tw-flex tw-justify-between tw-items-center tw-text-left tw-h-full tw-border tw-border-yellow-400 tw-shadow-lg active:tw-scale-[0.98] tw-transition-all tw-duration-200";
     } else {
        return "tw-w-full tw-bg-white tw-rounded-2xl tw-shadow-md hover:tw-shadow-lg active:tw-scale-[0.98] tw-transition-all tw-duration-200 tw-p-3 lg:tw-p-4 tw-flex tw-justify-between tw-items-center tw-border tw-border-gray-100 tw-text-left tw-h-full"
     }
  }

  getBlackFridaySpottedAtTextClasses(index: number) {
      if(index < 6) {
          return "tw-text-xs tw-mt-1 tw-text-gray-700";
      } else {
          return "tw-text-xs tw-text-gray-400 tw-mt-1";
      }
  }

  updateLatestDiscountInfo(): void {
    if (this.discounts.length === 0) return;
    const lastUpdated = this.discounts[0].date;
    this.dateStringLatestShops = this.formatDate(lastUpdated);

    const shopsOnLatestDate = this.discounts
      .filter(d => d.date === lastUpdated && !d.discountCode.startsWith('http'))
      .map(d => {
        let name = d.company.trim();
        name = name.replace(/\s*\(.*?\)/g, '');
        return name;
      });

    this.latestShops = Array.from(new Set(shopsOnLatestDate)).sort((a, b) => a.localeCompare(b));
    this.newShopsCount = this.latestShops.length;
  }

  get sendCopyCodeToGa() {
    if (this.isBrowser) {
      return window.sendCopyCodeToGa;
    }
    return () => {};
  }

  sendCompanyClickToFb(company: string): void {
    if (this.isBrowser && typeof (window as any).fbq === 'function') {
      (window as any).fbq('trackCustom', 'CompanyClickHomepage', { company });
    }
  }

  fillBolVariables() {

    const banners = [
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fl%2Fbabyspullen%2F11271%2F&f=BAN&name=Baby&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Baby-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Baby&subid=",
            type: "baby",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fl%2Fhuishouden%2F12001%2F&f=BAN&name=Huishouden&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Housekeeping-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Huishouden&subid=",
            type: "huishouden",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fsf%2Fkokenentafelen%2F&f=BAN&name=Koken&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Koken-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Koken&subid=",
            type: "koken",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fl%2Fverzorgingsproducten%2F12442%2F&f=BAN&name=Dagelijkse%20verzorging&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Personalcare-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Dagelijkse%20verzorging&subid=",
            type: "dagelijkseverzorging",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fsf%2Fwooninspiratie%2F&f=BAN&name=Wonen&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Living-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Wonen&subid=",
            type: "wonen",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fsf%2Fnieuwecollectie%2F&f=BAN&name=Mode&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Mode-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Mode&subid=",
            type: "mode",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fcmp%2Fdrogisterijdeals%2F1916%2F&f=BAN&name=Dagelijkse%20inkopen&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Bulk-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Dagelijkse%20inkopen&subid=",
            type: "dagelijkseinkopen",
        },
    ];

    const randomBanner = banners[Math.floor(Math.random() * banners.length)];

    this.bolHref = randomBanner.href;
    this.bolImgSrc = randomBanner.imgSrc;
    this.bolPixelSrc = randomBanner.pixelSrc;
    this.bolType = randomBanner.type;
  }

  sendBolEventToGa(): void {
    this.analyticsEventService.sendEventToGa(
      'Bolbanner',
      'bolbanner_' + this.bolType
    );
  }
}
