import { makeAction } from '../makeAction';
import { AppEvents } from '../events';
import {DataBaseManager} from "../../utils/DataBaseManager";

export const SetDatabaseManager = makeAction<AppEvents.SET_DATABSE_MANAGER, DataBaseManager | null>(
  AppEvents.SET_DATABSE_MANAGER
);


export const DatabaseActions = {
  SetDatabaseManager,
};
