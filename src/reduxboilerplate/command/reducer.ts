import { AppEvents } from '../events';
import { Actions } from '../actions';
import {ApplicationCommandsTypes} from "../../commands/ApplicationCommandsTypes";

export interface AppDataReduxState {
  command: ApplicationCommandsTypes | null;
}

const initState: AppDataReduxState = {
  command: null,
};

const AppCommandReducer = (
  state: AppDataReduxState = initState,
  action: Actions
): AppDataReduxState => {
  switch (action.type) {
    case AppEvents.SET_APP_COMMAND:
      return { ...state, command: action.payload };
    default:
      return state;
  }
};

export {
  AppCommandReducer
}