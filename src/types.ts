export enum AndroidInstallStatus {
  UNKNOWN = 0,
  PENDING = 1,
  DOWNLOADING = 2,
  INSTALLING = 3,
  INSTALLED = 4,
  FAILED = 5,
  CANCELED = 6,
  DOWNLOADED = 11,
}

export type InstallationResult =
  | AndroidInstallStatus.INSTALLED
  | AndroidInstallStatus.CANCELED;

export type StatusUpdateEvent = {
  bytesDownloaded: any;
  totalBytesToDownload: any;
  status: AndroidInstallStatus;
};

/**
 * Whether the iOS APNs message was configured as a background update notification.
 */
export type CheckOptions = {
  /**
   * The semver of your current app version
   */
  curVersion?: string;

  /**
   * This will run right after the store version is fetched in case you want to change it before it's compared as a semver
   */
  toSemverConverter?: (
    version: SemverVersionCode | SemverVersion
  ) => SemverVersion;

  /**
   * By default this library uses semver behind the scenes to compare the store version with the curVersion value, but you can pass your own version comparator if you want to
   */
  customVersionComparator?: (
    v1: SemverVersion,
    v2: SemverVersion
  ) => -1 | 0 | 1;

  /**
   * ISO 3166-1 country code (iOS only)
   */
  country?: string;
};

export type SemverVersion = string;
export type SemverVersionCode = number;

export interface NeedsUpdateResponseBase {
  shouldUpdate: boolean;
  storeVersion: SemverVersion;
  reason: string;
}

export enum AndroidOther {
  IN_APP_UPDATE_RESULT_KEY = 'in_app_update_result',
  IN_APP_UPDATE_STATUS_KEY = 'in_app_update_status',
}

export enum AndroidAvailabilityStatus {
  UNKNOWN = 0,
  AVAILABLE = 2,
  UNAVAILABLE = 1,
  DEVELOPER_TRIGGERED = 3,
}

export enum AndroidUpdateType {
  FLEXIBLE = 0,
  IMMEDIATE = 1,
}

export type AndroidInAppUpdateExtras = {
  updateAvailability: AndroidAvailabilityStatus;
  versionCode: SemverVersionCode;
  isFlexibleUpdateAllowed: boolean;
  isImmediateUpdateAllowed: boolean;
  packageName: string;
  totalBytes: number;
  updatePriority: number;
};

export interface AndroidNeedsUpdateResponse extends NeedsUpdateResponseBase {
  other: AndroidInAppUpdateExtras;
}
// export interface NeedsUpdateResponse

export type AndroidStatusEventListener = (status: StatusUpdateEvent) => void;
export type AndroidIntentResultListener = (
  intentResult: InstallationResult
) => void;

export type AndroidStartUpdateOptions = {
  updateType: AndroidUpdateType;
};

export type IosITunesResponse = {
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

export interface IosPerformCheckResponse extends IosITunesResponse {
  updateIsAvailable: boolean;
}

export interface IosNeedsUpdateResponse extends NeedsUpdateResponseBase {
  other: IosPerformCheckResponse;
}
export type NeedsUpdateResponse =
  | IosNeedsUpdateResponse
  | AndroidNeedsUpdateResponse;

type IosStartUpdateOption = {
  title?: string;
  message?: string;
  buttonUpgradeText?: string;
  buttonCancelText?: string;
  forceUpgrade?: boolean;
  updateType?: never;
  bundleId?: string;
  country?: string;
};

type IosStartUpdateOptionWithLocalVersion = IosStartUpdateOption & {
  localVersion: string;
};

export type IosStartUpdateOptions = IosStartUpdateOption & {
  versionSpecificOptions?: Array<IosStartUpdateOptionWithLocalVersion>;
};

export type StartUpdateOptions =
  | IosStartUpdateOptions
  | AndroidStartUpdateOptions;
