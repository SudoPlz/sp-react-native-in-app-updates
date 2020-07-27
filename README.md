# sp-react-native-in-app-updates

![In app update example](https://user-images.githubusercontent.com/8539174/88419625-6db0ef00-cddd-11ea-814e-389db852368b.gif)

## Getting started

## Installation

`$ npm install sp-react-native-in-app-updates --save`


On **iOS** you may need to also add the following lines in your Info.plist to be able to launch the store deep link.

```
	<key>LSApplicationQueriesSchemes</key>
	<array>
	   <string>itms-apps</string>
	</array>
```

## Usage

### What is this?

This is a **react-native native module** that works on both **iOS** and **Android**, and checks the stores (play/app) for a new version of your app and can prompt your user for an update.

It uses **embedded** [in-app-updates via Play-Core](https://developer.android.com/guide/playcore/in-app-updates) on Android, and [react-native-siren](https://github.com/GantMan/react-native-siren) on iOS.

### Why?
Because to this day I'm not aware of any react-native libraries that use play core to offer embedded in-app-updates besides this one

### Methods:

##### `checkNeedsUpdate(checkOptions: CheckOptions) : CheckResult`

Checks if there are any updates available.

Where: 
`CheckOptions`

| Options | Type  | Description  |
|---|---|---|
| curVersion  | (required) String | The semver of your current app version  |
|  toSemverConverter | (optional) Function  |  This will run right after the store version is fetched in case you want to change it before it's compared as a semver |
|  customVersionComparator | (optional) Function  | By default this library uses `semver` behind the scenes to compare the store version with the `curVersion` value, but you can pass your own version comparator if you want to |

and `CheckResult`:

| Result | Type  | Description  |
|---|---|---|
|  shouldUpdate  | Boolean | Wether there's a newer version on the store or not  |
|  storeVersion | String  |  The latest app/play store version we're aware of |
|  other | Object  | Other info returned from the store (differs on Android/iOS) |



##### `startUpdate(checkOptions: UpdateOptions) : Promise`

Shows pop-up asking user if they want to update, giving them the option to download said update.

Where: 
`UpdateOptions `

| Option | Type  | Description  |
|---|---|---|
| updateType (Android ONLY) | (required on Android) int | Either `SpInAppUpdates.UPDATE_TYPE.FLEXIBLE` or `SpInAppUpdates.UPDATE_TYPE.IMMEDIATE`. This uses play-core below the hood, read more [here](https://developer.android.com/guide/playcore/in-app-updates) about the two modes. |
|  title (iOS only) | (optional) String  |  The title of the alert prompt when there's a new version. (default: `Update Available`) |
|  message (iOS only) | (optional) String  |  The content of the alert prompt when there's a new version (default: `There is an updated version available on the App Store. Would you like to upgrade?`)|
|  buttonUpgradeText (iOS only) | (optional) String  |  The text of the confirmation button on the alert prompt (default: `Upgrade `)|
|  buttonCancelText (iOS only) | (optional) String  |  The text of the cancelation button on the alert prompt (default: `Cancel`)|
|  forceUpgrade (iOS only) | (optional) Boolean  |  If set to true the user won't be able to cancel the upgrade (default: false)|

##### `installUpdate() : void` (Android only)

Installs a downloaded update.

##### `addStatusUpdateListener(callback: (status: UpdateStatus) : void) : void` (Android only)

Adds a listener for tracking the current status of the update download.

Where: `UpdateStatus`

| Option | Type  | Description  |
|---|---|---|
|  status | int | One of `DownloadStatusEnum` |
|  bytesDownloaded | int | How many bytes were already downloaded |
|  totalBytesToDownload | int | The total amount of bytes in the update |

and: `DownloadStatusEnum`

`SpInAppUpdates.UPDATE_STATUS.AVAILABLE` |
`SpInAppUpdates.UPDATE_STATUS.DEVELOPER_TRIGGERED` |
`SpInAppUpdates.UPDATE_STATUS.UNAVAILABLE` |
`SpInAppUpdates.UPDATE_STATUS.UNKNOWN` |
`SpInAppUpdates.UPDATE_STATUS.UPDATE_CANCELED` |
`SpInAppUpdates.UPDATE_STATUS.UPDATE_DOWNLOADED` |
`SpInAppUpdates.UPDATE_STATUS.UPDATE_DOWNLOADING` |
`SpInAppUpdates.UPDATE_STATUS.UPDATE_FAILED` |
`SpInAppUpdates.UPDATE_STATUS.UPDATE_INSTALLED` |
`SpInAppUpdates.UPDATE_STATUS.UPDATE_INSTALLING` |
`SpInAppUpdates.UPDATE_STATUS.UPDATE_PENDING`

##### `removeStatusUpdateListener(callback: (status: UpdateStatus) : void): void` (Android only)

Removes an existing download status listener.

##Example:

```javascript
import SpInAppUpdates from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates();
const HIGH_PRIORITY_UPDATE = 5; // Arbitrary, depends on how you handle priority in the Play Console

inAppUpdates.checkNeedsUpdate({
  curVersion: '4.8.8',
  toSemverConverter: (ver => {
    // i.e if 400401 is the Android version, and we want to convert it to 4.4.1
    const androidVersionNo = parseInt(ver, 10);
    const majorVer = Math.trunc(androidVersionNo / 10000);
    const minorVerStarter = androidVersionNo - majorVer * 10000;
    const minorVer = Math.trunc(minorVerStarter / 100);
    const patchVersion = Math.trunc(minorVerStarter - minorVer * 100);
    return `${majorVer}.${minorVer}.${patchVersion}`;
  })
}).then(result => {
  if (result.shouldUpdate) {
      const updateType = result.other.updatePriority >= HIGH_PRIORITY_UPDATE
          ? SpInAppUpdates.UPDATE_TYPE.IMMEDIATE
          : SpInAppUpdates.UPDATE_TYPE.FLEXIBLE;

	  inAppUpdates.startUpdate({
	    updateType, // android only, on iOS the user will be promped to go to your app store page
	  })
  }
})

```

## Contributing:

This library is offered as is, if you'd like to change something please open a PR

## License
MIT
