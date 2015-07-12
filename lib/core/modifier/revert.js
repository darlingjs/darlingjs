var utils = require('./../../utils/utils');
var isArray = utils.isArray;
var isFunction = utils.isFunction;
var isObject = utils.isObject;
var isString = utils.isString;

/**
 * @ignore
 * @param e
 * @param modifier
 */
function _revertModifierArray(e, modifier) {
  for (var i = 0, count = modifier.length; i < count; i++) {
    revert(e, modifier[i]);
  }
}

/**
 * @ignore
 * @param e
 * @param modifier
 */
function _revertModifierObject(e, modifier) {
  for (var key in modifier) {
    e.remove(key);
  }
}


/**
 * Revert modifier to entity
 *
 * modifier can be:
 * 1. callback function (can't be reverted);
 * 2. name of component (remove);
 * 3. object with key - components, value - is config of components (remove);
 * 4. array of components (remove);
 *
 * @param e
 * @param modifier
 */
function revert(e, modifier) {
  if (!isFunction(modifier)) {
    if (isString(modifier)) {
      e.remove(modifier);
    } else if (isArray(modifier)) {
      _revertModifierArray(e, modifier);
    } else if (isObject(modifier)) {
      _revertModifierObject(e, modifier);
    } else {
      throw new Error('Unknown modifier');
    }
  }
}

module.exports = revert;
