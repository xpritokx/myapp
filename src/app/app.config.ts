import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import {MatNativeDateModule} from "@angular/material/core";
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'
import routeConfig from './routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';

import { reducers, metaReducers } from './reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routeConfig), provideAnimationsAsync(),
    importProvidersFrom(MatNativeDateModule), 
    provideStore(reducers, {
      metaReducers
    })
],
};
