import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { CommunityModalComponent } from '../community-modal/community-modal.component';

interface DiscountCode {
  webshop: string;
  code: string;
  percentage: number;
  date: string;
  added_by: string;
}

@Component({
  selector: 'app-community',
  imports: [CommunityModalComponent],
  templateUrl: './community.component.html',
  styleUrls: ['./../app.component.css']
})
export class CommunityComponent implements OnInit {
  webhookUrl = 'https://script.google.com/macros/s/AKfycbzEMMokt67Oz0PwOHEKHwxyZLpw0rwfVyzCXnerdNSwrxf4pKX6pz9_-KX48APoe_AX/exec';
  discountCodes: DiscountCode[] = [];
  modalVisible = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.readDataFromSheet();
  }

  readDataFromSheet() {
    const url = 'https://docs.google.com/spreadsheets/d/1TsBlQr5KrB3g6rbtwr0ujLoFfi41XBwBgimMCyQBl9w/gviz/tq?tqx=out:json';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const json = JSON.parse(response.replace(/^[^\(]*\(/, '').replace(/\);$/, ''));
      const table = json.table;

      this.discountCodes = table.rows.map((row: any) => {
        const cells = row.c.map((cell: any) => cell?.v ?? '');
        const [webshop, code, percentage, date, added_by] = cells;

        return {
          webshop,
          code,
          percentage: +percentage,
          date,
          added_by,
        } as DiscountCode;
      }).reverse();
    });
  }

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
        next: () => {
          console.log('Added!');
          this.modalVisible = false;
        },
        error: (err) => {
          console.error(err);
          alert('Something went wrong');
        },
      });
  }

}
