import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IOrder, IOrderSearchParams, IOrderCreate } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    getQuotesList(
        pageSize: number, 
        pageIndex: number, 
        sortingColumn: string, 
        sortingDirection: string,
        searchParams: IOrderSearchParams
    ): Promise<{
        data: IOrder[],
        total: number,
    }> {
        let url = `quotes?pageSize=${pageSize}&pageIndex=${pageIndex}&sortingColumn=${sortingColumn}&sortingDirection=${sortingDirection}`;

        if (searchParams.searchField && searchParams.searchField !== 'not-selected') {
            url += `&searchField=${searchParams.searchField}&search=${searchParams.search}`;
        }

        if (searchParams.searchDateField && searchParams.searchDateField !== 'not-selected') {
            url += `&searchDateField=${searchParams.searchDateField}&from=${searchParams.dateFrom}&to=${searchParams.dateTo}`;
        }

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    };

    /* getOrdersByOrderNumber(
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
    }; */

    /* getSalesOrdersByOrderNumber(
        number: number
    ): Promise<{
        data: any[],
        total: number,
    }> {
        const url = `orders/sales/${number}`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any) => {
                resolve(result);
            });
        });
    }; */

    /* createOrder(
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
    }; */

    /* addStair(data: {
        id: number,
        orderNum: number
    }) {
        const url = `orders/stair`;

        return new Promise((resolve, reject) => {
            this.httpService.post(url, data, (result: any) => {
                resolve(result);
            })
        });
    } */

    /* deleteOrder(
        number: number
    ) {
        const url = `orders/order/${number}`;

        return new Promise((resolve, reject) => {
            this.httpService.delete(url,  (result: any) => {
                resolve(result);
            });
        });
    }; */

    /* deleteStair(
        number: number,
        orderNum: number,
        stairsCount: number
    ) {
        const url = `orders/stair/${number}?orderNumber=${orderNum}&stairsCount=${stairsCount}`;

        return new Promise((resolve, reject) => {
            this.httpService.delete(url,  (result: any) => {
                resolve(result);
            });
        });
    }; */

    /* updateStair(id: string, data: any): Promise<{
        status: string
    }> {
        const url = `orders/stair/${id}`;

        console.log('--DEBUG-- url: ', url);

        return new Promise((resolve, reject) => {
            this.httpService.put(url, data, (result: any) => {
                console.log('--DEBUG-- updateStair ', result);
                resolve(result);
            })
        });
    } */

    /* createImage(id: string, data: object): Promise<{
        status: string,
    }> {
        const url = `orders/image/${id}`;

        console.log('--DEBUG-- url: ', url);

        return new Promise((resolve, reject) => {
            this.httpService.post(url, data, (result: any) => {
                console.log('--DEBUG-- create image ', result);
                resolve(result);
            })
        });
    } */

    /* removeImage(
        orderNum: string,
        id: string
    ) {
        const url = `orders/image/${orderNum}/${id}`;

        return new Promise((resolve, reject) => {
            this.httpService.delete(url,  (result: any) => {
                resolve(result);
            });
        });
    }; */
}
