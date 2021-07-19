# 1.0.* -> 2.*.*

Better version comparison, and more sane types


## BREAKING CHANGES:
## NO LONGER using version names (curVersion parameter)

Instead we now striclty use version codes (curVersionCode parameter)

Also when NO version is passed, we no longer get the current version name, instead we get the current version number.

Change:
`curVersion` to `curVersionCode` and make sure that's a versionCode on android and a CFBundleVersion on iOS
### Changed how we import constants

Change:
- `IAUUpdateKind` to `AndroidUpdateType`

- `IAUAvailabilityStatus` to `AndroidAvailabilityStatus`

- `IAUInstallStatus` to `AndroidInstallStatus`

- `IAUOther` to `AndroidOther`







# 0.\*.\* -> 1.0.*

## BREAKING CHANGES:

### Changed how we import constants

Change:

- `SpInAppUpdates.UPDATE_TYPE` to `IAUUpdateKind`

- `SpInAppUpdates.UPDATE_STATUS` to `IAUAvailabilityStatus ` (and `IAUInstallStatus`) depending on what the status relates to (read on).


The following:

```
PENDING = 1,
DOWNLOADING = 2,
INSTALLING = 3,
INSTALLED = 4,
FAILED = 5,
CANCELED = 6,
DOWNLOADED = 11,
```

are all installation statuses, therefore they all belong to `IAUInstallStatus` from now on.

While the statuses below:

```
UNKNOWN = 0,
UNAVAILABLE = 1,
AVAILABLE = 2,
DEVELOPER_TRIGGERED = 3,
```

describe the update availability, and therefore belong to: `IAUAvailabilityStatus`

- Also the way to import those from now in is this:

`import { IAUUpdateKind, IAUInstallStatus, IAUAvailabilityStatus } from 'sp-react-native-in-app-updates';`