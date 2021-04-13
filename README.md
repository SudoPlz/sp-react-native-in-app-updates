# sp-react-native-in-app-updates

![In app update example](https://user-images.githubusercontent.com/8539174/88419625-6db0ef00-cddd-11ea-814e-389db852368b.gif)

## Getting started

<br>

### What is this?

This is a **react-native native module** that works on both **iOS** and **Android**, and checks the stores (play/app) for a new version of your app and can prompt your user for an update.

It uses **embedded** [in-app-updates via Play-Core](https://developer.android.com/guide/playcore/in-app-updates) on Android (to check & download google play patches natively from within the app), and [react-native-siren](https://github.com/GantMan/react-native-siren) on iOS (to check & navigate the user to the AppStore).

### Why?
Because to this day I'm not aware of any react-native libraries that use play core to offer embedded in-app-updates besides this one


<br>

## Installation

`$ npm install sp-react-native-in-app-updates --save`

<br>

##### iOS only:

On **iOS** you may need to also add the following lines in your Info.plist to be able to launch the store deep link.

```
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>itms-apps</string>
</array>
```
<br>

## Usage



```javascript
import SpInAppUpdates, {
  NeedsUpdateResponse,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(
  false // isDebug
);

inAppUpdates.checkNeedsUpdate({ curVersion: '0.0.8' }).then((result) => {
  if (result.shouldUpdate) {
    let updateOptions: StartUpdateOptions = {};
    if (Platform.OS === 'android') {
      // android only, on iOS the user will be promped to go to your app store page
      updateOptions = {
        updateType: IAUUpdateKind.FLEXIBLE,
      };
    }
    inAppUpdates.startUpdate(updateOptions);[](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78)
  }
});
```
<br>
<br>

### Methods:
<br>

#### `checkNeedsUpdate(checkOptions: CheckOptions) : Promise<NeedsUpdateResponse>`

Checks if there are any updates available.

Where:
`CheckOptions`

| Options | Type  | Description  |
|---|---|---|
| curVersion  | (required) String | The semver of your current app version  |
|  toSemverConverter | (optional) Function  |  This will run right after the store version is fetched in case you want to change it before it's compared as a semver |
|  customVersionComparator | (optional) Function  | By default this library uses `semver` behind the scenes to compare the store version with the `curVersion` value, but you can pass your own version comparator if you want to |

and `NeedsUpdateResponse`:

| Result | Type  | Description  |
|---|---|---|
|  shouldUpdate  | Boolean | Wether there's a newer version on the store or not  |
|  storeVersion | String  |  The latest app/play store version we're aware of |
|  other | Object  | Other info returned from the store (differs on Android/iOS) |

<br>

#### `startUpdate(checkOptions: StartUpdateOptions) : Promise`

Shows pop-up asking user if they want to update, giving them the option to download said update.

Where:
`StartUpdateOptions `

| Option | Type  | Description  |
|---|---|---|
| updateType (Android ONLY) | (required on Android) [IAUUpdateKind](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78) | Either `IAUUpdateKind.FLEXIBLE` or `IAUUpdateKind.IMMEDIATE`. This uses play-core below the hood, read more [here](https://developer.android.com/guide/playcore/in-app-updates) about the two modes. |
|  title (iOS only) | (optional) String  |  The title of the alert prompt when there's a new version. (default: `Update Available`) |
|  message (iOS only) | (optional) String  |  The content of the alert prompt when there's a new version (default: `There is an updated version available on the App Store. Would you like to upgrade?`)|
|  buttonUpgradeText (iOS only) | (optional) String  |  The text of the confirmation button on the alert prompt (default: `Upgrade `)|
|  buttonCancelText (iOS only) | (optional) String  |  The text of the cancelation button on the alert prompt (default: `Cancel`)|
|  forceUpgrade (iOS only) | (optional) Boolean  |  If set to true the user won't be able to cancel the upgrade (default: false)|

<br>

#### `installUpdate() : void` (Android only)

Installs a downloaded update.
<br>

#### `addStatusUpdateListener(callback: (status: StatusUpdateEvent) : void) : void` (Android only)

Adds a listener for tracking the current status of the update download.

Where: `StatusUpdateEvent`

| Option | Type  | Description  |
|---|---|---|
|  status | [InstallationStatus](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L1) | The status of the installation (https://developer.android.com/reference/com/google/android/play/core/install/model/InstallStatus) |
|  bytesDownloaded | int | How many bytes were already downloaded |
|  totalBytesToDownload | int | The total amount of bytes in the update |

<br>

#### `removeStatusUpdateListener(callback: (status: StatusUpdateEvent) : void): void` (Android only)

Removes an existing download status listener.
<br>
<br>

## Example:
[Example project](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/v1/Example/App.tsx#L38)
<br>
<br>

## Troubleshooting
Keep in mind that this library is JUST a **WRAPPER** of the in-app-update api, so if you have trouble making in-app-updates work it's most probably because you're doing something wrong with google play.
<br>

### Common issues:

- You're getting a `ERROR_API_NOT_AVAILABLE ` error: Probably because you're attempting to test in-app-updates on debug. You'll need to use internal app sharing in order to debug (Read more: https://stackoverflow.com/a/59456561/1658268).

- The **minimum API SDK** for android to support in-app-updates is **21**

- Your play store version or play services is out of date

Debugging is tricky, so arm yourself with patience, enable debug logs by passing true to the constructor of

<br>

## Contributing:

This library is offered as is, if you'd like to change something please open a PR

<br>

## Changelog

Read the [CHANGELOG.md](https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/CHANGELOG.md) file

## License
MIT
