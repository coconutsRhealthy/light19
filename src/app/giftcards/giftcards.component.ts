import { Component, OnInit } from '@angular/core';
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
  imports: [],
  templateUrl: './giftcards.component.html',
  styleUrls: ['./../app.component.css', './../app-tailwind.component.css']
})
export class GiftcardsComponent implements OnInit {
  discounts: Discount[] = [];
  loading = true;

  constructor(private discountsService: DiscountsService) {}

  ngOnInit() {
    this.discountsService.getDiscounts().subscribe({
      next: (data) => {
        this.discounts = data
          .map((line: string, index: number) => {
            const [company, discountCode, percentage, , date] = line
              .split(',')
              .map((p) => p.trim());
            return { company, discountCode, percentage, date, index };
          })
          .filter((d) => d.discountCode.startsWith('http'));

        this.loading = false;
      },
      error: (err) => {
        console.error('Fout bij laden van kortingen:', err);
        this.loading = false;
      },
    });
  }
}
