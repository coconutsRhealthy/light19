import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { CommunityModalComponent } from '../community-modal/community-modal.component';

@Component({
  selector: 'app-community',
  imports: [CommunityModalComponent],
  templateUrl: './community.component.html',
  styleUrls: ['./../app.component.css']
})
export class CommunityComponent implements OnInit {
  webhookUrl = 'https://script.google.com/macros/s/AKfycbzEMMokt67Oz0PwOHEKHwxyZLpw0rwfVyzCXnerdNSwrxf4pKX6pz9_-KX48APoe_AX/exec';
  rows: string[][] = [];
  headers: string[] = [];
  modalVisible = false;

    newRow = {
      webshop: '',
      code: '',
      percentage: '',
      date: '',
      name: ''
    };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.readDataFromSheet();
  }

  readDataFromSheet() {
    const url = 'https://docs.google.com/spreadsheets/d/1TsBlQr5KrB3g6rbtwr0ujLoFfi41XBwBgimMCyQBl9w/gviz/tq?tqx=out:json';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const json = JSON.parse(response.replace(/^[^\(]*\(/, '').replace(/\);$/, ''));
      const table = json.table;

      this.headers = table.cols.map((col: any) => col.label);
      this.rows = table.rows.map((row: any) =>
        row.c.map((cell: any) => {
          const raw = cell?.v ?? '';

          const dateMatch = typeof raw === 'string' && raw.match(/^Date\((\d+),(\d+),(\d+)\)$/);
          if (dateMatch) {
            const [_, year, month, day] = dateMatch;
            const jsDate = new Date(+year, +month, +day);
            return jsDate.toLocaleDateString('nl-NL');
          }

          return raw;
        })
      );
    });
  }

  addRow() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new HttpParams()
      .set('webshop', this.newRow.webshop)
      .set('code', this.newRow.code)
      .set('percentage', this.newRow.percentage)
      .set('date', this.newRow.date)
      .set('name', this.newRow.name);

    this.http.post(this.webhookUrl, body.toString(), { headers, responseType: 'text' })
      .subscribe({
        next: () => alert('Added!'),
        error: (err) => {
          console.error(err);
          alert('Something went wrong');
        },
      });
  }

  showModal() {
    this.modalVisible = true;
  }
}
