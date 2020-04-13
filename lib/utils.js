import semver from 'semver';

export const compareVersions = (versionToCheck, checkAgainst) => {
    if (versionToCheck && checkAgainst) {
    // The version consists of 3 parts.
    // 1 MAJOR, 2 MINOR, 3 LIVE_RELOAD_REV each of which contain 3 digits

    return semver.compare(
        semver.coerce(versionToCheck),
        semver.coerce(checkAgainst),
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