import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { IModels } from '../interfaces/models.interface';

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
            this.httpService.get(url,  (result: any) => {
                resolve(result);
            });
        });
    }
}
