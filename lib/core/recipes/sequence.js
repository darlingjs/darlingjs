/**
 *
 *
 * @param sequence
 * @returns {Function}
 */
module.exports = function(sequence) {
  return function() {
    return {
      getSequence: function() {
        return sequence;
      }
    };
  };
};
