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

    duplicateQuote(orderNum: number, quote: boolean) {
        const url = `quotes/duplicate/duplicate`;

        return new Promise((resolve, reject) => {
            this.httpService.post(url,  {
                orderNum,
                quote
            },(result: any, error: any) => {
                if (error) {
                    return reject(error);
                }
                
                resolve(result);
            });
        });
    }

    convertQuoteIntoOrder(orderNum: number, quote: boolean) {
        const url = `quotes/duplicate/convert`;

        return new Promise((resolve, reject) => {
            this.httpService.post(url,  {
                orderNum,
                quote
            },(result: any, error: any) => {
                if (error) {
                    return reject(error);
                }
                
                resolve(result);
            });
        });
    }
}
