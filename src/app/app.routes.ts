import { Routes } from '@angular/router';
import { DiscountsTableComponent } from './discounts-table/discounts-table.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';
import { CompanyCodesV2Component } from './company-codes-v2/company-codes-v2.component';
import { WinkelsComponent } from './winkels/winkels.component';
import { ContactComponent } from './contact/contact.component';
import { BlackfridayComponent } from './blackfriday/blackfriday.component';
import { BoodschappenComponent } from './boodschappen/boodschappen.component';
import { PrikbordComponent } from './prikbord/prikbord.component';
import { BlogsComponent } from './blogs/blogs.component';
import { SpaceNkBlogComponent } from './blogs/space-nk/space-nk-blog.component';
import { LookfantasticBlogComponent } from './blogs/lookfantastic/lookfantastic-blog.component';
import { UniqloBlogComponent } from './blogs/uniqlo/uniqlo-blog.component';
import { UniqloActieAugustusBlogComponent } from './blogs/uniqlo-actie-augustus/uniqlo-actie-augustus-blog.component';
import { Top5Component } from './top5/top5.component';
import { ShareCodeComponent } from './share-code/share-code.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ActievoorwaardenComponent } from './actievoorwaarden/actievoorwaarden.component';
import { AccountVerwijderenComponent } from './account-verwijderen/account-verwijderen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { hasV2Content } from './has-v2-content.guard';
import { brandContentResolver } from './company-codes-v2/brand-content/brand-content.resolver';

export const routes: Routes = [
  { path: '', component: DiscountsTableComponent },
  { path: 'winkels', component: WinkelsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'blackfriday', component: BlackfridayComponent },
  // Was /beste-bonus until 2026-08-11: "bonus" is Albert Heijn's own brand word
  // (90 searches/mo, parent topic "ah bonus"), while "goedkoopste supermarkt" is
  // 3.000/mo at KD 7. The old path is left to 404 — it was live for two days and
  // had nothing worth preserving.
  { path: 'goedkoopste-supermarkt', component: BoodschappenComponent },
  { path: 'prikbord', component: PrikbordComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blogs/space-nk', component: SpaceNkBlogComponent },
  { path: 'blogs/lookfantastic', component: LookfantasticBlogComponent },
  { path: 'blogs/uniqlo', component: UniqloBlogComponent },
  { path: 'blogs/uniqlo-actie-augustus', component: UniqloActieAugustusBlogComponent },
  { path: 'top5', component: Top5Component },
  { path: 'code-delen', component: ShareCodeComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  // App-store / legal pages. Prerendered so the URLs resolve, but noindex and
  // deliberately absent from the sitemap — see scripts/fill-routes.js.
  { path: 'actievoorwaarden', component: ActievoorwaardenComponent },
  { path: 'account-verwijderen', component: AccountVerwijderenComponent },
  // Real route: serve v2 (indexable) for any shop that has v2 content; the guard
  // falls through to the v1 route below for every other shop.
  { path: ':company', component: CompanyCodesV2Component, canMatch: [hasV2Content], resolve: { brandContent: brandContentResolver } },
  { path: ':company', component: CompanyCodesComponent },
  { path: '**', component: NotFoundComponent }
];
