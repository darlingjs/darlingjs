'use strict';

var utils = require('./../utils/utils');
var copy = utils.copy;
var isDefined = utils.isDefined;
var isObject = utils.isObject;
var isString = utils.isString;
var isUndefined = utils.isUndefined;
var swallowCopy = utils.swallowCopy;

var components = {};

/**
 * Define component.
 * if component already defined under _name than function return component with config customization.
 * if component doesn't define function defines it the world under _name with @config state.
 * But if config doesn't defined it's create empty puppet
 *
 * @param {string} name name of component
 * @param {object} [config] state of component
 *
 * @return {Object}
 */
module.exports = function (name, config) {
  var defaultConfig;
  var instance;

  if (!isString(name)) {
    throw new Error('1st argument must be [String]');
  }

  defaultConfig = components[name];
  if (isUndefined(defaultConfig)) {
    //define new custom component
    if (isDefined(config) && config !== null) {
      if (!config._name && isObject(config)) {
        config._name = name;
      }
      components[name] = config;
    } else {
      config = {
        _name: name
      };
      components[name] = config;
      config = copy(config);
    }
    instance = config;
  } else {
    instance = copy(defaultConfig);
    if (isDefined(config) && config !== null) {
      swallowCopy(instance, config);
    }
  }

  return instance;
};
