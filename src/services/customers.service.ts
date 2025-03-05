import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { ICustomer, ICustomersSearchParams } from '../interfaces/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    addCustomer(data: any) {
        const url = `customers`;

        return new Promise((resolve, reject) => {
            this.httpService.post(url, data, (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            })
        });
    }

    getCustomersByName(
        name: string
    ): Promise<{
        data: ICustomer[],
        total: number,
    }> {
        let url = `customers`;

        if (name) {
            url += `?name=${name}`;
        }

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    getCustomersList(
        pageSize: number, 
        pageIndex: number, 
        sortingColumn: string, 
        sortingDirection: string,
        searchParams: ICustomersSearchParams
    ): Promise<{
        data: ICustomer[],
        total: number,
    }> {
        let url = `customers/all?pageSize=${pageSize}&pageIndex=${pageIndex}&sortingColumn=${sortingColumn}&sortingDirection=${sortingDirection}`;

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
    }

    updateCustomer(id: any, data: any) {
        const url = `customers/${id}`;

        return new Promise((resolve, reject) => {
            this.httpService.put(url, data, (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            })
        });
    }

    deleteCustomer(
        id: number
    ) {
        const url = `customers/${id}`;

        return new Promise((resolve, reject) => {
            this.httpService.delete(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }
                
                resolve(result);
            });
        });
    };
}
