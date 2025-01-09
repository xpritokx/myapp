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

    getOrders(pageSize: number, pageIndex: number, sortingColumn: string, sortingDirection: string): Promise<{
        data: IOrder[],
        total: number,
    }> {
        return new Promise((resolve, reject) => {
            this.httpService.get(`orders?pageSize=${pageSize}&pageIndex=${pageIndex}&sortingColumn=${sortingColumn}&sortingDirection=${sortingDirection}`,  (result: any) => {
                resolve(result);
            });
        });
    }
}
