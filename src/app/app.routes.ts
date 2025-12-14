import { Routes } from '@angular/router';
import { DiscountsTableComponent } from './discounts-table/discounts-table.component';
import { CompanyCodesComponent } from './company-codes/company-codes.component';

export const routes: Routes = [
    {
        path: '',
        component: DiscountsTableComponent
    },
    {
        path: 'winkels',
        loadComponent: () => import('./winkels/winkels.component').then(m => m.WinkelsComponent)
    },
    {
        path: 'contact',
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent)
    },
    {
        path: 'wieheeftsale',
        loadComponent: () => import('./wieheeftsale/wieheeftsale.component').then(m => m.WieheeftsaleComponent)
    },
    {
        path: 'prikbord',
        loadComponent: () => import('./prikbord/prikbord.component').then(m => m.PrikbordComponent)
    },
    {
        path: 'giftcards',
        loadComponent: () => import('./giftcards/giftcards.component').then(m => m.GiftcardsComponent)
    },
    {
        path: 'ambassador',
        loadComponent: () => import('./ambassador/ambassador.component').then(m => m.AmbassadorComponent)
    },
    {
        path: 'top5',
        loadComponent: () => import('./top5/top5.component').then(m => m.Top5Component)
    },
    {
        path: ':company',
        component: CompanyCodesComponent
    },
    {
        path: '**',
        loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
