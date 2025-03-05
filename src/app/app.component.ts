import { Observable, BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { TokenService } from '../services/token.service';
import { MaterialsService } from '../services/materials.service';
import { RiserTypesService } from '../services/riserTypes.service';
import { StairTypesService } from '../services/stairTypes.service';
import { StairStylesService } from '../services/stairStyles.service';
import { StringerStylesService } from '../services/stringerStyles.service';
import { ImagesService } from '../services/images.service';
import { ConfigService } from '../services/config.service';

import { logoutButtonDisable, logoutButtonEnable } from '../actions/buttons.actions';
import { selectLogoutButton } from './selectors/buttons.selectors';
@Component({
  selector: 'app-root',
  imports: [
    RouterModule, 
    CommonModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatIconModule
  ],
  template: `
    <main>
      <header class="brand-name">
        <a class="brand-logo-hyperlink" (click)="goToHome()">
          <!-- <img *ngIf="(menuSection$ | async) === 'Home' && !deviceDetectorService.isMobile()" class="brand-logo" src="https://www.thestairshoppe.ca/images/logo1.png" alt="logo" aria-hidden="true" /> -->
          <!-- <img *ngIf="(menuSection$ | async) === 'Home' && deviceDetectorService.isMobile()" class="brand-logo-mobile" src="https://www.thestairshoppe.ca/images/logo1.png" alt="logo" aria-hidden="true"> -->
          <div *ngIf="(menuSection$ | async) === 'Home'" class="brand-logo-title"><h2>Home</h2></div>
          <div *ngIf="(menuSection$ | async) === 'Orders'" class="brand-logo-title"><h2>Orders</h2></div>
          <div *ngIf="(menuSection$ | async) === 'Quotes'" class="brand-logo-title"><h2>Quotes</h2></div>
          <div *ngIf="(menuSection$ | async) === 'Customers'" class="brand-logo-title"><h2>{{ deviceDetectorService.isMobile() ? 'Cstmrs' : 'Customers' }}</h2></div>
          <div *ngIf="(menuSection$ | async) === 'Models'" class="brand-logo-title"><h2>Models</h2></div>
        </a>
        <button *ngIf="(logoutButton$ | async) && !deviceDetectorService.isMobile()"  mat-icon-button class="menu-button" [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
        </button>
        <button *ngIf="(logoutButton$ | async) && deviceDetectorService.isMobile()"  mat-icon-button class="menu-button-mobile" [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="goToOrders()">
            <span>Orders</span>
          </button>
          <button mat-menu-item (click)="goToQuotes()">
            <span>Quotes</span>
          </button>
          <button mat-menu-item (click)="goToCustomers()">
            <span>Customers</span>
          </button>
          <button mat-menu-item (click)="goToModels()">
            <span>Models</span>
          </button>
        </mat-menu>
          
        <button *ngIf="logoutButton$ | async" class="logout-button" (click)="logout()" role="button">Logout</button>
      </header>
      <section class="content">
        <router-outlet></router-outlet>
      </section>
      <section *ngIf="!deviceDetectorService.isMobile()" class="footer">
        <p>© Copyright 2025 Stair Shoppe</p>
      </section>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly store = inject(Store);
  private readonly tokenService = inject(TokenService);
  private readonly configService = inject(ConfigService);
  private readonly materialsService = inject(MaterialsService);
  private readonly stairStyleService = inject(StairStylesService);
  private readonly stringerStyleService = inject(StringerStylesService)
  private readonly stairTypeService = inject(StairTypesService);
  private readonly riserTypeService = inject(RiserTypesService);
  private readonly imagesService = inject(ImagesService);
  public readonly deviceDetectorService = inject(DeviceDetectorService);
  public menuSection$ = new BehaviorSubject<string>('');

  private getLastPathSegment(url: string):string {
    const match = url.match(/\/([^\/?#]+)(?:[?#].*)?$/);
    return match ? match[1] : '';
  }

  logoutButton$: Observable<boolean>;
  
  constructor(
    private router: Router
  ) {
    const section = this.getLastPathSegment(document.location.href);

    switch(section) {
      case 'home': {
        this.menuSection$.next('Home');
        break;
      }
      case 'orders': {
        this.menuSection$.next('Orders');
        break;
      };
      case 'quotes': {
        this.menuSection$.next('Quotes');
        break;
      };
      case 'customers': {
        this.menuSection$.next('Customers');
        break;
      };
      case 'models': {
        this.menuSection$.next('Models');
        break;
      };
      default: {
        this.menuSection$.next('Home');
      }
    }

    this.logoutButton$ = this.store.select(selectLogoutButton);
    this.getConfig();
  }

  async getConfig() {
    const config = await this.configService.getConfig();

    console.log('--DEBUG-- config', config);

    if (!config) {
        this.router.navigate(['/auth']);
    } else {
      await this.getMaterials();

      this.store.dispatch(logoutButtonEnable());
    }
  }

  async getMaterials() {
    const materials = await this.materialsService.getMaterials();
    const riserTypes = await this.riserTypeService.getRiserTypes();
    const stairTypes = await this.stairTypeService.getStairTypes();
    const stairStyles = await this.stairStyleService.getStairStyles();
    const imagesService = await this.imagesService.getDefaultImagesList();
    const stringerStyles = await this.stringerStyleService.getStringerStyles();

    const materialsData = materials?.data || [];
    const riserTypesData = riserTypes?.data || [];
    const stairTypesData = stairTypes?.data || [];
    const stairStylesData = stairStyles?.data || [];
    const defaultImagesData = imagesService?.data || [];
    const stringerStylesData = stringerStyles?.data || [];

    this.materialsService.setMaterials(materialsData);
    this.riserTypeService.setRiserTypes(riserTypesData);
    this.stairTypeService.setStairTypes(stairTypesData);
    this.stairStyleService.setStairStyles(stairStylesData);
    this.imagesService.setDefaultImages(defaultImagesData);
    this.stringerStyleService.setStringerStyles(stringerStylesData);
  }


  goToHome() {
    if (this.tokenService.getToken()) {
      this.menuSection$.next('Home');
      this.router.navigate(['/home']);
      this.store.dispatch(logoutButtonEnable());
    }
  }

  goToOrders() {
    if (this.tokenService.getToken()) {
      this.menuSection$.next('Orders');
      this.router.navigate(['/orders']);
      this.store.dispatch(logoutButtonEnable());
    }
  }

  goToQuotes() {
    if (this.tokenService.getToken()) {
      this.menuSection$.next('Quotes');
      this.router.navigate(['/quotes']);
      this.store.dispatch(logoutButtonEnable());
    }
  }

  goToCustomers() {
    if (this.tokenService.getToken()) {
      this.menuSection$.next('Customers');
      this.router.navigate(['/customers']);
      this.store.dispatch(logoutButtonEnable());
    }
  }

  goToModels() {
    if (this.tokenService.getToken()) {
      this.menuSection$.next('Models');
      this.router.navigate(['/models']);
      this.store.dispatch(logoutButtonEnable());
    }
  }

  logout() {
    console.log('--DEBUG-- logout');
    this.tokenService.removeToken();
    this.store.dispatch(logoutButtonDisable());
    this.router.navigate(['/auth']);
  }

  title = 'angular-stair-shoppe';
}
