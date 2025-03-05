import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IAuth, IAuthResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    signIn(username: string, password: string): Promise<IAuthResponse> {
        console.log(
            `Credentials received: username: ${username}, password: ${password}.`,
        );

        const data: IAuth = {
            username,
            password,
        };

        return new Promise((resolve, reject) => {
            this.httpService.post('auth', data, (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                this.tokenService.setToken(result?.token || '');

                resolve(result);
            });
        });
    };
}
