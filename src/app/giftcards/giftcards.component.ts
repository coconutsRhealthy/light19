import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiscountsService } from '../services/discounts.service';

interface Discount {
  company: string;
  discountCode: string;
  percentage: string;
  date: string;
  index: number;
}

@Component({
  selector: 'app-giftcards',
  imports: [FormsModule],
  templateUrl: './giftcards.component.html',
  styleUrls: ['./../app.component.css', './../app-tailwind.component.css']
})
export class GiftcardsComponent implements OnInit {
  discounts: Discount[] = [];
  originalOrder: Discount[] = [];
  loading = true;
  sortMode: 'popular' | 'alphabetical' = 'popular';

  constructor(private discountsService: DiscountsService) {}

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
}
