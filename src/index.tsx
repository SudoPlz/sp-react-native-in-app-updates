import { NativeModules } from 'react-native';

type SpReactNativeInAppUpdatesType = {
  multiply(a: number, b: number): Promise<number>;
};

const { SpReactNativeInAppUpdates } = NativeModules;

export default SpReactNativeInAppUpdates as SpReactNativeInAppUpdatesType;
