import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { OrdersComponent } from './orders/orders.component';
import { QuotesComponent } from './quotes/quotes.component';
import { CustomerComponent } from './customers/customer.component';
import { ModelsComponent } from './models/models.component';
import { PricesComponent } from './prices/prices.component';

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
        path: 'quotes',
        component: QuotesComponent,
        title: 'Quotes page',
    },
    {
        path: 'customers',
        component: CustomerComponent,
        title: 'Customers page',
    },
    {
        path: 'models',
        component: ModelsComponent,
        title: 'Models page',
    },
    {
        path: 'prices',
        component: PricesComponent,
        title: 'Prices page',
    },
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home page',
    },
];

export default routeConfig;