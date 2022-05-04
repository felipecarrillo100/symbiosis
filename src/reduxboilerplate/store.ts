import { applyMiddleware, combineReducers, createStore } from 'redux';

import thunk from 'redux-thunk';
import {AppCommandReducer} from "./command/reducer";
import {LuciadMapReducer} from "./luciadmap/reducer";
import {AppDataReducer} from "./appdata/reducer";


export const CombinedReducers = {
    appData: AppDataReducer,
    luciadMap: LuciadMapReducer,
    appCommand: AppCommandReducer
};

const reducers = combineReducers(CombinedReducers);

export type IAppState = ReturnType<typeof reducers>;
export const store = createStore(reducers, applyMiddleware(thunk));
