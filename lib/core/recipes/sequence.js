/**
 *
 *
 * @param sequence
 * @returns {Function}
 */
module.exports = function(sequence) {
  return function() {
    return {
      sequence: sequence
    };
  };
};
