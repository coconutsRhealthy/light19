import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-contact',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./../app.component.css', './../app-tailwind.component.css']
})
export class ContactComponent implements OnInit {

  constructor(private meta: MetaService) {
    this.meta.updateTitle("Neem Contact Op met Diski | Kortingscodes en Samenwerkingen");
    this.meta.updateMetaInfo("Duizenden online shoppers maken gebruik van de kortingscodes die Diski deelt. Heb je vragen, verzoeken of ideeën voor samenwerkingen of adverteren? Neem contact op en ontdek hoe we samen kunnen werken via Diski.nl en @wiegeeftkorting.", "diski.nl", "Samenwerken met Diski, Adverteren op kortingscode platform, Kortingscodes voor online shoppers, Samenwerkingen met bedrijven");
  }

  ngOnInit(): void {
  }

}
