import { createFeatureSelector } from '@ngrx/store';

export const selectLogoutButton = createFeatureSelector<boolean>('logoutButton');
