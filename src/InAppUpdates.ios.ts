// @ts-expect-error
import Siren from 'react-native-siren';
import { getBuildNumber } from 'react-native-device-info';

import InAppUpdatesBase from './InAppUpdatesBase';
import type {
  CheckOptions,
  IosPerformCheckResponse,
  IosStartUpdateOptions,
  IosNeedsUpdateResponse,
} from './types';

const noop = () => {};

export default class InAppUpdates extends InAppUpdatesBase {
  public checkNeedsUpdate(
    checkOptions?: CheckOptions
  ): Promise<IosNeedsUpdateResponse> {
    // @ts-expect-error
    if (checkOptions?.curVersion) {
      this.throwError(
        // throw error if old prop is used
        'Please use curVersionCode to specify a version code. (curVersion is deprecated)',
        'checkNeedsUpdate'
      );
    }
    const { curVersionCode, toSemverConverter, customVersionComparator } =
      checkOptions || {};

    const versionCode: string = this.sanitizeVersionCode(
      curVersionCode || `${getBuildNumber()}`
    ); // current ios app build number of the app that's running this code

    this.debugLog('Checking store version (iOS)');
    return Siren.performCheck()
      .then((checkResponse: IosPerformCheckResponse) => {
        this.debugLog(
          `Received response from app store: ${JSON.stringify(checkResponse)}`
        );
        const { version } = checkResponse || {};

        if (version != null) {
          const newAppV = this.sanitizeVersionCode(
            `${version}`,
            toSemverConverter
          );

          if (
            this.shouldUpdate(versionCode, newAppV, customVersionComparator)
          ) {
            // if app store version is higher than the current version
            this.debugLog(
              `Compared cur version (${versionCode}) with store version (${newAppV}). The store version is higher!`
            );
            return {
              shouldUpdate: true,
              storeVersion: newAppV,
              other: { ...checkResponse },
            };
          }

          this.debugLog(
            `Compared cur version (${versionCode}) with store version (${newAppV}). The current version is higher!`
          );
          return {
            shouldUpdate: false,
            storeVersion: newAppV,
            reason: `current version (${versionCode}) is already later than the latest store version (${newAppV}${
              toSemverConverter ? ` - originated from ${version}` : ''
            })`,
            other: { ...checkResponse },
          };
        }
        this.debugLog('Failed to fetch a store version');
        return {
          shouldUpdate: false,
          reason: 'Couldn\t fetch the latest version',
          other: { ...checkResponse },
        };
      })
      .catch((err: any) => {
        this.debugLog(err);
        this.throwError(err, 'checkNeedsUpdate');
      });
  }

  startUpdate(updateOptions: IosStartUpdateOptions): Promise<void> {
    return Promise.resolve(Siren.promptUser(updateOptions));
  }

  installUpdate = noop;
  addStatusUpdateListener = noop;
  removeStatusUpdateListener = noop;
  addIntentSelectionListener = noop;
  removeIntentSelectionListener = noop;
}
