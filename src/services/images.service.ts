import { Injectable, inject } from '@angular/core';
import { HTTPService } from './http.service';
import { TokenService } from './token.service';
import { ICustomer, ICustomersSearchParams } from '../interfaces/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
    httpService = inject(HTTPService);
    tokenService = inject(TokenService);

    constructor() {}

    getDefaultImagesList(): Promise<{
        data: ICustomer[],
        total: number,
    }> {
        let url = `orders/images/default`;

        return new Promise((resolve, reject) => {
            this.httpService.get(url,  (result: any, error: any) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    setDefaultImages(images: any[]): any {
        const topLeftimages = images.filter(img => {
            return ['SACR_L', 'DACR_L', 'STF45_L', 'SAF45_L', 'STD30_L', 'SAF30_L'].includes(img.ImageText);
        });

        const topRightImages = images.filter(img => {
            return ['SACR_R', 'DACR_R', 'STF45_R', 'SAF45_R', 'STD30_R', 'SAF30_R'].includes(img.ImageText);
        });

        const bottomLeftImages = images.filter(img => {
            return ['BULL90_L', 'BULL180_L', 'CBULL90_L', 'CBULL180_L', 'CBULLC_L'].includes(img.ImageText);
        });

        const bottomRightImages = images.filter(img => {
            return ['BULL90_R', 'BULL180_R', 'CBULL90_R', 'CBULL180_R', 'CBULLC_R'].includes(img.ImageText);
        });

        const winderTypeImages = images.filter(img => {
            return ['WIND_L', 'WIND_R', 'WINDC_L', 'WINDC_R', 'WINDF_L', 'WINDF_R', 'WIND45_L', 'WIND45_R', 'WIND45C_L', 'WIND45C_R'].includes(img.ImageText);
        });

        const landingTypeImages = images.filter(img => {
            return ['LANDINGL', 'LANDINGR', 'SQR_LANDINGL', 'SQR_LANDINGR', 'LANDINGSTR'].includes(img.ImageText);
        });

        sessionStorage.setItem('top_left_images', JSON.stringify(topLeftimages));
        sessionStorage.setItem('top_right_images', JSON.stringify(topRightImages));
        sessionStorage.setItem('bottom_left_images', JSON.stringify(bottomLeftImages));
        sessionStorage.setItem('bottom_right_images', JSON.stringify(bottomRightImages));
        sessionStorage.setItem('winder_type_images', JSON.stringify(winderTypeImages));
        sessionStorage.setItem('landing_type_images', JSON.stringify(landingTypeImages));
    }

    getSavedDefaultImages(name: string): any {
        return JSON.parse(sessionStorage.getItem(name) || '[]');
    }
}
