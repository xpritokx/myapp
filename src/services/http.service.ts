import { Injectable, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HTTPService {
    BASE_URL:string = "http://localhost:8000";

    tokenService = inject(TokenService);

    constructor(
        private http: HttpClient
    ) {}

    post(path: string, data: any, callback: Function): any {
        console.log('--DEBUG-- POST req: ', data);

        const headers = {
            Authorization: `Bearer ${this.tokenService.getToken()}`
        };

        this.http.post<any>(
            `${this.BASE_URL}/api/${path}`,
            data,
            { headers },
        ).subscribe(
            {
                'next': (data) => {
                    console.log('--DEBUG-- POST result: ', data);
                    callback(data);
                },
                'error': (e) => {
                    callback(null, e);
                }
            }
        );
    };

    get(path: string, callback: Function): any {
        console.log('--DEBUG-- GET req');
        
        const headers = {
            Authorization: `Bearer ${this.tokenService.getToken()}`
        };

        this.http.get<any>(
            `${this.BASE_URL}/api/${path}`,
            { headers },
        ).subscribe({
            'next': (data) => {
                console.log('--DEBUG-- GET result: ', data);
                callback(data);
            },
            'error': (e) => {
                callback(null, e);
            }
        });
    };
}
