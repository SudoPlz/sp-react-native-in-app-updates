import type {
  AndroidStartUpdateOptions,
  IosStartUpdateOptions,
  NeedsUpdateResponse,
  CheckOptions,
  AndroidIntentResultListener,
  AndroidStatusEventListener,
  ConstantsType,
} from './types';
export * from './types';
export const Constants: ConstantsType;
declare class SpInAppUpdates {
  constructor(isDebug: boolean);

  public checkNeedsUpdate(
    checkOptions: CheckOptions
  ): Promise<NeedsUpdateResponse>;

  public startUpdate(
    updateOptions: IosStartUpdateOptions | AndroidStartUpdateOptions
  ): Promise<void>;

  public installUpdate(): void;

  public addStatusUpdateListener(callback: AndroidStatusEventListener): void;
  public removeStatusUpdateListener(callback: AndroidStatusEventListener): void;

  public addIntentSelectionListener(
    callback: AndroidIntentResultListener
  ): void;

  public removeIntentSelectionListener(
    callback: AndroidIntentResultListener
  ): voi;
}
export default SpInAppUpdates;
