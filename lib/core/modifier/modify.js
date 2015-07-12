var utils = require('./../../utils/utils');
var isArray = utils.isArray;
var isDefined = utils.isDefined;
var isFunction = utils.isFunction;
var isObject = utils.isObject;
var isString = utils.isString;

/**
 * @ignore
 */
function applyModifierFunction(e, modifier) {
  modifier = modifier.call(this);
  if (isDefined(modifier)) {
    modify(e, modifier);
  }
}

/**
 * @ignore
 * @param e
 * @param modifier
 */
function applyModifierArray(e, modifier) {
  for (var i = 0, count = modifier.length; i < count; i++) {
    modify(e, modifier[i]);
  }
}

/**
 * @ignore
 * @param modifier
 */
function applyModifierObject(e, modifier) {
  for (var key in modifier) {
    var config = modifier[key];
    if (isFunction(config)) {
      config = config.call(this);
    }
    e.add(key, config);
  }
}

/**
 * Apply modifier to entity
 *
 * modifier can be:
 * 1. callback function (execute),
 * result is defined will be apply as modifier;
 * 2. name of component (add);
 * 3. object with key - components, value - is config of components (add);
 * any value can be callback that will be executed
 * and result will be used as config fo component;
 * 4. array of components (add);
 *
 * @param e
 * @param modifier
 */
function modify(e, modifier) {
  if (isFunction(modifier)) {
    applyModifierFunction(e, modifier);
  } else {
    if (isString(modifier)) {
      e.add(modifier);
    } else if (isArray(modifier)) {
      applyModifierArray(e, modifier);
    } else if (isObject(modifier)) {
      applyModifierObject(e, modifier);
    } else {
      throw new Error('Unknown modifier');
    }
  }
}

module.exports = modify;
