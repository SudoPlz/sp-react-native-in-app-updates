import type { CheckOptions, IosStartUpdateOptions } from './types';
import { getBundleId } from 'react-native-device-info';
import InAppUpdatesBase from './InAppUpdatesBase';
import Siren from 'react-native-siren';

const noop = () => {};

export default class InAppUpdates extends InAppUpdatesBase {
  public async checkNeedsUpdate(checkOptions?: CheckOptions): Promise<any> {
    const { country } = checkOptions || {};

    const bundleId = getBundleId();
    this.debugLog('Checking store version (iOS)');

    try {
      const response = await Siren.performCheck({
        bundleId: bundleId,
        country,
      });
      this.debugLog(
        `Received response from app store: ${JSON.stringify(response)}`
      );
      if (response.updateIsAvailable) {
        this.debugLog(`The store version is higher!`);
        return new Promise((resolve, _) => {
          resolve({
            shouldUpdate: true,
            reason: 'The store version is higher!',
            other: response,
          });
        });
      } else {
        return new Promise((resolve, _) => {
          resolve({
            shouldUpdate: false,
            reason: `already latest store version`,
            other: response,
          });
        });
      }
    } catch (error: any) {
      this.debugLog(error);
      this.throwError(error, 'checkNeedsUpdate');
    }
  }

  startUpdate(updateOptions: IosStartUpdateOptions): Promise<void> {
    return Promise.resolve(
      Siren.promptUser(updateOptions, updateOptions?.versionSpecificOptions)
    );
  }

  installUpdate = noop;
  addStatusUpdateListener = noop;
  removeStatusUpdateListener = noop;
  addIntentSelectionListener = noop;
  removeIntentSelectionListener = noop;
}
