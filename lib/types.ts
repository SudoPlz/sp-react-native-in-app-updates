export enum InstallationStatus {
    UNKNOWN = 0,
    PENDING = 1,
    DOWNLOADING = 2,
    INSTALLING = 3,
    INSTALLED = 4,
    FAILED = 5,
    CANCELED = 6,
    DOWNLOADED = 11
}

export type InstallationResult = InstallationStatus.INSTALLED | InstallationStatus.CANCELED;

export type IncomingStatusUpdateEvent = {
    bytesDownloaded: any;
    totalBytesToDownload: any;
    status: InstallationStatus
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
    toSemverConverter?: (version: SemverVersionCode) => SemverVersion;

    /**
     * By default this library uses semver behind the scenes to compare the store version with the curVersion value, but you can pass your own version comparator if you want to
     */
    customVersionComparator?: (v1: SemverVersion, v2: SemverVersion) => -1 | 0 | 1;
}

export type SemverVersion = string;
export type SemverVersionCode = number;

export interface NeedsUpdateResponse {
    shouldUpdate: boolean;
    storeVersion: SemverVersion,
    reason: string;
}
