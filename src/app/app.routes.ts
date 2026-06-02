import { Routes } from '@angular/router';
import { DiscountsTableComponent } from './discounts-table/discounts-table.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';
import { CompanyCodesV2Component } from './company-codes-v2/company-codes-v2.component';
import { WinkelsComponent } from './winkels/winkels.component';
import { ContactComponent } from './contact/contact.component';
import { WieheeftsaleComponent } from './wieheeftsale/wieheeftsale.component';
import { PrikbordComponent } from './prikbord/prikbord.component';
import { BlogsComponent } from './blogs/blogs.component';
import { SpaceNkBlogComponent } from './blogs/space-nk/space-nk-blog.component';
import { Top5Component } from './top5/top5.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { hasV2Content } from './has-v2-content.guard';

export const routes: Routes = [
  { path: '', component: DiscountsTableComponent },
  { path: 'winkels', component: WinkelsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'wieheeftsale', component: WieheeftsaleComponent },
  { path: 'prikbord', component: PrikbordComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blogs/space-nk', component: SpaceNkBlogComponent },
  { path: 'top5', component: Top5Component },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  // Noindexed preview of ANY shop with v2 content (data.preview drives the noindex).
  { path: 'v2/:company', component: CompanyCodesV2Component, data: { preview: true } },
  // Real route: serve v2 (indexable) only for allowlisted go-live shops; the guard
  // falls through to the v1 route below for every other shop.
  { path: ':company', component: CompanyCodesV2Component, canMatch: [hasV2Content] },
  { path: ':company', component: CompanyCodesComponent },
  { path: '**', component: NotFoundComponent }
];
