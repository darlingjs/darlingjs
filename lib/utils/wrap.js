'use strict';

var _ = require('lodash');

/**
 * forward methods from wrapper to wrapped instance
 *
 * @param wrapped
 * @param wrapper
 * @returns {*}
 */
module.exports = function(wrapped, wrapper) {
  if (!wrapped) {
    return wrapper;
  }

  _(wrapped).functions().forEach(function(key) {
    if (wrapper[key]) {
      return;
    }

    var fn = wrapped[key];
    wrapper[key] = function() {
      return fn.apply(wrapped, arguments);
    };
  }).value();

  return wrapper;
};
