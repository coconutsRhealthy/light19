import { Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { WinkelsComponent } from './winkels/winkels.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';
import { DiscountsTableComponent } from './discounts-table/discounts-table.component';

export const routes: Routes = [
    { path: '', component: DiscountsTableComponent},
    { path: 'contact', component: ContactComponent },
    { path: 'winkels', component: WinkelsComponent },
    { path: ':company', component: CompanyCodesComponent},
];
