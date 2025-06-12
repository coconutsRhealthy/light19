import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-community',
  imports: [],
  templateUrl: './community.component.html',
  styleUrls: ['./../app.component.css']
})
export class CommunityComponent implements OnInit {

  webhookUrl = 'https://script.google.com/macros/s/AKfycbyfUyX9yE-cfZaJcyNi7skXgg0VZqLqo-kZsW4VZqGwSg5KqkWCFsj-lMEG0l9323Oc/exec';
  rows: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.readDataFromSheet();
  }

  addRow() {
    const body = { text: "text to add" };

    this.http.post(this.webhookUrl, body, { responseType: 'text' }).subscribe({
      next: () => {
        alert('Added!');
      },
      error: (err) => {
        console.error(err);
        alert('Something went wrong');
      },
    });
  }

  readDataFromSheet() {
    const url = 'https://docs.google.com/spreadsheets/d/1TsBlQr5KrB3g6rbtwr0ujLoFfi41XBwBgimMCyQBl9w/gviz/tq?tqx=out:json';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const json = JSON.parse(response.replace(/^[^\(]*\(/, '').replace(/\);$/, ''));
      const table = json.table;
      this.rows = table.rows.map((row: any) => row.c.map((cell: any) => cell?.v ?? ''));
    });
  }
}
