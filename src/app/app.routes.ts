import { Routes } from '@angular/router';
import { DiscountsTableComponent } from './discounts-table/discounts-table.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';
import { WinkelsComponent } from './winkels/winkels.component';
import { ContactComponent } from './contact/contact.component';
import { WieheeftsaleComponent } from './wieheeftsale/wieheeftsale.component';
import { PrikbordComponent } from './prikbord/prikbord.component';
import { GiftcardsComponent } from './giftcards/giftcards.component';
import { AmbassadorComponent } from './ambassador/ambassador.component';
import { BlogsComponent } from './blogs/blogs.component';
import { Top5Component } from './top5/top5.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: DiscountsTableComponent },
  { path: 'winkels', component: WinkelsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'wieheeftsale', component: WieheeftsaleComponent },
  { path: 'prikbord', component: PrikbordComponent },
  { path: 'giftcards', component: GiftcardsComponent },
  { path: 'ambassador', component: AmbassadorComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'top5', component: Top5Component },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: ':company', component: CompanyCodesComponent },
  { path: '**', component: NotFoundComponent }
];
