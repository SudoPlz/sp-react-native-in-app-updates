// @ts-expect-error
import InAppUpdates from './lib/index';
export {
    InAppUpdateExtras,
    StartUpdateOptionsAndroid,
    NeedsUpdateResponseAndroid,
    UPDATE_TYPE,
    UPDATE_STATUS,
} from "./lib/InAppUpdatesAndroid";

export {
    StartUpdateOptionsIos,
    NeedsUpdateResponseIos,
} from "./lib/InAppUpdatesIos";

export * from './lib/types';

export default InAppUpdates;