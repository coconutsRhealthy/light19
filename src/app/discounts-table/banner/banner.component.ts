import { Component } from '@angular/core';

declare let gtag: Function;

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
})
export class BannerComponent {
  private readonly mainUrl = 'https://diski.checkprijs.com';

  openMain(): void {
    this.track('prijsvergelijker_homepage_banner');
    window.open(this.mainUrl, '_blank', 'noopener');
  }

  openProduct(slug: string, event: MouseEvent): void {
    event.stopPropagation();
    this.track('prijsvergelijker_homepage_' + slug);
    window.open(`${this.mainUrl}/${slug}`, '_blank', 'noopener');
  }

  private track(label: string): void {
    if (typeof gtag === 'function') {
      gtag('event', 'prijsvergelijker', {
        event_category: 'Prijsvergelijker',
        event_label: label,
      });
    }
  }
}
