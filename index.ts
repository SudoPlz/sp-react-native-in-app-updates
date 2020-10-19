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

export * from './lib/types';

export default InAppUpdates;