import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-community',
  imports: [],
  templateUrl: './community.component.html',
  styleUrls: ['./../app.component.css']
})
export class CommunityComponent implements OnInit {
  newText = '';
  //webhookUrl = 'https://script.google.com/macros/s/AKfycbxhqiGkYpLsLAbVX47T6a0wul0_7Jj1yY6E_ZObNIXN__VjG1b4fMu7-Nc9wlI3dFo_/exec';
  //webhookUrl = 'https://script.google.com/macros/s/AKfycbz03vURlmS2dQ3IgAMNxs4EcIsjxh8EsWnNrwCoM8G-kxlhX8IL3QBd0uo8aN4H2rgX/exec';
  //webhookUrl = 'https://script.google.com/macros/s/AKfycbzzzzzzwul0_7Jj1yY6E_ZObNIXN__VjG1b4fMu7-Nc9wlI3dFo_/exec';
  //webhookUrl = 'https://script.google.com/macros/s/AKfycbwqommuO4iN-MeeJBsL3ChuryP4k-FO8kSOsqDn1BMII3BNjFQ_6Iw1vGaVf3qor8A/exec';
  webhookUrl = 'https://script.google.com/macros/s/AKfycbyfUyX9yE-cfZaJcyNi7skXgg0VZqLqo-kZsW4VZqGwSg5KqkWCFsj-lMEG0l9323Oc/exec';






  rows: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const url = 'https://docs.google.com/spreadsheets/d/1TsBlQr5KrB3g6rbtwr0ujLoFfi41XBwBgimMCyQBl9w/gviz/tq?tqx=out:json';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const json = JSON.parse(response.replace(/^[^\(]*\(/, '').replace(/\);$/, ''));
      const table = json.table;
      this.rows = table.rows.map((row: any) => row.c.map((cell: any) => cell?.v ?? ''));
    });
  }




  addRow() {
    const body = { text: "hoi ditzzz wil ik toevoegen" };

    this.http.post(this.webhookUrl, body, { responseType: 'text' }).subscribe({
      next: () => {
        alert('Toegevoegd!');
        this.newText = '';
      },
      error: (err) => {
        console.error(err);
        alert('Er ging iets mis');
      },
    });
  }
}
