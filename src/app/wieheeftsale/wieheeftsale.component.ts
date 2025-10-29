import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from '@angular/common/http';
import { AnalyticsEventService } from '../services/analytics-event.service';

interface WhsEntry {
  company: string;
  date: string;
  img: string;
  url: string;
}

@Component({
  selector: 'app-wieheeftsale',
  imports: [FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './wieheeftsale.component.html',
  styleUrls: ['./wieheeftsale.component.css', './../app.component.css']
})
export class WieheeftsaleComponent implements OnInit {
  wieheeftsaleData: WhsEntry[] = [];
  filteredWieheeftsaleData: WhsEntry[] = [];
  searchTerm: string = '';
  h1Title: string = '';
  page: number = 1;
  itemsPerPage: number = 21;

  constructor(private meta: MetaService, private http: HttpClient, private analyticsEventService: AnalyticsEventService) {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Overzicht van actuele sales en aanbiedingen in " + monthYear + " | Diski")
    this.meta.updateMetaInfo("Bekijk de nieuwste sales en aanbiedingen van populaire webshops. Bespaar eenvoudig online in " + monthYear + " via diski.nl.", "diski.nl", "kortingscode, korting, sale, aanbiedingen");
    this.h1Title = "Nieuwe aanbiedingen & kortingen – " + monthYear;
  }

  ngOnInit() {
    this.readDataFromSheet();
  }

  readDataFromSheet() {
    const url = 'https://docs.google.com/spreadsheets/d/1giW6eqsJZ2w6DO-8f3oiZYaQ4HN3tt2pdS5Lt0XkYJ0/gviz/tq?tqx=out:json&sheet=Banners';

    this.http.get(url, { responseType: 'text' }).subscribe((response) => {
      const json = JSON.parse(response.replace(/^[^\(]*\(/, '').replace(/\);$/, ''));
      const table = json.table;

      this.wieheeftsaleData = table.rows.slice(1).map((row: any) => {
        const cells = row.c.map((cell: any) => cell?.v ?? '');
        return {
          company: cells[0],
          date: cells[1],
          img: cells[2],
          url: cells[3]
        } as WhsEntry;
      });
      this.filteredWieheeftsaleData = this.wieheeftsaleData;
    });
  }

  onSearch() {
    this.filteredWieheeftsaleData = this.wieheeftsaleData.filter((entry) =>
      entry.company.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openUrlInNewTab(entry: WhsEntry) {
    window.open(entry.url, '_blank');
    this.analyticsEventService.sendEventToGa('click', `whs_company_click_${entry.company.toLowerCase()}`);
  }

  get paginatedWieheeftsaleEntries(): WhsEntry[] {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredWieheeftsaleData.slice(start, end);
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredWieheeftsaleData.length / this.itemsPerPage);
  }
}
