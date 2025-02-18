import { Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { WinkelsComponent } from './winkels/winkels.component';

export const routes: Routes = [
    { path: 'contact', component: ContactComponent },
    { path: 'winkels', component: WinkelsComponent },
];
