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
                    console.log('--DEBUG-- POST error: ', e.error);
                    callback(null, e.error);
                }
            }
        );
    };

    put(path: string, data: any, callback: Function): any {
        console.log('--DEBUG-- PUT req: ', data);

        const headers = {
            Authorization: `Bearer ${this.tokenService.getToken()}`
        };

        console.log('--DEBUG-- Start: ', headers);
        this.http.put<any>(
            `${this.BASE_URL}/api/${path}`,
            data,
            { headers },
        ).subscribe(
            {
                'next': (data) => {
                    console.log('--DEBUG-- PUT result: ', data);
                    callback(data);
                },
                'error': (e) => {
                    console.log('--DEBUG-- PUT error: ', e && e.error || e);
                    callback(null, e.error);
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
                console.log('--DEBUG-- GET error: ', e.error);
                callback(null, e.error);
            }
        });
    };

    delete(path: string, callback: Function):any {
        console.log('--DEBUG-- DELETE req');

        const headers = {
            Authorization: `Bearer ${this.tokenService.getToken()}`
        };

        this.http.delete<any>(
            `${this.BASE_URL}/api/${path}`,
            { headers },
        ).subscribe({
            'next': (data) => {
                console.log('--DEBUG-- DELETE result: ', data);
                callback(data);
            },
            'error': (e) => {
                console.log('--DEBUG-- DELETE error: ', e.error);
                callback(null, e.error);
            }
        });
    }
}
