import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IModels, IModelsSearchParams } from '../interfaces/models.interface';

@Injectable({
  providedIn: 'root'
})
export class ModelsService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getModelsByName(
        name: string
    ): Promise<{
        data: IModels[],
        total: number,
    }> {
        let url = `models`;

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

    getModelsList(
            pageSize: number, 
            pageIndex: number, 
            sortingColumn: string, 
            sortingDirection: string,
            searchParams: IModelsSearchParams
        ): Promise<{
            data: IModels[],
            total: number,
        }> {
            let url = `models/all?pageSize=${pageSize}&pageIndex=${pageIndex}&sortingColumn=${sortingColumn}&sortingDirection=${sortingDirection}`;
    
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

    addModel(data: {
        name :string;
        customer: number;
        workorder: number;
    }) {
        const url = 'models';

        return new Promise((resolve, reject) => {
            this.httpService.post(url, data, (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    deleteModel(
        id: number
    ) {
        const url = `models/${id}`;

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
