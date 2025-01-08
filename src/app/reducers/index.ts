import { isDevMode } from '@angular/core';
import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { logoutButtonReducer } from './logoutButton.reducer'

export interface State {

}

export const reducers: ActionReducerMap<State> = {
  logoutButton: logoutButtonReducer,
};


export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
