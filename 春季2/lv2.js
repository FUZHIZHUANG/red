const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';


/**
 * 自定义的 Promise 类
 * @template T - Promise 的值类型
 */
class MyPromise {
  /**
   * Promise 的结果
   * @type {T | unknown | null}
   * @private
   */
  #PromiseResult;
  /**
   * Promise 的状态
   * @type {'pending' | 'fulfilled' | 'rejected'}
   * @private
   */
  #PromiseState;
  /**
   * fulfilled 状态下的回调函数数组
   * @type {((value: T) => void)[]}
   * @private
   */
  #onFulfilledCallbacks;
  /**
   * rejected 状态下的回调函数数组
   * @type {((reason: unknown) => void)[]}
   * @private
   */
  #onRejectedCallbacks;

  /**
   * 构造函数，初始化 Promise
   * @param {(resolve: (value: T) => void, reject: (reason: unknown) => void) => void} executor- 执行器函数，接收 resolve 和 reject 两个参数
   */
  constructor(executor) {
    this.#PromiseState = PENDING;
    this.#PromiseResult = null;
    this.#onFulfilledCallbacks = [];
    this.#onRejectedCallbacks = [];
    const resolve = (value) => {
      //  如果当前状态是pending
      if (this.#PromiseState === PENDING) {
        // 设置状态为fulfilled
        this.#PromiseState = FULFILLED;
        // 设置结果为value
        this.#PromiseResult = value;
        // 执行回调函数
        this.#onFulfilledCallbacks.forEach(callback => callback(value));
      }
    };
    const reject = (reason) => {
      // 如果状态是pending
      if (this.#PromiseState === PENDING) {
        // 设置状态为rejected
        this.#PromiseState = REJECTED;
        // 设置值为拒绝的理由
        this.#PromiseResult = reason;
        // 拒绝的回调函数
        this.#onRejectedCallbacks.forEach(callback => callback(reason));
      }
    };
    // 调用构造方法中传入的executor函数，如果抛出错误，就把这个Promise的状态改为rejected
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * @template U - 新 Promise 的值类型
   * @param {(value: T) => U | MyPromise<U>} [onFulfilled] - 当 Promise 状态为 fulfilled 时的回调函数
   * @param {(reason: unknown) => U | MyPromise<U>} [onRejected] - 当 Promise 状态为 rejected 时的回调函数
   * @returns {MyPromise<U>} - 返回一个新的 Promise
   */
  then(onFulfilled, onRejected) {
    // 在这里保留一个this，后面会用到
    const _this = this;
    // 这个nextPromise就是返回的Promise
    let nextPromise;
    switch (this.#PromiseState) {
      // 当状态为fulfilled
      case FULFILLED:
        nextPromise = new MyPromise((resolve, reject) => {
          // 包裹一个setTimeout可以模拟微任务的效果
          setTimeout(() => {
            try {
              // 如果定义了onFulfilled就把值传到onFulfilled函数执行，否则返回原来的值
              const returnValue = onFulfilled ? onFulfilled(_this.#PromiseResult) : _this.#PromiseResult;
              // 如果返回值的是MyPromise的实例
              if (returnValue instanceof MyPromise) {
                // 对返回值执行一次then
                returnValue.then(resolve, reject);
              } else {
                // 直接执行resolve函数
                resolve(returnValue);
              }
            } catch (error) {
              // 抛出错误，直接拒绝
              reject(error);
            }
          }, 0);
        });
      // 下面几段代码和上面基本相同...
      case REJECTED:
        nextPromise = new MyPromise((resolve, reject) => {
          setTimeout(() => {
            try {
              const returnValue = onRejected ? onRejected(_this.#PromiseResult) : _this.#PromiseResult;
              if (returnValue instanceof MyPromise) {
                returnValue.then(resolve, reject);
              } else {
                reject(returnValue);
              }
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      case PENDING:
        nextPromise = new MyPromise((resolve, reject) => {
          // 将一个回调函数放进#onFulfilledCallbacks数组中
          _this.#onFulfilledCallbacks.push(() => {
            setTimeout(() => {
              try {
                // - 尝试调用 onFulfilled 函数，并将 _this.#PromiseResult 作为参数传递如果 onFulfilled 未定义，则直接使用 _this.#PromiseResult
                const returnValue = onFulfilled ? onFulfilled(_this.#PromiseResult) : _this.#PromiseResult;
                if (returnValue instanceof MyPromise) {
                  returnValue.then(resolve, reject);
                } else {
                  resolve(returnValue);
                }
              } catch (error) {
                // 如果在执行onFulfilled时发生错误，则捕获该错误并调用reject
                reject(error);
              }
            }, 0);
          });
          // 这个数组里面是所有在 Promise 状态变为 rejected 时需要执行的回调函数
          _this.#onRejectedCallbacks.push(() => {
            setTimeout(() => {
              try {
                const returnValue = onRejected ? onRejected(_this.#PromiseResult) : _this.#PromiseResult;
                if (returnValue instanceof MyPromise) {
                  returnValue.then(resolve, reject);
                } else {
                  reject(returnValue);
                }
              } catch (error) {
                reject(error);
              }
            }, 0);
          });
        });
        return nextPromise;
    }
  }

  /**
   * 之前说过，Promise.prototype.catch(onRejected) 相当于上面的Promise.prototype.then(null, onRejected)
   * @param {(reason: unknown) => T | MyPromise<T>} [onRejected] - 当 Promise 状态为 rejected 时的回调函数
   * @returns {MyPromise<T>} - 返回一个新的 Promise
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * @param {function} onFinally - 无论 Promise 状态如何都会执行的回调函数
   * @returns {MyPromise<T>} - 返回一个新的 Promise
   */
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally();
        return value;
      },
      (reason) => {
        onFinally();
        throw reason;
      }
    );
  }

  /**
   * @param {any} value - 要解析的值
   * @returns {MyPromise<any>} - 返回一个新的已解析的 Promise
   * @static
   */
  static resolve(value) {
    // 如果是MyPromise对象就直接返回
    if (value instanceof MyPromise) {
      return value;
    }
    // 如果不是，就调用构造函数返回一个新的MyPromise对象
    return new MyPromise((resolve) => resolve(value));
  }

  /**
   * @param {any} reason - 拒绝的原因
   * @returns {MyPromise<any>} - 返回一个新的已拒绝的 Promise
   * @static
   */
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  /**
   * @param {Iterable<Promise<T>>} iterable - 一个可迭代对象，包含多个 Promise 实例
   * @returns {MyPromise<T[]>} - 返回一个新的 Promise，当所有给定的 Promise 都成功时解析为一个数组，否则第一个失败的 Promise 会触发拒绝
   * @template T - Promise 的值类型
   * @static
   */
  static all(iterable) {
    return new MyPromise((resolve, reject) => {
      const iterator = iterable[Symbol.iterator]();
      const result = [];
      let count = 0;
      let index = 0; // 当前处理的元素
      // 递归处理每个元素
      const processNext = () => {
        const next = iterator.next();
        if (next.done) {
          // 当所有元素处理完毕且全部成功时 resolve
          if (count === index)
            resolve(result);
          return;
        }
        const currentIndex = index++; // 保存当前索引
        MyPromise.resolve(next.value).then((res) => {
          result[currentIndex] = res; // 按原始顺序保存结果
          count++;
          if (count === index)
            resolve(result); // 当最后一个元素处理完成时 resolve
        }, (err) => reject(err));
        processNext(); // 继续处理下一个元素
      };
      processNext();
    });
  }

  /**
   * @param {Iterable<T | MyPromise<T>>} iterable - 一个可迭代对象，包含多个 Promise 实例
   * @returns {MyPromise<T>} - 返回一个新的 Promise，它在任意一个给定的 Promise 成功或失败时立即解析或拒绝
   */
  static race(iterable) {
    return new MyPromise((resolve, reject) => {
      const iterator = iterable[Symbol.iterator]();
      let isSettled = false;
      const processNext = () => {
        if (isSettled)
          return;
        const next = iterator.next();
        if (next.done)
          return;
        MyPromise.resolve(next.value).then((res) => {
          if (!isSettled) {
            isSettled = true;
            resolve(res);
          }
        }, (err) => {
          if (!isSettled) {
            isSettled = true;
            reject(err);
          }
        });
        processNext();
      };
      processNext();
    });
  }

  /**
   * @param {Iterable<T | MyPromise<T>>} iterable - 一个可迭代对象，包含多个 Promise 实例
   * @returns {MyPromise<Array<{status: 'fulfilled' | 'rejected', value: T} | {status: 'rejected', reason: any}>>} - 返回一个新的 Promise，当所有给定的 Promise 都已完成（无论成功还是失败）时解析为一个数组
   * @static
   */
  static allSettled(iterable) {
    return new MyPromise((resolve) => {
      const iterator = iterable[Symbol.iterator]();
      const results = [];
      let index = 0;
      let completedCount = 0;
      const processNext = () => {
        const next = iterator.next();
        if (next.done) {
          if (completedCount === index)
            resolve(results);
          return;
        }
        const currentIndex = index++;
        MyPromise.resolve(next.value).then((value) => {
          results[currentIndex] = { status: 'fulfilled', value };
          completedCount++;
          if (completedCount === index)
            resolve(results);
        }, (reason) => {
          results[currentIndex] = { status: 'rejected', reason };
          completedCount++;
          if (completedCount === index)
            resolve(results);
        });
        processNext();
      };
      processNext();
    });
  }

  /**
   * @param {IIterable<T | MyPromise<T>>} iterable - 可迭代对象，包含多个 Promise 或值
   * @returns {MyPromise<T>} 新的 Promise，满足以下条件：
   * - 当任意一个 Promise 成功时立即解析
   * - 当所有 Promise 都拒绝时抛出 AggregateError
   * @static
   */
  static any(iterable) {
    return new MyPromise((resolve, reject) => {
      const iterator = iterable[Symbol.iterator]();
      const errors = [];
      let index = 0;
      let rejectedCount = 0;
      let isSettled = false;

      const processNext = () => {
        const next = iterator.next();

        // 迭代结束处理
        if (next.done) {
          if (index === rejectedCount && !isSettled) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
          return;
        }

        // 保存当前索引
        const currentIndex = index++;

        MyPromise.resolve(next.value).then(
          (value) => {
            if (!isSettled) {
              isSettled = true;
              resolve(value);
            }
          },
          (err) => {
            errors[currentIndex] = err; // 按原始顺序存储错误
            rejectedCount++;

            // 检查是否全部拒绝
            if (rejectedCount === index && !isSettled) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          }
        );

        // 继续处理下一个元素
        processNext();
      };

      processNext();
    });
  }
}
const set = new Set();
set.add(new MyPromise((resolve) => {
  setTimeout(() => {
    resolve(1);
  }, 2000);
}));
set.add(new MyPromise((resolve, reject) => {
  setTimeout(() => {
    // reject(4)
    resolve(4);
  }, 2500);
}));
set.add(new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 1000);
}));
MyPromise.race(set).then((res) => {
  console.log(res);
}, (reason) => {
  console.log(reason);
});