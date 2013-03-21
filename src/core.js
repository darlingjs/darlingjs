/**
 * Module
 * @module core
 */

(function() {
    'use strict';

    var Module = function(){
        this._components = {};
        this._systems = {};
    };

    Module.prototype.has = function(name) {
        return isDefined(this._components[name])
            || isDefined(this._systems[name]);
    }

    /**
     * Declare Component
     *
     * @type {Function}
     */
    Module.prototype.c = Module.prototype.component = function(name, defaultState) {
        var component = {
            name: name,
            defaultState: defaultState
        };
        this._components[name] = component;
        return this;
    };

    /**
     * Declare System. Like a filter in AngularJS
     *
     * @type {Function}
     */
    Module.prototype.s = Module.prototype.system = function(name, config) {
        if (isUndefined(name)) {
            throw Error('System name must to be defined.');
        }
        config = config || {};
        config.name = name;

        if (isDefined(this._systems[name])) {
            throw Error('Module "' + this.name + '" already has system with name "' + name + '".');
        }
        var instance = new System();
        instance.name = name;
        this._systems[name] = instance;//copy(config, new System());
        return this;
    };

    var World = function(){
        this._injectedComponents = {};
        this._injectedModules = {};
        this._injectedSystems = {};
        this._systems = [];
    };

    World.isInstanceOf = function(instance) {
        return instance.toString() === 'World';
    };

    World.prototype.name = '';

    World.prototype.has = function(name) {
        return isDefined(this._injectedComponents[name])
            || isDefined(this._injectedModules[name])
            || isDefined(this._injectedSystems[name]);
    }

    World.prototype.isUse = function(name) {
        for (var index = 0, count = this._systems.length; index < count; index++) {
            if (this._systems[index].name === name) {
                return true;
            }
        }

        return false;
    }

    World.prototype.add = function(value) {
        var instance;

        if (isString(value)){
            instance = this._injectedSystems[value];
            if (isUndefined(instance)) {
                throw Error('Instance of "' + value + '" doesn\'t injected in the world "' + this.name + '".');
            }
        } else {
            instance = value;
        }

        if (instance instanceof World) {
            throw Error('TODO');
        } else if (instance instanceof System) {
            this._systems.push(instance);
        } else {
            throw Error('You can\'t add to World "' + instance + '" type of "' + (typeof instance) + '"');
        }
    }

    /**
     * @ngdoc function
     * @name GameEngine.e
     * @function
     * @description Build Entity
     *
     * <pre>
         GameEngine.e('player',
         [
             'ngDOM', { color: 'rgb(255,0,0)' },
             'ng2D', {x : 0, y: 50},
             'ngControl',
             'ngCollision'
         ]));
     * </pre>
     *
     * @type {Function}
     */
    World.prototype.e = World.prototype.entity = function() {
        var name = '';
        var components = [];
        var componentsIndex = 0;

        if (isString(arguments[0])) {
            name = arguments[0];
            componentsIndex = 1;
        }

        var instance = {
            name: name
        };

        if (isArray(arguments[componentsIndex])) {
            components = arguments[componentsIndex];
        }

        for (var index = 0, count = components.length; index < count; index++) {
            if (isString(components[index])) {
                var componentName = components[index];
                var component = this._injectedComponents[componentName];
                var componentConfig = {};

                if (isUndefined(component)) {
                    throw Error('World ' + this.name + ' doesn\'t has component ' + componentName + '. Only ' + this._injectedComponents);
                }

                if (isObject(components[index + 1])) {
                    index++;
                    componentConfig = components[index];
                }

                var componentInstance = copy(component.defaultState);
                for (var key in componentConfig) {
                    componentInstance[key] = componentConfig[key];
                }

                instance[componentName] = componentInstance;
            }
        }

        return instance;
    };

    var System = function() {

    };

    var GameEngine = window.GameEngine || (window.GameEngine = {});

    var toString = Object.prototype.toString;

    function isDefined(value) {
        return typeof value !== 'undefined';
    }

    function isUndefined(value) {
        return typeof value === 'undefined';
    }

    function isObject(value) {
        return value != null && typeof value == 'object';
    }

    function isArray(value) {
        return toString.apply(value) === '[object Array]';
    }

    function isString(value) {
        return typeof value === 'string';
    }

    /**
     * @ngdoc function
     * @name angular.copy
     * @function
     *
     * @description
     * Creates a deep copy of `source`, which should be an object or an array.
     *
     * * If no destination is supplied, a copy of the object or array is created.
     * * If a destination is provided, all of its elements (for array) or properties (for objects)
     *   are deleted and then all elements/properties from the source are copied to it.
     * * If  `source` is not an object or array, `source` is returned.
     *
     * Note: this function is used to augment the Object type in Angular expressions. See
     * {@link ng.$filter} for more information about Angular arrays.
     *
     * @param {*} source The source that will be used to make a copy.
     *                   Can be any type, including primitives, `null`, and `undefined`.
     * @param {(Object|Array)=} destination Destination into which the source is copied. If
     *     provided, must be of the same type as `source`.
     * @returns {*} The copy or updated `destination`, if `destination` was specified.
     */
    function copy(source, destination){
        if (isWindow(source)) throw Error("Can't copy Window");
        if (!destination) {
            destination = source;
            if (source) {
                if (isArray(source)) {
                    destination = copy(source, []);
                } else if (isDate(source)) {
                    destination = new Date(source.getTime());
                } else if (isObject(source)) {
                    destination = copy(source, {});
                }
            }
        } else {
            if (source === destination) throw Error("Can't copy equivalent objects or arrays");
            if (isArray(source)) {
                destination.length = 0;
                for ( var i = 0; i < source.length; i++) {
                    destination.push(copy(source[i]));
                }
            } else {
                forEach(destination, function(value, key){
                    delete destination[key];
                });
                for ( var key in source) {
                    destination[key] = copy(source[key]);
                }
            }
        }
        return destination;
    }


    /**
     * @ngdoc function
     * @name angular.forEach
     * @function
     *
     * @description
     * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
     * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
     * is the value of an object property or an array element and `key` is the object property key or
     * array element index. Specifying a `context` for the function is optional.
     *
     * Note: this function was previously known as `angular.foreach`.
     *
     <pre>
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender:male']);
     </pre>
     *
     * @param {Object|Array} obj Object to iterate over.
     * @param {Function} iterator Iterator function.
     * @param {Object=} context Object to become context (`this`) for the iterator function.
     * @returns {Object|Array} Reference to `obj`.
     */

    /**
     * @private
     * @param {*} obj
     * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments, ...)
     */
    function isArrayLike(obj) {
        if (!obj || (typeof obj.length !== 'number')) return false;

        // We have on object which has length property. Should we treat it as array?
        if (typeof obj.hasOwnProperty != 'function' &&
            typeof obj.constructor != 'function') {
            // This is here for IE8: it is a bogus object treat it as array;
            return true;
        } else  {
            return obj instanceof JQLite ||                      // JQLite
                (jQuery && obj instanceof jQuery) ||          // jQuery
                toString.call(obj) !== '[object Object]' ||   // some browser native object
                typeof obj.callee === 'function';              // arguments (on IE8 looks like regular obj)
        }
    }

    function forEach(obj, iterator, context) {
        var key;
        if (obj) {
            if (isFunction(obj)){
                for (key in obj) {
                    if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context);
            } else if (isArrayLike(obj)) {
                for (key = 0; key < obj.length; key++)
                    iterator.call(context, obj[key], key);
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key);
                    }
                }
            }
        }
        return obj;
    }

    /**
     * Checks if `obj` is a window object.
     *
     * @private
     * @param {*} obj Object to check
     * @returns {boolean} True if `obj` is a window obj.
     */
    function isWindow(obj) {
        return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    }

    /**
     * @ngdoc function
     * @name angular.isDate
     * @function
     *
     * @description
     * Determines if a value is a date.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Date`.
     */
    function isDate(value){
        return toString.apply(value) == '[object Date]';
    }

    /**
     * @ngdoc function
     * @name angular.isFunction
     * @function
     *
     * @description
     * Determines if a reference is a `Function`.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Function`.
     */
    function isFunction(value){return typeof value == 'function';}

    var worlds = {};
    var modules = {};

    GameEngine.m = GameEngine.module = function(name, requires) {
        if (isDefined(modules[name])) {
            throw Error('Module "' + name + '" has already been defined.');
        }
        var moduleInstance = new Module();
        moduleInstance.name = name;
        moduleInstance.requires = requires;

        modules[name] = moduleInstance;

        return moduleInstance;
    };

    /**
     * Build World. Like a Module in AngularJS
     *
     * @type {Function}
     */
    GameEngine.w = GameEngine.world = function(name, requires) {
        if (isDefined(worlds[name])) {
            throw Error('World "' + name + '" has already been defined.');
        }

        var worldInstance = new World();
        worldInstance.name = name;
        worlds[name] = worldInstance;

        if (isArray(requires)) {
            for (var index = 0, count = requires.length; index < count; index++) {
                var moduleName = requires[index];
                var module = modules[moduleName];
                if (module === null) {
                    throw Error('No module: ' + name);
                }

                worldInstance._injectedModules[moduleName] = module;

                for (var componentName in module._components) {
                    var component = module._components[componentName];
                    if (component === null) {
                        throw Error('Module: "' + this.name + '" has null component with name "' + componentName + '".');
                    }

                    worldInstance._injectedComponents[component.name] = component;
                }

                for (var systemName in module._systems) {
                    var system = module._systems[systemName];
                    if (system === null) {
                        throw Error('Module: "' + this.name + '" has null system with name "' + systemName + '".');
                    }

                    worldInstance._injectedSystems[system.name] = system;
                }
            }
        }

        return worldInstance;
    };

    GameEngine.removeAllWorlds = function() {
        worlds = {};
    }

    GameEngine.removeAllModules = function() {
        modules = {};
    }
})();