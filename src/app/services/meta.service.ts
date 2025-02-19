import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class MetaService {
    constructor(private titleService: Title, private meta: Meta) { }

    updateMetaInfo(content: string, author: string, category: string) {
        this.meta.updateTag({ name: 'description', content: content });
        this.meta.updateTag({ name: 'author', content: author });
        this.meta.updateTag({ name: 'keywords', content: category });
    }

    updateTitle(title: string) {
        this.titleService.setTitle(title);
    }

    setNoIndex() {
        this.meta.addTag({ name: 'robots', content: 'noindex' });
    }

    getDateString() {
      const currentDate = new Date();
      const monthNames = [
        'januari', 'februari', 'maart', 'april', 'mei', 'juni',
        'juli', 'augustus', 'september', 'oktober', 'november', 'december'
      ];

      const month = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();

      const dateString = month + " " + year;
      return dateString;
    }
}
