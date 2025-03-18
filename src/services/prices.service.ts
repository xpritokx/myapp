import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IModels, IModelsSearchParams } from '../interfaces/models.interface';

@Injectable({
  providedIn: 'root'
})
export class PricesService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    editPrice(id: number, unitPrice: number) {
        const url = `prices/${id}`;

        return new Promise((resolve, reject) => {
            this.httpService.put(url, {
                unitPrice
            }, (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    getAllPrices(): Promise<{
        data: IModels[],
        total: number,
    }> {
        let url = `prices`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }
                
                resolve(result);
            });
        });
    }

    getPricesByOrderNum(
        orderNum: string
    ): Promise<{
        data: IModels[],
        total: number,
    }> {
        let url = `prices/${orderNum}`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }
                
                resolve(result);
            });
        });
    }
}
