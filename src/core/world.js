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
    this.$$interval = 1;
    this.$$updating = false;
    this.$playing = false;

    this.$entities = new List();
    this.$name = '';
    //this.$$entitiesHead = this.$$entitiesTail = null;
    //this.$$entitiesCount = 0;
};

World.prototype.$has = function(name) {
    return isDefined(this.$$injectedComponents[name]) ||
           isDefined(this.$$injectedModules[name]) ||
           isDefined(this.$$injectedSystems[name]);
};

World.prototype.$isUse = function(value) {
    if (value instanceof System) {
        return this.$$systems.indexOf(value) >= 0;
    } else {
        for (var index = 0, count = this.$$systems.length; index < count; index++) {
            if (this.$$systems[index].name === value) {
                return true;
            }
        }
    }

    return false;
};

World.prototype.$add = function(value, config) {
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
    } else if (instance instanceof System) {
        this.$$addSystem(instance);
    } else if (instance !== null) {
        instance = this.$system(value, config);
        this.$$addSystem(instance);
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

World.prototype.$$getDependencyByAnnotation = function(annotation, target) {
    target = target || [];
    for (var i = 0, l = annotation.length; i < l; i++) {
        var name = annotation[i];
        target[i] = this.$$getDependencyByName(name);
    }
    return target;
};

World.prototype.$$getDependencyByName = function(name) {
    //TODO: Get from AngularJS
    return this.$$getSystemByName(name);
};

World.prototype.$remove = function(instance) {
    if (instance instanceof Entity) {
        this.$$removeEntity(instance);
    } else if(instance instanceof System) {
        this.$$removeSystem(instance);
    } else {
        throw new Error('can\'t remove "' + instance + '" from world "' + this.name + '"' );
    }
};

World.prototype.$$getSystemByName = function(name) {
    for (var i = 0, l = this.$$systems.length; i < l; i++) {
        if (this.$$systems[i].name === name) {
            return this.$$systems[i];
        }
    }

    return null;
};

World.prototype.$$addSystem = function(instance) {
    this.$$systems.push(instance);

    instance.$$addedHandler();

    if (isDefined(instance.$require)) {
        instance.$setNodes(this.$queryByComponents(instance.$require));
    }

    return instance;
};

World.prototype.$$removeSystem = function(instance) {
    var index = this.$$systems.indexOf(instance);
    this.$$systems.splice(index);

    instance.init();

    instance.$$removedHandler();

    return instance;
};

World.prototype.$numEntities = function() {
    return this.$entities.length();
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
World.prototype.$e = World.prototype.$entity = function() {
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
            } else {
                componentConfig = null;
            }
            /*
             var componentInstance = copy(component.defaultState);
             for (var key in componentConfig) {
             if (componentConfig.hasOwnProperty(key)) {
             componentInstance[key] = componentConfig[key];
             }
             }
             */

            instance.$add(componentName, componentConfig);
        }
    }

    return instance;
};

World.prototype.$c = World.prototype.$component = function(name, config) {
    var defaultConfig;
    var instance;

    if (!isString(name)) {
        throw new Error('1st argument must be [String]');
    }

    defaultConfig = this.$$injectedComponents[name];
    instance = copy(defaultConfig.defaultState);
    if (isDefined(config)) {
        mixin(instance, config);
    }

    return instance;
};

World.prototype.annotatedFunctionFactory = function(context, annotation) {
    if (isArray(annotation)) {
        var fn = annotation[annotation.length - 1];
        var fnAnnotate = annotate(annotation);
        var args = this.$$getDependencyByAnnotation(fnAnnotate);
        return factoryOfFastFunction(fn, context, args);
    } else {
        return annotation;
    }
};

World.prototype.applyNode = function(updateAnnotate, name) {
    var index = updateAnnotate.indexOf(name);
    if (index >= 0) {
        return function(args, value) {
            args[index] = value;
        };
    } else {
        return noop;
    }
};

/**
 * Build instance of System
 *
 * @type {Function}
 */
World.prototype.$s = World.prototype.$system = function(name, config) {
    var defaultConfig = this.$$injectedSystems[name];
    var systemInstance = new System();
    copy(defaultConfig, systemInstance, false);

    if (isDefined(config)) {
        copy(config, systemInstance, false);
    }

    if (isDefined(systemInstance.$update)) {
        if (isArray(systemInstance.$update)) {
            var updateArray = systemInstance.$update;
            var updateHandler = updateArray[updateArray.length - 1];
            var updateAnnotate = annotate(updateArray);

            var args = this.$$getDependencyByAnnotation(updateAnnotate);

            var apply$node = this.applyNode(updateAnnotate, '$node');
            var apply$nodes = this.applyNode(updateAnnotate, '$nodes');
            var apply$time = this.applyNode(updateAnnotate, '$time');
            var apply$world = this.applyNode(updateAnnotate, '$world');

            var worldInstance = this;

            var updateFunction = factoryOfFastFunction(updateHandler, systemInstance, args);

            var updateForEveryNode = updateAnnotate.indexOf('$node') >= 0;
            if (updateForEveryNode) {
                systemInstance.$$updateHandler = systemInstance.$$updateEveryNode(function(node, time) {
                    apply$time(args, time);
                    apply$node(args, node);
                    apply$nodes(args, systemInstance.$nodes);
                    apply$world(args, worldInstance);

                    updateFunction();
                });
            } else {
                systemInstance.$$updateHandler = function(time) {
                    apply$time(args, time);
                    apply$nodes(args, systemInstance.$nodes);
                    apply$world(args, worldInstance);

                    updateFunction();
                };
            }
        } else {
            systemInstance.$$updateHandler = systemInstance.$update;
        }
    }

    if (isDefined(systemInstance.$added)) {
        systemInstance.$$addedHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$added);
    } else {
        systemInstance.$$addedHandler = noop;
    }

    if (isDefined(systemInstance.$removed)) {
        systemInstance.$$removedHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$removed);
    } else {
        systemInstance.$$removedHandler = noop;
    }

    if (isDefined(systemInstance.$addNode)) {
        //TODO : inject all dependency
        systemInstance.$$addNodeHandler = systemInstance.$addNode;
    } else {
        systemInstance.$$addNodeHandler = noop;
    }

    if (isDefined(systemInstance.$removeNode)) {
        //TODO : inject all dependency
        systemInstance.$$removeNodeHandler = systemInstance.$removeNode;
    } else {
        systemInstance.$$removeNodeHandler = noop;
    }

    return systemInstance;
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

World.prototype.$queryByComponents = function(request) {
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

World.prototype.$update = function(time) {
    this.$$updating = true;
    time = time || this.$$interval;
    for (var index = 0, count = this.$$systems.length; index < count; index++) {
        this.$$systems[index].$$updateHandler(time);
    }
    this.$$updating = false;
};

World.prototype.$start = function() {
    if (this.$playing) {
        return;
    }

    this.$playing = true;

    var self = this;
    var previousTime = 0;
    (function step(time) {
        self.$update(time - previousTime);
        previousTime = time;
        if (self.$playing) {
            self.$requestAnimationFrameId = window.requestAnimationFrame(step);
        }
    })(0);
};

World.prototype.$stop = function() {
    if (!this.$playing) {
        return;
    }
    this.$playing = false;

    window.cancelAnimationFrame(this.$requestAnimationFrameId);
};