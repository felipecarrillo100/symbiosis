import { AppEvents } from '../events';
import { Actions } from '../actions';

export interface AppDataReduxState {
  name: string;
}

const initState: AppDataReduxState = {
  name: "",
};

const AppDataReducer = (
  state: AppDataReduxState = initState,
  action: Actions
): AppDataReduxState => {
  switch (action.type) {
    case AppEvents.SET_APP_DATA_NAME:
      return { ...state, name: action.payload };
    default:
      return state;
  }
};

export {
  AppDataReducer
}