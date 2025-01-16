import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { ICustomer } from '../interfaces/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

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
            this.httpService.get(url,  (result: any) => {
                resolve(result);
            });
        });
    }
}
