'use strict';

var _ = require('lodash');

/**
 * forward methods from wrapper to wrapped instance
 *
 * @param wrapped
 * @param wrapper
 * @returns {*}
 */
module.exports = function (wrapped, wrapper) {
  if (!wrapper) {
    return wrapped;
  }

  _(wrapper)
    .functions()
    .forEach(function (key) {
      if (wrapped[key]) {
        return;
      }

      wrapped[key] = wrapper[key].bind(wrapper);
    })
    .value();

  return wrapped;
};
