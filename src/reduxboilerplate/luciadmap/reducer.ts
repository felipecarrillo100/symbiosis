import { AppEvents } from '../events';
import { Actions } from '../actions';
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {Map} from "@luciad/ria/view/Map";

export interface LuciadMapReduxState {
  currentLayerId: string | null;
  treeNode: TreeNodeInterface | null;
  map: Map | null;
  proj: string;
}

const initState: LuciadMapReduxState = {
  currentLayerId: null,
  treeNode: null,
  map: null,
  // proj: "EPSG:4978",
  proj: "EPSG:3857",
};

const LuciadMapReducer = (
  state: LuciadMapReduxState = initState,
  action: Actions
): LuciadMapReduxState => {
  switch (action.type) {
    case AppEvents.SET_LUCIADMAP_CURRENT_LAYER:
      return { ...state, currentLayerId: action.payload };
    case AppEvents.SET_LUCIADMAP_TREE_NODE:
      return { ...state, treeNode: action.payload };
    case AppEvents.SET_LUCIADMAP_MAP:
      return { ...state, map: action.payload };
    case AppEvents.SET_LUCIADMAP_PROJ:
      return { ...state, proj: action.payload };
    default:
      return state;
  }
};

export {
  LuciadMapReducer
}