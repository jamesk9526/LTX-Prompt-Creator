// Simple test for debounce function
const { debounce } = require('../app/utils/debounce');

console.log('Testing debounce function...');

let callCount = 0;
const testFn = () => callCount++;

const debouncedFn = debounce(testFn, 100);

debouncedFn();
debouncedFn();
debouncedFn();

setTimeout(() => {
  if (callCount === 1) {
    console.log('✅ Debounce test passed: function called once after delay');
  } else {
    console.log('❌ Debounce test failed: function called', callCount, 'times');
  }
}, 200);