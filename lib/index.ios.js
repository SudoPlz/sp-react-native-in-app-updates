import {
    NativeModules,
    // DeviceEventEmitter,
    NativeEventEmitter,
} from 'react-native';
import _ from 'underscore';
import Siren from 'react-native-siren'

import { compareVersions } from './utils';

const UPDATE_STATUS = {
    AVAILABLE: SpInAppUpdates.UPDATE_AVAILABLE,
    UNAVAILABLE: SpInAppUpdates.UPDATE_NOT_AVAILABLE,
    UNKNOWN: SpInAppUpdates.UPDATE_UNKNOWN,
    DEVELOPER_TRIGGERED: SpInAppUpdates.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS,
};
const UPDATE_TYPE = {
    IMMEDIATE: SpInAppUpdates.APP_UPDATE_IMMEDIATE,
    FLEXIBLE: SpInAppUpdates.APP_UPDATE_FLEXIBLE,
};

export class SpInAppUpdatesModule {
    constructor() {
        this.name = 'sp-react-native-in-app-updates';
        this.statusUpdateListeners = [];
        this.resultListeners = [];
        // this.eventEmitter = new NativeEventEmitter(SpInAppUpdates);
        // this.eventEmitter.addListener(SpInAppUpdates.IN_APP_UPDATE_STATUS_KEY, this.onIncomingNativeStatusUpdate);
        // this.eventEmitter.addListener(SpInAppUpdates.IN_APP_UPDATE_RESULT_KEY, this.onIncomingNativeResult);
        
    }

    onIncomingNativeResult(event) {
        if (this.resultListeners && this.resultListeners.length > 0) {
            for (const aListener of this.resultListeners) {
                aListener(event);
            }
        }
    }

    onIncomingNativeStatusUpdate(event) {
        if (this.statusUpdateListeners && this.statusUpdateListeners.length > 0) {
            for (const aListener of this.statusUpdateListeners) {
                aListener(event);
            }
        }
    }

    addStatusUpdateListener(callback) {
        if (!_.contains(this.statusUpdateListeners, callback)) {
            this.statusUpdateListeners.push(callback);
        }
        if (this.statusUpdateListeners.length > 0) {
            SpInAppUpdates.setStatusUpdateSubscription(true);
        }
    }

    removeStatusUpdateListener(callback) {
        if (_.contains(this.statusUpdateListeners, callback)) {
            this.statusUpdateListeners = _.reject(this.statusUpdateListeners, item => item === callback);
        }
        if (this.statusUpdateListeners.length <= 0) {
            SpInAppUpdates.setStatusUpdateSubscription(false);
        }
    }

    addIntentSelectionListener(callback) {
        if (!_.contains(this.resultListeners, callback)) {
            this.resultListeners.push(callback);
        }
    }

    removeIntentSelectionListener(callback) {
        if (_.contains(this.resultListeners, callback)) {
            this.resultListeners = _.reject(this.resultListeners, item => item === callback);
        }
    }

    throwError(err, scope) {
        throw new Error(`${this.name} ${`${scope} ` || ''}error: ${err}`)
    }

    checkNeedsUpdate(checkOptions = {}) {
        const {
            curVersion,
            toSemverConverter,
        } = checkOptions;
        if (!curVersion) {
            this.throwError('You have to include at least the curVersion to the options passed in checkNeedsUpdate', 'checkNeedsUpdate');
        }
        const {
            // isFlexibleUpdateAllowed,
            // isImmediateUpdateAllowed,
            // packageName,
            // totalBytes,
            updateAvailability,
            versionCode,
        } = inAppUpdateInfo || {};
        Siren.performCheck().then(({ updateIsAvailable }) => {
            if (updateIsAvailable) {
              showCustomUpdateModal()
            }
          })
    }

    startUpdate(updateType) {
        if (updateType !== UPDATE_TYPE.FLEXIBLE && updateType !== UPDATE_TYPE.IMMEDIATE) {
            this.throwError(`Update type should be one of: ${UPDATE_TYPE.FLEXIBLE} or ${UPDATE_TYPE.IMMEDIATE}, ${updateType} was passed.`, 'startUpdate');
        }
        
    }

    toString() {
        return this.name;
    }
}
// SpInAppUpdatesModule.UPDATE_STATUS = UPDATE_STATUS
// SpInAppUpdatesModule.UPDATE_TYPE = UPDATE_TYPE
export default SpInAppUpdatesModule;