import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getMaterials(): Promise<{
        data: any[],
        total: number,
    }> {
        let url = `materials`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any) => {
                resolve(result);
            });
        });
    }
    
    setMaterials(materials: object): any {
        sessionStorage.setItem('materials', JSON.stringify(materials));
    }

    getSavedMaterials(): any {
        return JSON.parse(sessionStorage.getItem('materials') || '[]');
    }
}
