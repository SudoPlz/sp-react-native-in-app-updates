import _ from 'underscore';
export default class EventListenerCollection {
  listenerCollection: Array<Function> = [];

  public emitEvent(valueToEmit: unknown): void {
    if (this.listenerCollection && this.listenerCollection.length > 0) {
      for (const aListener of this.listenerCollection) {
        if (aListener) {
          aListener(valueToEmit);
        }
      }
    }
  }

  public addListener(callback: Function): void {
    if (!_.contains(this.listenerCollection, callback)) {
      this.listenerCollection.push(callback);
    }
  }

  public removeListener(callback: any) {
    if (_.contains(this.listenerCollection, callback)) {
      this.listenerCollection = _.reject(
        this.listenerCollection,
        (item: any) => item === callback
      );
    }
  }

  public hasListeners(): boolean {
    return this.listenerCollection.length > 0;
  }
}
