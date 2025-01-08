import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IConfig } from '../interfaces/config.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getConfig(): Promise<IConfig> {
        return new Promise((resolve, reject) => {
            this.httpService.get('config',  (result: any) => {
                resolve(result);
            });
        });
    }
}
