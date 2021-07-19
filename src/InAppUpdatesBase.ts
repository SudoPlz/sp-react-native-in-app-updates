import type { NativeEventEmitter } from 'react-native';
import EventListenerCollection from './EventListenerCollection';
import type {
  CustomVersionComparator,
  SemverConverter,
  SemverVersion,
} from './types';
import { compareVersions, isValidSemver, sanitizeSemver } from './utils';

export default class InAppUpdatesBase {
  protected name: string;
  protected statusUpdateListeners: EventListenerCollection;
  protected resultListeners: EventListenerCollection;
  protected eventEmitter?: NativeEventEmitter;
  protected prototype: any;
  protected isDebug: boolean;

  constructor(isDebug?: boolean) {
    this.name = 'sp-react-native-in-app-updates';
    this.statusUpdateListeners = new EventListenerCollection();
    this.resultListeners = new EventListenerCollection();
    this.isDebug = isDebug || false;
  }

  public throwError = (err: string | Error, scope: string) => {
    throw new Error(`${this.name} ${`${scope} ` || ''}error: ${err}`);
  };

  public toString = (): string => {
    return this.name;
  };

  public debugLog = (message: string) => {
    if (this.isDebug) {
      console.log(`@@ in-app-updates: ${message}`);
    }
  };

  public sanitizeVersionCode = (
    newVersionCode?: SemverVersion,
    toSemverConverter?: SemverConverter
  ): SemverVersion => {
    if (toSemverConverter && newVersionCode) {
      const newAppV = toSemverConverter(newVersionCode);
      this.debugLog(
        `Used custom semver, and converted result from store (${newVersionCode}) to ${newAppV}`
      );
      if (!newAppV) {
        this.throwError(
          `Couldnt convert ${newVersionCode} using your custom semver converter`,
          'checkNeedsUpdate'
        );
      }
      return sanitizeSemver(newAppV);
    } else if (!newVersionCode) {
      this.throwError(
        `No versionCode passed given. Can't decide wether to update or not.`,
        'checkNeedsUpdate'
      );
    } else if (!isValidSemver(newVersionCode)) {
      this.throwError(
        `Received ${newVersionCode} from the store but couldnt convert it to a valid semver. Consider passing a toSemverConverter and attempt to convert it manually.`,
        'checkNeedsUpdate'
      );
    }
    return sanitizeSemver(newVersionCode!);
  };

  public shouldUpdate = (
    localVersion: SemverVersion,
    remoteVersion: SemverVersion,
    customVersionComparator?: CustomVersionComparator
  ) => {
    const comparisonResult = customVersionComparator
      ? customVersionComparator(remoteVersion, localVersion)
      : compareVersions(remoteVersion, localVersion);
    return comparisonResult > 0;
  };
}
