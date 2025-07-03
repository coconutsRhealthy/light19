import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

import { WieheeftsaleService } from '../services/wieheeftsale.service';

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

  constructor(private meta: MetaService, private wieheeftsaleService: WieheeftsaleService) {
    var monthYear = this.meta.getDateString();
    this.meta.updateTitle("Diski | Online shoppen met kortingscodes in " + monthYear);
    this.meta.updateMetaInfo("De nieuwste werkende kortingscodes van een groot aantal webshops; Bespaar op online shoppen in " + monthYear + " via diski.nl", "diski.nl", "Kortingscode, Korting");
  }

  ngOnInit() {
    this.wieheeftsaleService.getWieheeftsaleLinks().subscribe((data) => {
      this.wieheeftsaleData = Object.entries(data).map(([company, url]) => ({
        company,
        url
      }));
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
