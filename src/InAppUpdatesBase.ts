import type { NativeEventEmitter } from 'react-native';
import EventListenerCollection from './EventListenerCollection';

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
}
