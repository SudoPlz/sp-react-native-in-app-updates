import semver from 'semver';
import type { SemverVersion } from './types';

export const compareVersions = (
  versionToCheck: SemverVersion,
  checkAgainst: SemverVersion
) => {
  if (versionToCheck && checkAgainst) {
    // The version consists of 3 parts.
    // 1 MAJOR, 2 MINOR, 3 LIVE_RELOAD_REV each of which contain 3 digits

    return semver.compare(
      // @ts-ignore
      semver.coerce(versionToCheck),
      semver.coerce(checkAgainst)
    );
  }
  if (versionToCheck && checkAgainst == null) {
    return 1;
  }
  if (checkAgainst && versionToCheck == null) {
    return -1;
  }
  return 0;
};
