import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class StairStylesService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getStairStyles(): Promise<{
        data: any[],
        total: number,
    }> {
        let url = `stairStyles`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }
    
    setStairStyles(stairStyles: object): any {
        sessionStorage.setItem('stair_styles', JSON.stringify(stairStyles));
    }

    getSavedStairStyles(): any {
        return JSON.parse(sessionStorage.getItem('stair_styles') || '[]');
    }
}
