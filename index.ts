import InAppUpdates from './lib';

export {
    UPDATE_TYPE,
    UPDATE_STATUS
} from "./lib/InAppUpdatesAndroid";
export type {
    InAppUpdateExtras,
    StartUpdateOptionsAndroid,
    NeedsUpdateResponseAndroid
} from "./lib/InAppUpdatesAndroid";

export type {
    StartUpdateOptionsIos,
    NeedsUpdateResponseIos,
} from "./lib/InAppUpdatesIos";

import {
    StartUpdateOptionsIos,
} from "./lib/InAppUpdatesIos";
import type {
    StartUpdateOptionsAndroid,
} from "./lib/InAppUpdatesAndroid";

export type StartUpdateOptions = StartUpdateOptionsIos | StartUpdateOptionsAndroid;

export * from './lib/types';

export default InAppUpdates;