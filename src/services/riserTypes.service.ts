import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class RiserTypesService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getRiserTypes(): Promise<{
        data: any[],
        total: number,
    }> {
        let url = `riserTypes`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }
                
                resolve(result);
            });
        });
    }
    
    setRiserTypes(riserTypes: object): any {
        sessionStorage.setItem('riser_types', JSON.stringify(riserTypes));
    }

    getSavedRiserTypes(): any {
        return JSON.parse(sessionStorage.getItem('riser_types') || '[]');
    }
}
