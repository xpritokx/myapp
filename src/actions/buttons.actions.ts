import { createAction } from '@ngrx/store';

export const logoutButtonEnable = createAction('[Button] Logout Visibility');
export const logoutButtonDisable = createAction('[Button] Logout Hiding');
