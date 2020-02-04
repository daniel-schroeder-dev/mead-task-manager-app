const { fahrenheitToCelsius, celsiusToFahrenheit, add } = require('../src/math');

//
// Goal: Test temperature conversion functions
//
// 1. Export both functions and load them into test suite
// 2. Create "Should convert 32 F to 0 C"
// 3. Create "Should convert 0 C to 32 F"
// 4. Run the Jest to test your work!

test('Should convert 32 F to 0 C', () => {
  expect(fahrenheitToCelsius(32)).toBe(0);
});

test('Should convert 0 C to 32 F', () => {
  expect(celsiusToFahrenheit(0)).toBe(32);
});

// test('Async test demo', (done) => {
//   setTimeout(() => {
//     expect(1).toBe(2);
//     done();
//   }, 1000);
// });

test('Should add two numbers', () => {
  return add(2, 3).then((sum) => {
    expect(sum).toBe(5);
  });
});

test('Should add two numbers async/await', async () => {
  await expect(add(2, 5)).resolves.toBe(7);
});