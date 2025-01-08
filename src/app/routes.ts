import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { OrdersComponent } from './orders/orders.component';

const routeConfig: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Home page',
    },
    {
        path: 'auth',
        component: AuthComponent,
        title: 'Auth page',
    },
    {
        path: 'orders',
        component: OrdersComponent,
        title: 'Orders page',
    },
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home page',
    },
];

export default routeConfig;