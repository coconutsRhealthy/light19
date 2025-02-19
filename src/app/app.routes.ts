import { Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { WinkelsComponent } from './winkels/winkels.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';

export const routes: Routes = [
    { path: 'contact', component: ContactComponent },
    { path: 'winkels', component: WinkelsComponent },
    { path: ':company', component: CompanyCodesComponent},
];
