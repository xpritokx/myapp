import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class StairTypesService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getStairTypes(): Promise<{
        data: any[],
        total: number,
    }> {
        let url = `stairTypes`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }
    
    setStairTypes(stairTypes: object): any {
        sessionStorage.setItem('stair_types', JSON.stringify(stairTypes));
    }

    getSavedStairTypes(): any {
        return JSON.parse(sessionStorage.getItem('stair_types') || '[]');
    }
}