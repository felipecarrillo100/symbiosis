import { InterfaceActionUnion } from './makeAction';
import { AppDataActions } from './appdata/actions';
import {LuciadMapActions} from "./luciadmap/actions";
import {AppCommandActions} from "./command/actions";


export const CombinedActions = {
  ...AppDataActions,
  ...LuciadMapActions,
  ...AppCommandActions
};

export type Actions = InterfaceActionUnion<typeof CombinedActions>;
