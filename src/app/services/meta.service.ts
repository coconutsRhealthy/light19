import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

// Self-hosted 1200x630 branded OG banner (butter bg + "d" mark + wordmark + tagline).
const OG_IMAGE = 'https://diski.nl/logos/webp/diski-og.webp';

@Injectable({
    providedIn: 'root'
})
export class MetaService {
    constructor(
        private titleService: Title,
        private meta: Meta,
        @Inject(DOCUMENT) private document: Document
    ) { }

    updateMetaInfo(content: string, author: string, category: string) {
        this.meta.updateTag({ name: 'description', content: content });
        this.meta.updateTag({ name: 'author', content: author });
        this.meta.updateTag({ name: 'keywords', content: category });
    }

    updateTitle(title: string) {
        this.titleService.setTitle(title);
    }

    updateOgTags(title: string, description: string, url: string, type: string = 'website') {
        this.meta.updateTag({ property: 'og:title', content: title });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ property: 'og:url', content: url });
        this.meta.updateTag({ property: 'og:type', content: type });
        this.meta.updateTag({ property: 'og:image', content: OG_IMAGE });
        this.meta.updateTag({ property: 'og:site_name', content: 'Diski' });
        this.meta.updateTag({ property: 'og:locale', content: 'nl_NL' });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
        this.meta.updateTag({ name: 'twitter:title', content: title });
        this.meta.updateTag({ name: 'twitter:description', content: description });
        this.meta.updateTag({ name: 'twitter:image', content: OG_IMAGE });
    }

    setJsonLd(id: string, schema: object): void {
        let script = this.document.querySelector(`script[data-schema-id="${id}"]`) as HTMLScriptElement | null;
        if (!script) {
            script = this.document.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            script.setAttribute('data-schema-id', id);
            this.document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema);
    }

    setNoIndex() {
        // updateTag (not addTag) so repeated client-side navigations can't stack
        // multiple <meta name="robots"> tags.
        this.meta.updateTag({ name: 'robots', content: 'noindex' });
    }

    // Explicitly mark the page indexable: drop any stale robots noindex that a
    // previous (preview) page may have left behind during client-side navigation.
    // No robots meta = indexable by default, so we simply remove the tag.
    setIndex() {
        this.meta.removeTag('name="robots"');
    }

    getDateString() {
      const currentDate = new Date();
      const monthNames = [
        'januari', 'februari', 'maart', 'april', 'mei', 'juni',
        'juli', 'augustus', 'september', 'oktober', 'november', 'december'
      ];

      const month = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();

      return month + " " + year;
    }
}
