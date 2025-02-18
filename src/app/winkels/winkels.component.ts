import { Component, OnInit } from '@angular/core';
import { DiscountsService } from '../services/discounts.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-winkels',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './winkels.component.html',
  styleUrls: ['./winkels.component.css', './../app.component.css']
})
export class WinkelsComponent implements OnInit {

  groupedWinkels: { letter: string, winkels: string[] }[];

  isMenuCollapsed = true;

  ngOnInit(): void {
    this.discountsService.getDiscounts().subscribe((data) => {
      const combinedWinkels = Array.from(
        new Set(
          data.map((line) => {
            const [company] = line.split(', ');
            return company;
          })
        )
      );

      const winkels = this.removePartsInBracketsAndDoubleEntries(combinedWinkels);
      this.groupedWinkels = this.groupWinkelsByLetter(winkels);
    });
  }

  constructor(private discountsService: DiscountsService, private meta: MetaService) {

  }

  groupWinkelsByLetter(winkels: string[]): { letter: string, winkels: string[] }[] {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Alle winkels met kortingscodes in " + monthYear);
    this.meta.updateMetaInfo("Overzicht van webshops met werkende kortingscodes in " + monthYear + "; Bespaar met deze kortingscodes op online shoppen via diski.nl", "diski.nl", "Kortingscode, Korting");

    const groupedWinkels: { letter: string, winkels: string[] }[] = [];

    winkels.sort((a, b) => a.localeCompare(b));

    winkels.forEach((winkel) => {
      const firstLetter = winkel.charAt(0).toUpperCase();
      const group = groupedWinkels.find((g) => g.letter === firstLetter);

      if (group) {
        group.winkels.push(winkel);
      } else {
        groupedWinkels.push({ letter: firstLetter, winkels: [winkel] });
      }
    });

    return groupedWinkels;
  }

  removePartsInBracketsAndDoubleEntries(combinedWinkels) {
    const seen = new Set<string>();
    return combinedWinkels.map(shop => {
        const index = shop.indexOf(" (");
        return index !== -1 ? shop.substring(0, index) : shop;
    })
    .filter(shop => {
        if (seen.has(shop)) {
            return false;
        } else {
            seen.add(shop);
            return true;
        }
    });
  }
}
