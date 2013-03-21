'useStrict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * DESIGN NOTES
 * ============
 *
 * Because entity can fraquantly be added and removed,
 * them implemented by list.
 *
 */

var World = function(){

    this.$$injectedComponents = {};
    this.$$injectedModules = {};
    this.$$injectedSystems = {};
    this.$$systems = [];
    this.$$entities = [];
};

World.isInstanceOf = function(instance) {
    return instance.toString() === 'World';
};

World.prototype.name = '';

World.prototype.has = function(name) {
    return isDefined(this.$$injectedComponents[name]) ||
           isDefined(this.$$injectedModules[name]) ||
           isDefined(this.$$injectedSystems[name]);
};

World.prototype.isUse = function(name) {
    for (var index = 0, count = this.$$systems.length; index < count; index++) {
        if (this.$$systems[index].name === name) {
            return true;
        }
    }

    return false;
};

World.prototype.add = function(value) {
    var instance;

    if (isString(value)){
        instance = this.$$injectedSystems[value];
        if (isUndefined(instance)) {
            throw new Error('Instance of "' + value + '" doesn\'t injected in the world "' + this.name + '".');
        }
    } else {
        instance = value;
    }

    if (instance instanceof Entity) {
        this.$$entities.push(instance);
    } else if (instance !== null) {
        var systemInstance = new System();
        copy(instance, systemInstance, false);
        this.$$systems.push(systemInstance);
        instance = systemInstance;
    }

    /*
     if (instance instanceof World) {
     throw new Error('TODO');
     } else if (instance instanceof System) {
     this._systems.push(instance);
     } else {
     throw new Error('You can\'t add to World "' + instance + '" type of "' + (typeof instance) + '"');
     }
     */

    return instance;
};

World.prototype.numEntities = function() {
    return this.$$entities.length;
};

World.prototype.getEntityByIndex = function(index) {
    return this.$$entities[index];
};

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

    var instance = new Entity();
    instance.name =  name;

    if (isArray(arguments[componentsIndex])) {
        components = arguments[componentsIndex];
    }

    for (var index = 0, count = components.length; index < count; index++) {
        if (isString(components[index])) {
            var componentName = components[index];
            var component = this.$$injectedComponents[componentName];
            var componentConfig = {};

            if (isUndefined(component)) {
                throw new Error('World ' + this.name + ' doesn\'t has component ' + componentName + '. Only ' + this.$$injectedComponents);
            }

            if (isObject(components[index + 1])) {
                index++;
                componentConfig = components[index];
            }

            var componentInstance = copy(component.defaultState);
            for (var key in componentConfig) {
                if (componentConfig.hasOwnProperty(key)) {
                    componentInstance[key] = componentConfig[key];
                }
            }

            instance.$add(componentName, componentInstance);
        }
    }

    return instance;
};
