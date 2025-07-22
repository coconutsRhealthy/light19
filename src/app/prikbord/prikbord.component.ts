import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetaService } from '../services/meta.service';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { PrikbordModalComponent } from '../prikbord-modal/prikbord-modal.component';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { DatePipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';


declare global {
  interface Window {
    sendCopyCodeToGa: (element_id_index: number) => void;
  }
}

interface PrikbordEntry {
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
  styleUrls: ['./prikbord.component.css', './../app.component.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'nl' },
  ]
})
export class PrikbordComponent implements OnInit {
  prikbordData: PrikbordEntry[] = [];
  filteredprikbordData: PrikbordEntry[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 50;
  sortByCompanyAscending = false;
  sortByDateAscending = false;
  sendCopyCodeToGa = window.sendCopyCodeToGa;
  webhookUrl = 'https://script.google.com/macros/s/AKfycbzEMMokt67Oz0PwOHEKHwxyZLpw0rwfVyzCXnerdNSwrxf4pKX6pz9_-KX48APoe_AX/exec';
  modalVisible = false;

  constructor(private meta: MetaService, private http: HttpClient, private analyticsEventService: AnalyticsEventService, private datePipe: DatePipe) {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Voeg je kortingscode toe en bespaar samen meer – Prikbord | Diski")
    this.meta.updateMetaInfo("Gespot? Deel je kortingscode op het prikbord van Diski en help anderen besparen. Ontdek zelf ook nieuwe codes die net gedeeld zijn!", "diski.nl", "kortingscode, korting, kortingscode toevoegen, kortingscode delen, kortingscode zoeken, diski prikbord");
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

      this.prikbordData = table.rows.map((row: any) => {
        const cells = row.c.map((cell: any) => cell?.v ?? '');
        const [webshop, code, percentage, rawDate, added_by] = cells;
        const date = this.parseGoogleDate(rawDate);

        return {
          webshop,
          code,
          percentage: +percentage,
          date,
          added_by,
        } as PrikbordEntry;
      }).reverse();
      this.filteredprikbordData = this.prikbordData;
    });
  }

  onCodeAdded(newCode: any) {
    console.log('Nieuwe kortingscode:', newCode);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new HttpParams()
      .set('webshop', newCode.webshop)
      .set('code', newCode.code)
      .set('percentage', newCode.percentage)
      .set('date', new Date().toLocaleString('sv-SE'))
      .set('name', newCode.name);

    this.http.post(this.webhookUrl, body.toString(), { headers, responseType: 'text' })
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error(err);
        },
      });
  }

  onSearch() {
    this.filteredprikbordData = this.prikbordData.filter((PrikbordEntry) =>
      PrikbordEntry.webshop.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.page = 1;
  }

  get paginatedPrikbordEntries(): PrikbordEntry[] {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredprikbordData.slice(start, end);
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredprikbordData.length / this.itemsPerPage);
  }

  sortByCompany() {
    this.sortByCompanyAscending = !this.sortByCompanyAscending;
    this.filteredprikbordData.sort((a, b) => {
      const comparison = a.webshop.localeCompare(b.webshop);
      return this.sortByCompanyAscending ? comparison : -comparison;
    });
  }

  formatDate(date: string): string {
    const formattedDate = this.getDateFromDateString(date);
    return this.datePipe.transform(formattedDate, 'd MMM') ?? '';
  }

  getDateFromDateString(dateString: string) {
    const dateOnly = dateString.split(' ')[0];
    return new Date(dateOnly);
  }

  sendEventToGa(eventName: string, eventLabel: string): void {
    var eventLabelToUse = "prikbord_" + eventLabel.toLowerCase();
    this.analyticsEventService.sendEventToGa(eventName, eventLabelToUse);
  }

  showModal() {
    this.modalVisible = true;
  }

  parseGoogleDate(value: any): string {
    if (typeof value === 'string' && value.startsWith('Date(')) {
      const dateParts = value.match(/\d+/g)?.map(Number);
      if (dateParts && dateParts.length >= 3) {
        const date = new Date(
          dateParts[0],         // year
          dateParts[1],         // month (0-based)
          dateParts[2],         // day
          dateParts[3] || 0,    // hours
          dateParts[4] || 0,    // minutes
          dateParts[5] || 0     // seconds
        );
        // Format to "YYYY-MM-DD HH:mm:ss"
        return date.toLocaleString('sv-SE', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false
        }).replace('T', ' ');
      }
    }
    return value;
  }

  sortByDate() {
    this.sortByDateAscending = !this.sortByDateAscending;
    this.filteredprikbordData.sort((a, b) => {
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
}
