import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { AnalyticsEventService } from '../services/analytics-event.service';

import { PrikbordModalComponent } from '../prikbord-modal/prikbord-modal.component';

declare global {
  interface Window {
    sendCopyCodeToGa: (element_id_index: number) => void;
  }
}

interface WhsEntry {
  webshop: string;
  code: string;
  percentage: number;
  date: string;
  added_by: string;
}

@Component({
  selector: 'app-prikbord',
  imports: [PrikbordModalComponent, FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './prikbord.component.html',
  styleUrls: ['./prikbord.component.css', './../app.component.css']
})
export class PrikbordComponent implements OnInit {
  wieheeftsaleData: WhsEntry[] = [];
  filteredWieheeftsaleData: WhsEntry[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 50;
  sortByCompanyAscending = false;
  sortByDateAscending = false;
  sendCopyCodeToGa = window.sendCopyCodeToGa;

  constructor(private meta: MetaService, private http: HttpClient, private analyticsEventService: AnalyticsEventService) {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Overzicht van actuele sales en aanbiedingen in " + monthYear + " | Diski")
    this.meta.updateMetaInfo("Bekijk de nieuwste sales en aanbiedingen van populaire webshops. Bespaar eenvoudig online in " + monthYear + " via diski.nl.", "diski.nl", "kortingscode, korting, sale, aanbiedingen");
  }

  ngOnInit() {
    this.readDataFromSheet();
    this.meta.setNoIndex();
  }

  readDataFromSheet() {
    const url = 'https://docs.google.com/spreadsheets/d/1TsBlQr5KrB3g6rbtwr0ujLoFfi41XBwBgimMCyQBl9w/gviz/tq?tqx=out:json';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const json = JSON.parse(response.replace(/^[^\(]*\(/, '').replace(/\);$/, ''));
      const table = json.table;

      this.wieheeftsaleData = table.rows.map((row: any) => {
        const cells = row.c.map((cell: any) => cell?.v ?? '');
        const [webshop, code, percentage, date, added_by] = cells;

        return {
          webshop,
          code,
          percentage: +percentage,
          date,
          added_by,
        } as WhsEntry;
      }).reverse();
      this.filteredWieheeftsaleData = this.wieheeftsaleData;
    });
  }

  onSearch() {
    this.filteredWieheeftsaleData = this.wieheeftsaleData.filter((whsEntry) =>
      whsEntry.webshop.toLowerCase().includes(this.searchTerm.toLowerCase())
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
      const comparison = a.webshop.localeCompare(b.webshop);
      return this.sortByCompanyAscending ? comparison : -comparison;
    });
  }

  openUrlInNewTab(url: string) {
    window.open(url, '_blank');
  }

  sendEventToGa(eventName: string, eventLabel: string): void {
    var eventLabelToUse = "whs_company_click_" + eventLabel.toLowerCase();
    this.analyticsEventService.sendEventToGa(eventName, eventLabelToUse);
  }


  //////


  webhookUrl = 'https://script.google.com/macros/s/AKfycbzEMMokt67Oz0PwOHEKHwxyZLpw0rwfVyzCXnerdNSwrxf4pKX6pz9_-KX48APoe_AX/exec';
  modalVisible = false;

  showModal() {
      this.modalVisible = true;
    }

    onCodeAdded(newCode: any) {
      console.log('Nieuwe kortingscode:', newCode);

      // Voeg hier je logica toe om de nieuwe kortingscode op te slaan, bijv. in array of server

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      const body = new HttpParams()
        .set('webshop', newCode.webshop)
        .set('code', newCode.code)
        .set('percentage', newCode.percentage)
        .set('date', newCode.date)
        .set('name', newCode.name);

      this.http.post(this.webhookUrl, body.toString(), { headers, responseType: 'text' })
        .subscribe({
          next: () => {},
          error: (err) => {
            console.error(err);
          },
        });
    }

}
