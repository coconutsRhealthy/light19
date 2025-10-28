import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiscountsService } from '../services/discounts.service';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

interface Discount {
  company: string;
  discountCode: string;
  percentage: string;
  date: string;
  index: number;
}

@Component({
  selector: 'app-giftcards',
  imports: [FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './giftcards.component.html',
  styleUrls: ['./../app.component.css', './../app-tailwind.component.css']
})
export class GiftcardsComponent implements OnInit {
  discounts: Discount[] = [];
  originalOrder: Discount[] = [];
  loading = true;
  sortMode: 'popular' | 'alphabetical' = 'popular';

  constructor(private discountsService: DiscountsService, private analyticsEventService: AnalyticsEventService, private meta: MetaService) {
    this.meta.updateTitle("€7,50 Giftcards voor Populaire Webshops | Diski.nl");
    this.meta.updateMetaInfo(
      "Ontvang direct €7,50 giftcards voor jouw favoriete webshops via Diski.nl. Bekijk de volledige lijst van populaire shops en claim je cadeaubon eenvoudig online!",
      "diski.nl",
      "giftcards, €7,50 giftcard, populaire webshops, cadeaubon, online shop, korting, Diski"
    );
  }

  ngOnInit() {
    this.discountsService.getDiscounts().subscribe({
      next: (data) => {
        const parsed = data
          .map((line: string, index: number) => {
            const [company, discountCode, percentage, , date] = line
              .split(',')
              .map((p) => p.trim());
            return { company, discountCode, percentage, date, index };
          })
          .filter((d) => d.discountCode.startsWith('http'));

        this.discounts = [...parsed];
        this.originalOrder = [...parsed];
        this.loading = false;
      },
      error: (err) => {
        console.error('Fout bij laden van kortingen:', err);
        this.loading = false;
      },
    });
  }

  onSortChange(mode: 'popular' | 'alphabetical'): void {
    this.sortMode = mode;

    if (mode === 'alphabetical') {
      this.discounts = [...this.discounts].sort((a, b) =>
        a.company.localeCompare(b.company)
      );
    } else {
      this.discounts = [...this.originalOrder];
    }
  }

  sendEventToGa(eventName: string, eventLabel: string, url: string = ''): void {
    let eventLabelToUse: string;

    if (url.includes('foldersnl')) {
      eventLabelToUse = 'giftcards_page_cashback_' + eventLabel.toLowerCase();
    } else {
      eventLabelToUse = 'giftcards_page_' + eventLabel.toLowerCase();
    }

    this.analyticsEventService.sendEventToGa(eventName, eventLabelToUse);
  }
}
