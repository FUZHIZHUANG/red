function factorial(n) {
  /*if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    return NaN;
  }*/
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.log('factorial(10) =', factorial(10));
function factorial(n) {
  if (n === 0) {
    return 1;
  }
  else {
    return n * factorial(n - 1);
  }
}
console.log('factorial(10) =', factorial(10));