import {
    NativeModules,
    NativeEventEmitter,
} from 'react-native';
import _ from 'underscore';

import { compareVersions } from './utils';
import {
    StatusUpdateEvent,
    CheckOptions,
    NeedsUpdateResponse,
    SemverVersionCode,
    InstallationResult,
} from './types';
import InAppUpdatesBase from './InAppUpdatesBase';

const { SpInAppUpdates } = NativeModules;
const SpInAppUpdatesOrEmpty = SpInAppUpdates || {};
export const UPDATE_STATUS = {
    AVAILABLE: SpInAppUpdatesOrEmpty.UPDATE_AVAILABLE,
    UNAVAILABLE: SpInAppUpdatesOrEmpty.UPDATE_NOT_AVAILABLE,
    UNKNOWN: SpInAppUpdatesOrEmpty.UPDATE_UNKNOWN,
    DEVELOPER_TRIGGERED: SpInAppUpdatesOrEmpty.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS,
    UPDATE_CANCELED: SpInAppUpdatesOrEmpty.UPDATE_CANCELED,
    UPDATE_DOWNLOADED: SpInAppUpdatesOrEmpty.UPDATE_DOWNLOADED,
    UPDATE_DOWNLOADING: SpInAppUpdatesOrEmpty.UPDATE_DOWNLOADING,
    UPDATE_FAILED: SpInAppUpdatesOrEmpty.UPDATE_FAILED,
    UPDATE_INSTALLED: SpInAppUpdatesOrEmpty.UPDATE_INSTALLED,
    UPDATE_INSTALLING: SpInAppUpdatesOrEmpty.UPDATE_INSTALLING,
    UPDATE_PENDING: SpInAppUpdatesOrEmpty.UPDATE_PENDING,
};
export const UPDATE_TYPE = {
    IMMEDIATE: SpInAppUpdatesOrEmpty.APP_UPDATE_IMMEDIATE,
    FLEXIBLE: SpInAppUpdatesOrEmpty.APP_UPDATE_FLEXIBLE,
};

export type UpdateTypeKey = keyof typeof UPDATE_TYPE;
export type UpdateTypeValue = typeof UPDATE_TYPE[UpdateTypeKey];
export type UpdateStatusKey = keyof typeof UPDATE_STATUS;
export type UpdateStatusValue = typeof UPDATE_STATUS[UpdateStatusKey];
export type InAppUpdateExtras = {
    updateAvailability: UpdateStatusValue;
    versionCode: SemverVersionCode;
};
export type StatusEventListener = (status: StatusUpdateEvent) => void;
export type IntentResultListener = (intentResult: InstallationResult) => void;
export interface NeedsUpdateResponseAndroid extends NeedsUpdateResponse {
    other: InAppUpdateExtras;
}
export type StartUpdateOptionsAndroid = {
    updateType: UpdateTypeValue;
}


export default class InAppUpdatesAndroid extends InAppUpdatesBase {
    constructor() {
        super();
        this.eventEmitter = new NativeEventEmitter(SpInAppUpdates);
        this.eventEmitter.addListener(SpInAppUpdates.IN_APP_UPDATE_STATUS_KEY, this.onIncomingNativeStatusUpdate);
        this.eventEmitter.addListener(SpInAppUpdates.IN_APP_UPDATE_RESULT_KEY, this.onIncomingNativeResult);
    }

    protected onIncomingNativeResult = (event: InstallationResult) => {
        this.resultListeners.emitEvent(event);
    }

    protected onIncomingNativeStatusUpdate = (event: StatusUpdateEvent) => {
        let {bytesDownloaded, totalBytesToDownload, status} = event;
        // This data comes from Java as a string, since React's WriteableMap doesn't support `long` type values.
        bytesDownloaded = parseInt(bytesDownloaded, 10);
        totalBytesToDownload = parseInt(totalBytesToDownload, 10);
        status = parseInt(`${status}`, 10);
        this.statusUpdateListeners.emitEvent({
            ...event,
            bytesDownloaded,
            totalBytesToDownload,
            status,
        });
    }

    public addStatusUpdateListener = (callback: StatusEventListener) => {
        this.statusUpdateListeners.addListener(callback);
        if (this.statusUpdateListeners.hasListeners()) {
            SpInAppUpdates.setStatusUpdateSubscription(true);
        }
    }

    public removeStatusUpdateListener = (callback: StatusEventListener) => {
        this.statusUpdateListeners.removeListener(callback);
        if (!this.statusUpdateListeners.hasListeners()) {
            SpInAppUpdates.setStatusUpdateSubscription(false);
        }
    }

    public addIntentSelectionListener = (callback: IntentResultListener) => {
        this.resultListeners.addListener(callback);
    }

    public removeIntentSelectionListener = (callback: IntentResultListener) => {
        this.resultListeners.removeListener(callback);
    }

    /**
     * Checks if there are any updates available.
     */
    public checkNeedsUpdate = (checkOptions: CheckOptions): Promise<NeedsUpdateResponse> => {
        const {
            curVersion,
            toSemverConverter,
            customVersionComparator,
        } = (checkOptions || {});


        if (!curVersion) {
            this.throwError('You have to include at least the curVersion to the options passed in checkNeedsUpdate', 'checkNeedsUpdate');
        }
        return SpInAppUpdates.checkNeedsUpdate()
            .then((inAppUpdateInfo: InAppUpdateExtras) => {
                const { updateAvailability, versionCode } = inAppUpdateInfo || {};

                if (updateAvailability === UPDATE_STATUS.AVAILABLE) {
                    let newAppV = `${versionCode}`;
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
                            other: { ...inAppUpdateInfo },
                        }
                    }
                    return {
                        shouldUpdate: false,
                        storeVersion: newAppV,
                        reason: `current version (${curVersion}) is already later than the latest store version (${newAppV}${toSemverConverter ? ` - originated from ${versionCode}` : ''})`,
                        other: { ...inAppUpdateInfo },
                    }
                }
                return {
                    shouldUpdate: false,
                    reason: `status: ${updateAvailability} means there's no new version available`,
                    other: { ...inAppUpdateInfo },
                }
            })
            .catch((err: any) => {
                this.throwError(err, 'checkNeedsUpdate');
            });
    }

    /**
     * 
     * Shows pop-up asking user if they want to update, giving them the option to download said update.
     */
    public startUpdate = (updateOptions: StartUpdateOptionsAndroid): Promise<any> => {
        const {
            updateType
        } = updateOptions || {};
        if (updateType !== UPDATE_TYPE.FLEXIBLE && updateType !== UPDATE_TYPE.IMMEDIATE) {
            this.throwError(`updateType should be one of: ${UPDATE_TYPE.FLEXIBLE} or ${UPDATE_TYPE.IMMEDIATE}, ${updateType} was passed.`, 'startUpdate');
        }
        return SpInAppUpdates.startUpdate(updateType)
            .catch((err: any) => {
                this.throwError(err, 'startUpdate');
            });
    }

    public installUpdate = (): void => {
        SpInAppUpdates.installUpdate();
    }
}

