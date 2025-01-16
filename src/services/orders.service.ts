import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IOrder, IOrderSearchParams, IOrderCreate } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getOrdersList(
        pageSize: number, 
        pageIndex: number, 
        sortingColumn: string, 
        sortingDirection: string,
        searchParams: IOrderSearchParams
    ): Promise<{
        data: IOrder[],
        total: number,
    }> {
        let url = `orders?pageSize=${pageSize}&pageIndex=${pageIndex}&sortingColumn=${sortingColumn}&sortingDirection=${sortingDirection}`;

        if (searchParams.searchField && searchParams.searchField !== 'not-selected') {
            url += `&searchField=${searchParams.searchField}&search=${searchParams.search}`;
        }

        if (searchParams.searchDateField && searchParams.searchDateField !== 'not-selected') {
            url += `&searchDateField=${searchParams.searchDateField}&from=${searchParams.dateFrom}&to=${searchParams.dateTo}`;
        }

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any) => {
                resolve(result);
            });
        });
    };

    getOrdersByOrderNumber(
        number: number
    ): Promise<{
        data: any[],
        total: number,
    }> {
        const url = `orders/${number}`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any) => {
                resolve(result);
            });
        });
    };

    createOrder(
        data: IOrderCreate
    ): Promise<{
        status: string
    }>  {
        const url = `orders`;

        return new Promise((resolve, reject) => {
            this.httpService.post(url, data, (result: any) => {
                resolve(result);
            })
        });
    };
}
