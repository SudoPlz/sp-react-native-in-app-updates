/* eslint-disable no-alert */
import React from 'react';
import SpInAppUpdates, {
  NeedsUpdateResponse,
  IAUUpdateKind,
  StartUpdateOptions,
  StatusUpdateEvent,
} from 'sp-react-native-in-app-updates';

import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  Button,
  Platform,
  Text,
} from 'react-native';

const BUTTON_COLOR = '#46955f';

const HIGH_PRIORITY_UPDATE = 5; // Arbitrary, depends on how you handle priority in the Play Console
type AppState = {
  needsUpdate: boolean | null;
  otherData?: NeedsUpdateResponse | null;
  error: string | null;
};
export default class App extends React.Component<{}, AppState> {
  private inAppUpdates: SpInAppUpdates;

  state = {
    needsUpdate: null,
    otherData: null,
    error: null,
  };

  constructor(props: any) {
    super(props);
    this.inAppUpdates = new SpInAppUpdates(
      true // debug verbosely
    );
  }

  checkForUpdates = () => {
    this.inAppUpdates
      .checkNeedsUpdate({
        curVersion: '0.0.8',
        // toSemverConverter: (ver: SemverVersion) => {
        //   // i.e if 400401 is the Android version, and we want to convert it to 4.4.1
        //   const androidVersionNo = parseInt(ver, 10);
        //   const majorVer = Math.trunc(androidVersionNo / 10000);
        //   const minorVerStarter = androidVersionNo - majorVer * 10000;
        //   const minorVer = Math.trunc(minorVerStarter / 100);
        //   const patchVersion = Math.trunc(minorVerStarter - minorVer * 100);
        //   return `${majorVer}.${minorVer}.${patchVersion}`;
        // },
      })
      .then((result: NeedsUpdateResponse) => {
        this.setState({
          needsUpdate: result.shouldUpdate,
          otherData: result,
        });
      })
      .catch((error) => {
        this.setState({
          error,
        });
      });
  };

  startUpdating = () => {
    if (this.state.needsUpdate) {
      let updateOptions: StartUpdateOptions = {};
      if (Platform.OS === 'android' && this.state.otherData) {
        const { otherData } = this.state || {
          otherData: null,
        };
        // @ts-expect-error TODO: Check if updatePriority exists
        if (otherData?.updatePriority >= HIGH_PRIORITY_UPDATE) {
          updateOptions = {
            updateType: IAUUpdateKind.IMMEDIATE,
          };
        } else {
          updateOptions = {
            updateType: IAUUpdateKind.FLEXIBLE,
          };
        }
      }
      this.inAppUpdates.addStatusUpdateListener(this.onStatusUpdate);
      this.inAppUpdates.startUpdate(updateOptions);
    } else {
      // @ts-ignore
      alert('doesnt look like we need an update');
    }
  };

  onStatusUpdate = (event: StatusUpdateEvent) => {
    // const {
    //   // status,
    //   bytesDownloaded,
    //   totalBytesToDownload,
    // } = status;
    // do something
    console.log(`@@ ${JSON.stringify(event)}`);
  };

  render() {
    const { needsUpdate, error } = this.state;
    let statusTxt;
    if (needsUpdate) {
      statusTxt = 'YES';
    } else if (needsUpdate === false) {
      statusTxt = 'NO';
    } else if (error) {
      statusTxt = 'Error, check below';
    } else {
      statusTxt = 'Not sure yet';
    }
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <View style={styles.container}>
            <View style={styles.aButton}>
              <Button
                title="Check for updates"
                color={BUTTON_COLOR}
                onPress={this.checkForUpdates}
              />
            </View>
            <View style={styles.aButton}>
              <Button
                disabled={!needsUpdate}
                title="Start Updating"
                color={BUTTON_COLOR}
                onPress={this.startUpdating}
              />
            </View>
            <View
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                // backgroundColor: 'pink'
                alignItems: 'center',
              }}
            >
              <Text
                style={styles.textStyle}
              >{`Needs update: ${'\n'}${statusTxt}`}</Text>
            </View>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTextStyle}>{`Error: ${error}`}</Text>
              </View>
            ) : null}
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#77464C',
    justifyContent: 'center',
  },
  aButton: {
    marginVertical: 25,
    borderRadius: 8,
    marginHorizontal: 50,
  },
  textStyle: {
    color: '#d09a9a',
    fontSize: 26,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'red',
  },
  errorTextStyle: {
    color: 'black',
    fontSize: 14,
  },
});
