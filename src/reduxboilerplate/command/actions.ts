import { makeAction } from '../makeAction';
import { AppEvents } from '../events';
import {ApplicationCommandsTypes} from "../../commands/ApplicationCommandsTypes";

export const SetAppCommand = makeAction<AppEvents.SET_APP_COMMAND, ApplicationCommandsTypes | null>(
  AppEvents.SET_APP_COMMAND
);


export const AppCommandActions = {
  SetAppCommand,
};
