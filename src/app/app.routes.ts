import { Routes } from '@angular/router';
import { DiscountsTableComponent } from './discounts-table/discounts-table.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';
import { CompanyCodesV2Component } from './company-codes-v2/company-codes-v2.component';
import { WinkelsComponent } from './winkels/winkels.component';
import { ContactComponent } from './contact/contact.component';
import { BlackfridayComponent } from './blackfriday/blackfriday.component';
import { PrikbordComponent } from './prikbord/prikbord.component';
import { BlogsComponent } from './blogs/blogs.component';
import { SpaceNkBlogComponent } from './blogs/space-nk/space-nk-blog.component';
import { LookfantasticBlogComponent } from './blogs/lookfantastic/lookfantastic-blog.component';
import { UniqloBlogComponent } from './blogs/uniqlo/uniqlo-blog.component';
import { Top5Component } from './top5/top5.component';
import { ShareCodeComponent } from './share-code/share-code.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { hasV2Content } from './has-v2-content.guard';
import { brandContentResolver } from './company-codes-v2/brand-content/brand-content.resolver';

export const routes: Routes = [
  { path: '', component: DiscountsTableComponent },
  { path: 'winkels', component: WinkelsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'blackfriday', component: BlackfridayComponent },
  { path: 'prikbord', component: PrikbordComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blogs/space-nk', component: SpaceNkBlogComponent },
  { path: 'blogs/lookfantastic', component: LookfantasticBlogComponent },
  { path: 'blogs/uniqlo', component: UniqloBlogComponent },
  { path: 'top5', component: Top5Component },
  { path: 'code-delen', component: ShareCodeComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  // Noindexed preview of ANY shop with v2 content (data.preview drives the noindex).
  { path: 'v2/:company', component: CompanyCodesV2Component, data: { preview: true }, resolve: { brandContent: brandContentResolver } },
  // Real route: serve v2 (indexable) only for allowlisted go-live shops; the guard
  // falls through to the v1 route below for every other shop.
  { path: ':company', component: CompanyCodesV2Component, canMatch: [hasV2Content], resolve: { brandContent: brandContentResolver } },
  { path: ':company', component: CompanyCodesComponent },
  { path: '**', component: NotFoundComponent }
];
