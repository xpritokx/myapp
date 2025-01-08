import { createReducer, on } from '@ngrx/store';
import { logoutButtonEnable, logoutButtonDisable } from '../../actions/buttons.actions';

export const initialState = false;

export const logoutButtonReducer = createReducer(
    initialState,
    on(logoutButtonEnable, (state) => {
        console.log('--DEBUG-- logoutButtonEnable dispatched', state);

        state = true;

        return state;
    }),
  on(logoutButtonDisable, (state) => {
    console.log('--DEBUG-- logoutButtonDisable dispatched', state);

    state = false;

    return state;
  }),
);