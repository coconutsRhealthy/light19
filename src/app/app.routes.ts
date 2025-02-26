import { Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { WinkelsComponent } from './winkels/winkels.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';
import { DiscountsTableComponent } from './discounts-table/discounts-table.component';
import { GiftcardsComponent } from './giftcards/giftcards.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    { path: '', component: DiscountsTableComponent},
    { path: 'winkels', component: WinkelsComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'giftcards', component: GiftcardsComponent},
    { path: 'giftcards/:company', component: GiftcardsComponent},
    { path: ':company', component: CompanyCodesComponent},
    { path: '**', component: NotFoundComponent},
];
