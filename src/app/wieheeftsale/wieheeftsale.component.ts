import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

declare global {
  interface Window {
    sendCopyCodeToGa: (element_id_index: number) => void;
  }
}

interface WhsEntry {
  company: string;
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
  page: number = 1;
  itemsPerPage: number = 50;
  sortByCompanyAscending = false;
  sortByDateAscending = false;
  sendCopyCodeToGa = window.sendCopyCodeToGa;

  constructor(private meta: MetaService, private http: HttpClient) {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Overzicht van actuele sales en aanbiedingen in " + monthYear + " | Diski")
    this.meta.updateMetaInfo("Bekijk de nieuwste sales en aanbiedingen van populaire webshops. Bespaar eenvoudig online in " + monthYear + " via diski.nl.", "diski.nl", "kortingscode, korting, sale, aanbiedingen");
  }

  ngOnInit() {
    this.readDataFromSheet();
  }

  readDataFromSheet() {
    const url = 'https://docs.google.com/spreadsheets/d/1giW6eqsJZ2w6DO-8f3oiZYaQ4HN3tt2pdS5Lt0XkYJ0/gviz/tq?tqx=out:json';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const json = JSON.parse(response.replace(/^[^\(]*\(/, '').replace(/\);$/, ''));
      const table = json.table;

      this.wieheeftsaleData = table.rows.slice(1).map((row: any) => {
        const cells = row.c.map((cell: any) => cell?.v ?? '');
        return {
          company: cells[0],
          url: cells[1]
        } as WhsEntry;
      });
      this.filteredWieheeftsaleData = this.wieheeftsaleData;
    });
  }

  onSearch() {
    this.filteredWieheeftsaleData = this.wieheeftsaleData.filter((whsEntry) =>
      whsEntry.company.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.page = 1;
  }

  get paginatedWhsEntries(): WhsEntry[] {
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

  sortByCompany() {
    this.sortByCompanyAscending = !this.sortByCompanyAscending;
    this.filteredWieheeftsaleData.sort((a, b) => {
      const comparison = a.company.localeCompare(b.company);
      return this.sortByCompanyAscending ? comparison : -comparison;
    });
  }

  openUrlInNewTab(url: string) {
    window.open(url, '_blank');
  }
}
