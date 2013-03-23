'use strict';

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
    this.$$families = {};

    this.$entities = new List();
    //this.$$entitiesHead = this.$$entitiesTail = null;
    //this.$$entitiesCount = 0;
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
        instance = this.$$addEntity(instance);
    } else if (instance !== null) {
        instance = this.$$addSystem(instance);
    }

    return instance;
};

World.prototype.$$addEntity = function(instance) {
    this.$entities.add(instance);
    this.$$matchNewEntityToFamilies(instance);
    instance.on('add', this.$$onComponentAdd, this);
    instance.on('remove', this.$$onComponentRemove, this);
    return instance;
};

World.prototype.$$removeEntity = function(instance) {
    this.$entities.remove(instance);
    this.$$matchRemoveEntityToFamilies(instance);
    instance.off('add', this.$$onComponentAdd);
    instance.off('remove', this.$$onComponentRemove);
    return instance;
};

World.prototype.$$onComponentAdd = function(entity, component) {
    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.addIfMatch(entity);
    }
};

World.prototype.$$onComponentRemove = function(entity, component) {
    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.removeIfMatch(entity);
    }
};

World.prototype.$$addSystem = function(instance) {
    var systemInstance = new System();
    copy(instance, systemInstance, false);
    this.$$systems.push(systemInstance);
    if (isDefined(systemInstance.require)) {
        systemInstance.$nodes = this.byComponents(systemInstance.require);
    }

    if (isDefined(systemInstance.$init)) {
        systemInstance.$init();
    }

    return systemInstance;
}

World.prototype.remove = function(instance) {
    if (instance instanceof Entity) {
        this.$$removeEntity(instance);
    } else {
        throw new Error('can\'t remove "' + instance + '" from world "' + this.name + '"' );
    }
};

World.prototype.numEntities = function() {
    return this.$entities.length();
};

//World.prototype.getEntityByIndex = function(index) {
//    return this.$$entities[index];
//};

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
    instance.$$world = this;

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

World.prototype.c = World.prototype.component = function(name, config) {
    var defaultConfig;
    var instance;

    if (!isString(name)) {
        throw new Error('1st argument must be [String]');
    }

    defaultConfig = this.$$injectedComponents[name];
    instance = copy(defaultConfig.defaultState);
    mixin(instance, config);

    return instance;
};

World.prototype.$$matchNewEntityToFamilies = function (instance) {
    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.newEntity(instance);
    }
};

World.prototype.$$matchRemoveEntityToFamilies = function (instance) {
    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.removeIfMatch(instance);
    }
};

World.prototype.byComponents = function(request) {
    var componentsArray;
    var componentsString;
    if (isArray(request)) {
        componentsString = request.join(',');
        componentsArray = request;
    } else if (isString(request)) {
        componentsString = request;
        componentsArray = request.split(',');
    }
    if (this.$$families[componentsString]) {
        return this.$$families[componentsString].nodes;
    }

    var family = new Family();
    family.components = componentsArray;
    family.componentsString = componentsString;
    this.$$families[componentsString] = family;
    this.$entities.forEach(function(e) {
        family.newEntity(e);
    });
    return family.nodes;
};