// @ts-expect-error
import Siren from 'react-native-siren';

import { compareVersions } from './utils';
import InAppUpdatesBase from './InAppUpdatesBase';
import {
    CheckOptions,
    NeedsUpdateResponse,
} from './types';

export type StartUpdateOptionsIos = { // taken from react-native-siren index.d.ts
    title?: string;
    message?: string;
    buttonUpgradeText?: string;
    buttonCancelText?: string;
    forceUpgrade?: boolean;
};

export type ITunesResponse = {
    screenshotUrls: string[];
    ipadScreenshotUrls: string[];
    appletvScreenshotUrls: string[];
    artworkUrl60: string;
    artworkUrl512: string;
    artworkUrl100: string;
    artistViewUrl: string;
    supportedDevices: string[];
    advisories: string[];
    isGameCenterEnabled: string[];
    features: string[];
    kind: string;
    trackCensoredName: string;
    languageCodesISO2A: string[];
    fileSizeBytes: string;
    contentAdvisoryRating: string;
    averageUserRatingForCurrentVersion: number;
    userRatingCountForCurrentVersion: number;
    averageUserRating: number;
    trackViewUrl: string;
    trackContentRating: string;
    isVppDeviceBasedLicensingEnabled: boolean;
    trackId: number;
    trackName: string;
    releaseDate: string;
    genreIds: string[];
    formattedPrice: string;
    primaryGenreName: string;
    minimumOsVersion: string;
    currentVersionReleaseDate: string;
    releaseNotes: string;
    primaryGenreId: number;
    sellerName: string;
    currency: string;
    description: string;
    artistId: number;
    artistName: string;
    genres: string[];
    price: number;
    bundleId: string;
    version: string;
    wrapperType: string;
    userRatingCount: number;
};

export type PerformCheckResponse = {
    updateIsAvailable: boolean;
    latestInfo: ITunesResponse;
}

export interface NeedsUpdateResponseIos extends NeedsUpdateResponse {
    other: PerformCheckResponse;
}

const noop = () => {};

export default class InAppUpdatesIos extends InAppUpdatesBase {
    public checkNeedsUpdate(checkOptions: CheckOptions): Promise<NeedsUpdateResponse> {
        const {
            curVersion,
            toSemverConverter,
            customVersionComparator,
        } = (checkOptions || {});
        if (!curVersion) {
            this.throwError('You have to include at least the curVersion to the options passed in checkNeedsUpdate', 'checkNeedsUpdate');
        }
        return Siren.performCheck().then((checkResponse: PerformCheckResponse) => {
            const {
                updateIsAvailable,
                latestInfo,
            } = (checkResponse || {});

            if (updateIsAvailable) {
                const versionCode = latestInfo && latestInfo.version;
                if (versionCode) {
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
                        // app store version is higher than the current version
                        return {
                            shouldUpdate: true,
                            storeVersion: newAppV,
                            other: { ...checkResponse },
                        }
                    }
                    return {
                        shouldUpdate: false,
                        storeVersion: newAppV,
                        reason: `current version (${curVersion}) is already later than the latest store version (${newAppV}${toSemverConverter ? ` - originated from ${versionCode}` : ''})`,
                        other: { ...checkResponse },
                    }
                }
            }
            return {
                shouldUpdate: false,
                reason: 'Couldn\t fetch the latest version',
                other: { ...checkResponse },
            };
        });
    }

    startUpdate(updateOptions: StartUpdateOptionsIos): Promise<any> {
        return Promise.resolve(Siren.promptUser(updateOptions));
    }

    installUpdate = noop;
    addStatusUpdateListener = noop;
    removeStatusUpdateListener = noop;
    addIntentSelectionListener = noop;
    removeIntentSelectionListener = noop;
}

