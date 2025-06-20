import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./discounts-table/discounts-table.component').then(m => m.DiscountsTableComponent)
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
        path: ':company',
        loadComponent: () => import('./company-codes/company-codes.component').then(m => m.CompanyCodesComponent)
    },
    {
        path: '**',
        loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
