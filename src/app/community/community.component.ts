import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-community',
  imports: [],
  templateUrl: './community.component.html',
  styleUrls: ['./../app.component.css']
})
export class CommunityComponent implements OnInit {

  webhookUrl = 'https://script.google.com/macros/s/AKfycbwtzvmRMxK8GklpS_z3W8DvPd9sNRAKazy8FPRC0k80cgKYAEQ_Sny073hUH7rp8fgK/exec';
  rows: string[][] = [];
  headers: string[] = [];

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

    const body = new HttpParams().set('text', 'safari text to add');

    this.http.post(this.webhookUrl, body.toString(), { headers, responseType: 'text' })
      .subscribe({
        next: () => alert('Added!'),
        error: (err) => {
          console.error(err);
          alert('Something went wrong');
        },
      });
  }


}
