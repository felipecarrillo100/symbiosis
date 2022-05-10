import { AppEvents } from '../events';
import { Actions } from '../actions';
import {DataBaseManager} from "../../utils/DataBaseManager";

export interface AppDataReduxState {
  databaseManager: DataBaseManager | null;
}

const initState: AppDataReduxState = {
  databaseManager: null,
};

const DatabaseReducer = (
  state: AppDataReduxState = initState,
  action: Actions
): AppDataReduxState => {
  switch (action.type) {
    case AppEvents.SET_DATABSE_MANAGER:
      return { ...state, databaseManager: action.payload };
    default:
      return state;
  }
};

export {
  DatabaseReducer
}