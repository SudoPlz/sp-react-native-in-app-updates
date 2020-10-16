export type IncomingStatusUpdateEvent = {
    bytesDownloaded: any;
    totalBytesToDownload: any;
}

/**
 * Whether the iOS APNs message was configured as a background update notification.
 */
export type CheckOptions = {
    /**
     * The semver of your current app version
     */
    curVersion: string;

    /**
     * This will run right after the store version is fetched in case you want to change it before it's compared as a semver
     */
    toSemverConverter?: Function;

    /**
     * By default this library uses semver behind the scenes to compare the store version with the curVersion value, but you can pass your own version comparator if you want to
     */
    customVersionComparator?: Function;
}

export type SemverVersion = string;
export type SemverVersionCode = number;

export interface NeedsUpdateResponse {
    shouldUpdate: boolean;
    storeVersion: SemverVersion,
    reason: string;
}
