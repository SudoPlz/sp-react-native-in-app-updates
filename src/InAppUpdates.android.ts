import { NativeModules, NativeEventEmitter } from 'react-native';
import { getVersion } from 'react-native-device-info';

import { compareVersions } from './utils';
import {
  StatusUpdateEvent,
  CheckOptions,
  InstallationResult,
  AndroidInAppUpdateExtras,
  AndroidStatusEventListener,
  AndroidIntentResultListener,
  AndroidStartUpdateOptions,
  AndroidAvailabilityStatus,
  AndroidUpdateType,
  AndroidNeedsUpdateResponse,
} from './types';
import InAppUpdatesBase from './InAppUpdatesBase';

const { SpInAppUpdates } = NativeModules;
const SpInAppUpdatesOrEmpty: {
  IN_APP_UPDATE_STATUS_KEY: any;
  IN_APP_UPDATE_RESULT_KEY: any;
} = SpInAppUpdates || {};

export default class InAppUpdates extends InAppUpdatesBase {
  constructor() {
    super();
    this.eventEmitter = new NativeEventEmitter(SpInAppUpdates);
    this.eventEmitter.addListener(
      SpInAppUpdatesOrEmpty?.IN_APP_UPDATE_STATUS_KEY,
      this.onIncomingNativeStatusUpdate
    );
    this.eventEmitter.addListener(
      SpInAppUpdatesOrEmpty?.IN_APP_UPDATE_RESULT_KEY,
      this.onIncomingNativeResult
    );
  }

  protected onIncomingNativeResult = (event: InstallationResult) => {
    this.resultListeners.emitEvent(event);
  };

  protected onIncomingNativeStatusUpdate = (event: StatusUpdateEvent) => {
    let { bytesDownloaded, totalBytesToDownload, status } = event;
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
  };

  public addStatusUpdateListener = (callback: AndroidStatusEventListener) => {
    this.statusUpdateListeners.addListener(callback);
    if (this.statusUpdateListeners.hasListeners()) {
      SpInAppUpdates.setStatusUpdateSubscription(true);
    }
  };

  public removeStatusUpdateListener = (
    callback: AndroidStatusEventListener
  ) => {
    this.statusUpdateListeners.removeListener(callback);
    if (!this.statusUpdateListeners.hasListeners()) {
      SpInAppUpdates.setStatusUpdateSubscription(false);
    }
  };

  public addIntentSelectionListener = (
    callback: AndroidIntentResultListener
  ) => {
    this.resultListeners.addListener(callback);
  };

  public removeIntentSelectionListener = (
    callback: AndroidIntentResultListener
  ) => {
    this.resultListeners.removeListener(callback);
  };

  /**
   * Checks if there are any updates available.
   */
  public checkNeedsUpdate = (
    checkOptions?: CheckOptions
  ): Promise<AndroidNeedsUpdateResponse> => {
    const { curVersion, toSemverConverter, customVersionComparator } =
      checkOptions || {};

    let appVersion: string;
    if (curVersion) {
      appVersion = curVersion;
    } else {
      appVersion = getVersion();
    }
    this.debugLog('Checking store version (Android)');
    return SpInAppUpdates.checkNeedsUpdate()
      .then((inAppUpdateInfo: AndroidInAppUpdateExtras) => {
        const { updateAvailability, versionCode } = inAppUpdateInfo || {};
        if (updateAvailability === AndroidAvailabilityStatus.AVAILABLE) {
          let newAppV = `${versionCode}`;
          if (toSemverConverter) {
            newAppV = toSemverConverter(versionCode);
            this.debugLog(
              `Used custom semver, and converted result from store (${versionCode}) to ${newAppV}`
            );
            if (!newAppV) {
              this.throwError(
                `Couldnt convert ${versionCode} using your custom semver converter`,
                'checkNeedsUpdate'
              );
            }
          }
          const vCompRes = customVersionComparator
            ? customVersionComparator(newAppV, appVersion)
            : compareVersions(newAppV, appVersion);

          if (vCompRes > 0) {
            this.debugLog(
              `Compared cur version (${appVersion}) with store version (${newAppV}). The store version is higher!`
            );
            // play store version is higher than the current version
            return {
              shouldUpdate: true,
              storeVersion: newAppV,
              other: { ...inAppUpdateInfo },
            };
          }
          this.debugLog(
            `Compared cur version (${appVersion}) with store version (${newAppV}). The current version is higher!`
          );
          return {
            shouldUpdate: false,
            storeVersion: newAppV,
            reason: `current version (${appVersion}) is already later than the latest store version (${newAppV}${
              toSemverConverter ? ` - originated from ${versionCode}` : ''
            })`,
            other: { ...inAppUpdateInfo },
          };
        } else if (
          updateAvailability === AndroidAvailabilityStatus.DEVELOPER_TRIGGERED
        ) {
          this.debugLog('Update has already been triggered by the developer');
        } else {
          this.debugLog(
            `Failed to fetch a store version, status: ${updateAvailability}`
          );
        }

        return {
          shouldUpdate: false,
          reason: `status: ${updateAvailability} means there's no new version available`,
          other: { ...inAppUpdateInfo },
        };
      })
      .catch((err: any) => {
        this.debugLog(err);
        this.throwError(err, 'checkNeedsUpdate');
      });
  };

  /**
   *
   * Shows pop-up asking user if they want to update, giving them the option to download said update.
   */
  public startUpdate = (
    updateOptions: AndroidStartUpdateOptions
  ): Promise<void> => {
    const { updateType } = updateOptions || {};
    if (
      updateType !== AndroidUpdateType.FLEXIBLE &&
      updateType !== AndroidUpdateType.IMMEDIATE
    ) {
      this.throwError(
        `updateType should be one of: ${AndroidUpdateType.FLEXIBLE} or ${AndroidUpdateType.IMMEDIATE}, ${updateType} was passed.`,
        'startUpdate'
      );
    }
    return SpInAppUpdates.startUpdate(updateType).catch((err: any) => {
      this.throwError(err, 'startUpdate');
    });
  };

  public installUpdate = (): void => {
    SpInAppUpdates.installUpdate();
  };
}
