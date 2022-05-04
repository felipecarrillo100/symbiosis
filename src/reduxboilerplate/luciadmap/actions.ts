import { makeAction } from '../makeAction';
import { AppEvents } from '../events';
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {Map} from "@luciad/ria/view/Map";

export const SetLuciadMapTreeNode = makeAction<AppEvents.SET_LUCIADMAP_TREE_NODE, TreeNodeInterface | null>(
  AppEvents.SET_LUCIADMAP_TREE_NODE
);

export const SetLuciadMap = makeAction<AppEvents.SET_LUCIADMAP_MAP, Map | null>(
    AppEvents.SET_LUCIADMAP_MAP
);

export const SetLuciadMapProj = makeAction<AppEvents.SET_LUCIADMAP_PROJ, string>(
    AppEvents.SET_LUCIADMAP_PROJ
);

export const LuciadMapActions = {
  SetLuciadMapTreeNode,
  SetLuciadMap,
  SetLuciadMapProj
};
