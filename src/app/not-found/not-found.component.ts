import { Component, OnInit } from '@angular/core';

import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private meta: MetaService) {
    this.meta.updateTitle("404 Deze pagina is niet gevonden op diski.nl");
    this.meta.updateMetaInfo("404 Deze pagina bestaat niet op diski.nl", "diski.nl", "404");
  }

  ngOnInit(): void {
  }

}