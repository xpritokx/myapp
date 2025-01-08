import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IOrder } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getOrders(): Promise<IOrder[]> {
        return new Promise((resolve, reject) => {
            this.httpService.get('orders',  (result: any) => {
                resolve(result);
            });
        });
    }
}
