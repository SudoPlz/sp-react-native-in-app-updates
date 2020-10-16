import Siren from 'react-native-siren';

import { compareVersions } from './utils';
import InAppUpdatesBase from './InAppUpdatesBase';
import { CheckOptions } from 'sp-react-native-in-app-updates/lib/types';

export type StartUpdateOptionsIOS = { // taken from react-native-siren index.d.ts
    title?: string;
    message?: string;
    buttonUpgradeText?: string;
    buttonCancelText?: string;
    forceUpgrade?: boolean;
};;

const noop = () => {};

export default class InAppUpdatesJS extends InAppUpdatesBase {
    checkNeedsUpdate(checkOptions: CheckOptions) {
        const {
            curVersion,
            toSemverConverter,
            customVersionComparator,
        } = (checkOptions || {});
        if (!curVersion) {
            this.throwError('You have to include at least the curVersion to the options passed in checkNeedsUpdate', 'checkNeedsUpdate');
        }
        return Siren.performCheck().then((checkResponse) => {
            const info = checkResponse || {};
            const { updateIsAvailable } = info;
            const versionCode = updateIsAvailable && updateIsAvailable.version;
            if (versionCode) {
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
                    // app store version is higher than the current version
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
                reason: 'Couldn\t fetch the latest version',
                other: { ...info },
            };
        });
    }

    startUpdate(updateOptions: StartUpdateOptionsIOS): Promise<any> {
        return Promise.resolve(Siren.promptUser(updateOptions));
    }

    installUpdate = noop;
    addStatusUpdateListener = noop;
    removeStatusUpdateListener = noop;
    addIntentSelectionListener = noop;
    removeIntentSelectionListener = noop;
}

