import {
    NativeModules,
    // DeviceEventEmitter,
    NativeEventEmitter,
} from 'react-native';
import _ from 'underscore';
import { compareVersions } from './utils';
const { SpInAppUpdates } = NativeModules;

const UPDATE_STATUS = {
    AVAILABLE: SpInAppUpdates.UPDATE_AVAILABLE,
    UNAVAILABLE: SpInAppUpdates.UPDATE_NOT_AVAILABLE,
    UNKNOWN: SpInAppUpdates.UPDATE_UNKNOWN,
    DEVELOPER_TRIGGERED: SpInAppUpdates.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS,
    UPDATE_CANCELED: SpInAppUpdates.UPDATE_CANCELED,
    UPDATE_DOWNLOADED: SpInAppUpdates.UPDATE_DOWNLOADED,
    UPDATE_DOWNLOADING: SpInAppUpdates.UPDATE_DOWNLOADING,
    UPDATE_FAILED: SpInAppUpdates.UPDATE_FAILED,
    UPDATE_INSTALLED: SpInAppUpdates.UPDATE_INSTALLED,
    UPDATE_INSTALLING: SpInAppUpdates.UPDATE_INSTALLING,
    UPDATE_PENDING: SpInAppUpdates.UPDATE_PENDING,
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
        this.eventEmitter = new NativeEventEmitter(SpInAppUpdates);
        this.eventEmitter.addListener(SpInAppUpdates.IN_APP_UPDATE_STATUS_KEY, this.onIncomingNativeStatusUpdate);
        this.eventEmitter.addListener(SpInAppUpdates.IN_APP_UPDATE_RESULT_KEY, this.onIncomingNativeResult);

    }

    onIncomingNativeResult = (event) => {
        if (this.resultListeners && this.resultListeners.length > 0) {
            for (const aListener of this.resultListeners) {
                aListener(event);
            }
        }
    }

    onIncomingNativeStatusUpdate = (event) => {
        let {bytesDownloaded, totalBytesToDownload} = event;
        // This data comes from Java as a string, since React's WriteableMap doesn't support `long` type values.
        bytesDownloaded = parseInt(bytesDownloaded, 10);
        totalBytesToDownload = parseInt(totalBytesToDownload, 10);
        if (this.statusUpdateListeners && this.statusUpdateListeners.length > 0) {
            for (const aListener of this.statusUpdateListeners) {
                aListener({
                    ...event,
                    bytesDownloaded,
                    totalBytesToDownload,
                });
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
            customVersionComparator,
        } = checkOptions;
        if (!curVersion) {
            this.throwError('You have to include at least the curVersion to the options passed in checkNeedsUpdate', 'checkNeedsUpdate');
        }
        return SpInAppUpdates.checkNeedsUpdate()
            .then(inAppUpdateInfo => {
                const info = inAppUpdateInfo || {};
                const {
                    // isFlexibleUpdateAllowed,
                    // isImmediateUpdateAllowed,
                    // packageName,
                    // totalBytes,
                    updateAvailability,
                    versionCode,
                } = info;
                if (updateAvailability === UPDATE_STATUS.AVAILABLE) {
                    let newAppV = versionCode;
                    if (toSemverConverter) {
                        newAppV = toSemverConverter(versionCode);
                        if (!newAppV) {
                            this.throwError(`Couldnt convert ${versionCode} using your custom semver converter`, 'checkNeedsUpdate');
                        }
                    }
                    const vCompRes = customVersionComparator ?
                        customVersionComparator(newAppV, curVersion)
                        :
                        compareVersions(newAppV, curVersion);

                    if (vCompRes > 0) {
                        // play store version is higher than the current version
                        return {
                            shouldUpdate: true,
                            storeVersion: newAppV,
                            other: { ...info },
                        }
                    }
                    return {
                        shouldUpdate: false,
                        storeVersion: newAppV,
                        reason: `current version (${curVersion}) is already later than the latest store version (${newAppV}${toSemverConverter ? ` - originated from ${versionCode}` : ''})`,
                        other: { ...info },
                    }
                }
                return {
                    shouldUpdate: false,
                    reason: `status: ${updateAvailability} means there's no new version available`,
                    other: { ...info },
                }
            })
            .catch(err => {
                this.throwError(err, 'checkNeedsUpdate');
            });
    }

    startUpdate(updateOptions) {
        const {
            updateType
        } = updateOptions || {};
        if (updateType !== UPDATE_TYPE.FLEXIBLE && updateType !== UPDATE_TYPE.IMMEDIATE) {
            this.throwError(`updateType should be one of: ${UPDATE_TYPE.FLEXIBLE} or ${UPDATE_TYPE.IMMEDIATE}, ${updateType} was passed.`, 'startUpdate');
        }
        return SpInAppUpdates.startUpdate(updateType)
            .catch(err => {
                this.throwError(err, 'startUpdate');
            });
    }

    installUpdate() {
        SpInAppUpdates.installUpdate();
    }

    toString() {
        return this.name;
    }
}
SpInAppUpdatesModule.UPDATE_STATUS = UPDATE_STATUS
SpInAppUpdatesModule.UPDATE_TYPE = UPDATE_TYPE
export default SpInAppUpdatesModule;
