/**
 * Assertion Utilities for Champion Matchup Test Suite
 */

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

function ok(value, message = 'Expected value to be truthy') {
  if (!value) {
    throw new AssertionError(message, value, true);
  }
}

function isTrue(value, message = 'Expected value to be strictly true') {
  if (value !== true) {
    throw new AssertionError(message, value, true);
  }
}

function isFalse(value, message = 'Expected value to be strictly false') {
  if (value !== false) {
    throw new AssertionError(message, value, false);
  }
}

function equal(actual, expected, message) {
  if (actual !== expected) {
    const msg = message || `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function notEqual(actual, expected, message) {
  if (actual === expected) {
    const msg = message || `Expected ${JSON.stringify(actual)} to not equal ${JSON.stringify(expected)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function deepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message || `Expected deep equality:\nActual:   ${actualStr}\nExpected: ${expectedStr}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function greaterThan(actual, expected, message) {
  if (!(actual > expected)) {
    const msg = message || `Expected ${actual} to be greater than ${expected}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function greaterThanOrEqual(actual, expected, message) {
  if (!(actual >= expected)) {
    const msg = message || `Expected ${actual} to be greater than or equal to ${expected}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function lessThan(actual, expected, message) {
  if (!(actual < expected)) {
    const msg = message || `Expected ${actual} to be less than ${expected}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function inRange(actual, min, max, message) {
  if (actual < min || actual > max) {
    const msg = message || `Expected ${actual} to be in range [${min}, ${max}]`;
    throw new AssertionError(msg, actual, { min, max });
  }
}

function matches(actual, regex, message) {
  if (!regex.test(actual)) {
    const msg = message || `Expected "${actual}" to match regex ${regex}`;
    throw new AssertionError(msg, actual, regex);
  }
}

function throws(fn, errorMatcher, message) {
  let threw = false;
  let caughtError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }
  if (!threw) {
    throw new AssertionError(message || 'Expected function to throw an error, but it did not', null, 'Error');
  }
  if (errorMatcher) {
    if (typeof errorMatcher === 'string') {
      if (!caughtError.message.includes(errorMatcher)) {
        throw new AssertionError(`Expected error message to include "${errorMatcher}", got "${caughtError.message}"`, caughtError.message, errorMatcher);
      }
    } else if (errorMatcher instanceof RegExp) {
      if (!errorMatcher.test(caughtError.message)) {
        throw new AssertionError(`Expected error message to match ${errorMatcher}, got "${caughtError.message}"`, caughtError.message, errorMatcher);
      }
    }
  }
}

function doesNotThrow(fn, message) {
  try {
    fn();
  } catch (err) {
    throw new AssertionError(message || `Expected function not to throw, but it threw: ${err.message}`, err, null);
  }
}

module.exports = {
  AssertionError,
  ok,
  isTrue,
  isFalse,
  equal,
  notEqual,
  deepEqual,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  inRange,
  matches,
  throws,
  doesNotThrow
};
