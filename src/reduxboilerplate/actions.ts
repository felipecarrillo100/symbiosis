import { InterfaceActionUnion } from './makeAction';
import { AppDataActions } from './appdata/actions';
import {LuciadMapActions} from "./luciadmap/actions";
import {AppCommandActions} from "./command/actions";
import {DatabaseActions} from "./database/actions";


export const CombinedActions = {
  ...AppDataActions,
  ...LuciadMapActions,
  ...AppCommandActions,
  ...DatabaseActions
};

export type Actions = InterfaceActionUnion<typeof CombinedActions>;
