import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { DiscountsService } from '../services/discounts.service';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ModalComponent } from '../modal/modal.component';
import { RouterModule } from '@angular/router';

declare global {
  interface Window {
    sendCopyCodeToGa: (element_id_index: number) => void;
  }
}

interface Discount {
  company: string;
  discountCode: string;
  percentage: string;
  date: string;
  index: number;
}

interface Banner {
  href: string;
  imgSrc: string;
}

@Component({
  selector: 'app-discounts-table',
  imports: [FooterComponent, NavbarComponent, FormsModule, ModalComponent, RouterModule],
  templateUrl: './discounts-table.component.html',
  styleUrls: ['./discounts-table.component.css', './../app.component.css'],
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
  itemsPerPage: number = 50;
  isModalVisible = false;
  selectedDiscount: any = null;
  sortByCompanyAscending = false;
  sortByDateAscending = false;
  sendCopyCodeToGa = window.sendCopyCodeToGa;

  bannerMobile?: Banner;
  bannerDesktop?: Banner;

  private mobileBanners: Banner[] = [
    {
      href: 'https://www.awin1.com/cread.php?s=4350277&v=50509&q=567082&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4350277&v=50509&q=567082&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=3609838&v=8391&q=487802&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=3609838&v=8391&q=487802&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=4488641&v=102995&q=505249&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4488641&v=102995&q=505249&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=4492706&v=25897&q=579542&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4492706&v=25897&q=579542&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=4488599&v=77016&q=495582&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4488599&v=77016&q=495582&r=1870794'
    },
  ];

  private desktopBanners: Banner[] = [
    {
      href: 'https://www.awin1.com/cread.php?s=4489255&v=50509&q=469479&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4489255&v=50509&q=469479&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=3609840&v=8391&q=487802&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=3609840&v=8391&q=487802&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=4487546&v=47183&q=460552&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4487546&v=47183&q=460552&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=4492709&v=25897&q=579542&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4492709&v=25897&q=579542&r=1870794'
    },
    {
      href: 'https://www.awin1.com/cread.php?s=4488603&v=77016&q=495582&r=1870794',
      imgSrc: 'https://www.awin1.com/cshow.php?s=4488603&v=77016&q=495582&r=1870794'
    },
  ];

  constructor(private discountsService: DiscountsService, private affiliateLinkService: AffiliateLinkService,
                private meta: MetaService, private datePipe: DatePipe) {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Diski | Online shoppen met kortingscodes in " + monthYear);
    this.meta.updateMetaInfo("De nieuwste werkende kortingscodes van een groot aantal webshops; Bespaar op online shoppen in " + monthYear + " via diski.nl", "diski.nl", "Kortingscode, Korting");
  }

  ngOnInit() {
    this.bannerMobile = this.getRandomBanner(this.mobileBanners);
    this.bannerDesktop = this.getRandomBanner(this.desktopBanners);
    this.discountsService.getDiscounts().subscribe((data) => {
      this.discounts = data.map((line, index) => {
        const [company, discountCode, percentage, , date] = line.split(', ');
        return {
          company,
          discountCode,
          percentage,
          date,
          index: index
        };
      });
      this.filteredDiscounts = this.discounts;
      const queryParams = new URLSearchParams(window.location.search);
      if(queryParams.has('i')) {
        const index = Number(queryParams.get('i'));
        if (!isNaN(index) && index >= 0 && index < this.discounts.length) {
          this.openModal(this.discounts[index]);
        }
      }
    });
  }

  onSearch() {
    this.filteredDiscounts = this.discounts.filter((discount) =>
      discount.company.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.page = 1;
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
    const affiliateLink = this.affiliateLinkService.getAffiliateLink(discount.company);

    if(affiliateLink !== undefined) {
      this.openNewPageWithCodeDetailModal(discount.index, affiliateLink);
    } else {
      this.openModal(discount);
    }
  }

  openNewPageWithCodeDetailModal(codeTableIndex: number, affiliateLink: string) {
    var url = 'https://www.diski.nl?i=' + encodeURIComponent(codeTableIndex)
    window.open(url, '_blank');
    location.href = affiliateLink;
  }

  private getRandomBanner(banners: Banner[]): Banner {
    const index = Math.floor(Math.random() * banners.length);
    return banners[index];
  }
}
