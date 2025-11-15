import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-ambassador',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './ambassador.component.html'
})
export class AmbassadorComponent implements OnInit {

    tiktokEmbed!: SafeHtml;

    constructor(private sanitizer: DomSanitizer, private meta: MetaService) {
        this.meta.setNoIndex();
    }

    ngOnInit() {
        const html = `
            <blockquote class="tiktok-embed" cite="https://www.tiktok.com/@indyvandenburg/video/7476176257772784918"
            data-video-id="7476176257772784918" style="max-width: 605px;min-width: 325px;" > <section>
            <a target="_blank" title="@indyvandenburg" href="https://www.tiktok.com/@indyvandenburg?refer=embed">@indyvandenburg</a>
            Oprecht zo chill <a title="shoptip" target="_blank" href="https://www.tiktok.com/tag/shoptip?refer=embed">#shoptip</a>
            <a title="kortingscode" target="_blank" href="https://www.tiktok.com/tag/kortingscode?refer=embed">#kortingscode</a>
            <a title="shopping" target="_blank" href="https://www.tiktok.com/tag/shopping?refer=embed">#shopping</a>
            <a title="tip" target="_blank" href="https://www.tiktok.com/tag/tip?refer=embed">#tip</a> <a title="tipsandtricks"
            target="_blank" href="https://www.tiktok.com/tag/tipsandtricks?refer=embed">#tipsandtricks</a> <a title="fashionhacks"
            target="_blank" href="https://www.tiktok.com/tag/fashionhacks?refer=embed">#fashionhacks</a> <a target="_blank"
            title="♬ origineel geluid - Indy van den Burg"
            href="https://www.tiktok.com/music/origineel-geluid-7476176262923324162?refer=embed">♬ origineel geluid -
            Indy van den Burg</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>
                `;

        this.tiktokEmbed = this.sanitizer.bypassSecurityTrustHtml(html);
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
    }
}
