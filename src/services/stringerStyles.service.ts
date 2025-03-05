import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class StringerStylesService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getStringerStyles(): Promise<{
        data: any[],
        total: number,
    }> {
        let url = `stringerStyles`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }
    
    setStringerStyles(stringerStyles: object): any {
        sessionStorage.setItem('stringer_styles', JSON.stringify(stringerStyles));
    }

    getSavedStringerStyles(): any {
        return JSON.parse(sessionStorage.getItem('stringer_styles') || '[]');
    }
}
