function compose(...arr) {
  return function (new_fun) {
    return arr.reduceRight((new_f, fn) => {
      return fn(new_f)
    }, new_fun)
  }
}

const add10 = (x) => x + 10;
const mul10 = (x) => x * 10;
const add100 = (x) => x + 100;

const result = compose(add10, mul10, add100)(10)
console.log(result)