class Mypromise {
  state = 'pending'
  value = undefined
  reason = undefined
  onFulfilledCallbacks = []
  onRejectedCallbacks = []

  constructor(executor) {
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(callback => callback(value));
      }
    };
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(callback => callback(reason));
      }
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onFulfilled, onRejected) {
    return new MyPromise(() => {
      if (this.state === 'fulfilled') {
        onFulfilled(this.value)
      }
      if (this.state === 'rejected') {
        onRejected(this.reason)
      }
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => onFulfilled(this.value))
        this.onRejectedCallbacks.push(() => onRejected(this.reason))
      }
    })
  }
  catch(onRejected) {
    return this.then(null, onRejected)
  }
}