import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-privacy-policy',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css', './../app.component.css'],
})
export class PrivacyPolicyComponent {

  constructor(private meta: MetaService) {
    this.meta.updateTitle("Privacyverklaring | Diski.nl");
    this.meta.updateMetaInfo("Lees hoe Diski.nl (LWPH Media) omgaat met je persoonsgegevens: welke gegevens wij verwerken, waarvoor wij ze gebruiken, met wie wij ze delen en hoe je jouw gegevens kunt inzien, aanpassen of verwijderen.", "diski.nl", "Privacyverklaring Diski, Privacybeleid kortingscodes, Persoonsgegevens AVG, Cookies en lokale opslag");
  }

}
