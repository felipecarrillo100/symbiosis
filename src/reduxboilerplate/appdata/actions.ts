import { makeAction } from '../makeAction';
import { AppEvents } from '../events';

export const SetAppDataName = makeAction<AppEvents.SET_APP_DATA_NAME, string>(
  AppEvents.SET_APP_DATA_NAME
);


export const AppDataActions = {
  SetAppDataName,
};
