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
    instance.on('add', this.$$onComponentAdd, this);
    instance.on('remove', this.$$onComponentRemove, this);
    this.$$matchNewEntityToFamilies(instance);
    return instance;
};

World.prototype.$$removeEntity = function(instance) {
    this.$entities.remove(instance);
    this.$$matchRemoveEntityToFamilies(instance);
    instance.off('add', this.$$onComponentAdd);
    instance.off('remove', this.$$onComponentRemove);
    return instance;
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
    var componentsIndex = 0;

    if (isString(arguments[0])) {
        name = arguments[0];
        componentsIndex = 1;
    }

    var entity = new Entity();
    entity.name =  name;
    entity.$$world = this;

    if (isArray(arguments[componentsIndex])) {
        var componentsArray = arguments[componentsIndex];
        for (var index = 0, count = componentsArray.length; index < count; index++) {
            if (isString(componentsArray[index])) {
                var componentName = componentsArray[index];
                var component = this.$$injectedComponents[componentName];
                var componentConfig = {};

                if (isUndefined(component)) {
                    throw new Error('World ' + this.name + ' doesn\'t has component ' + componentName + '. Only ' + this.$$injectedComponents);
                }

                if (isObject(componentsArray[index + 1])) {
                    index++;
                    componentConfig = componentsArray[index];
                } else {
                    componentConfig = null;
                }

                entity.$add(componentName, componentConfig);
            }
        }
    } else if (isObject(arguments[componentsIndex])) {
        var components = arguments[componentsIndex];
        for (var key in components) {
            if (components.hasOwnProperty(key)) {
                entity.$add(key, components[key]);
            }
        }
    }

    return entity;
};

World.prototype.$c = World.prototype.$component = function(name, config) {
    var defaultConfig;
    var instance;

    if (!isString(name)) {
        throw new Error('1st argument must be [String]');
    }

    defaultConfig = this.$$injectedComponents[name];
    if (isUndefined(defaultConfig)) {
        throw new Error('Can\'t find component "' + name + '" definition. You need to add appropriate module to world.');
    }

    instance = copy(defaultConfig.defaultState);
    if (isDefined(config)) {
        swallowCopy(instance, config);
    }

    instance.$name = name;

    return instance;
};

/**
 * Prepare handle function by annotation [], or strait function.
 * Return function with injected dependency.
 *
 * @param context
 * @param annotation
 * @param customMatcher - custom annotation matcher. get array of arguments, return function(argsTarget, argsSource) {} to match arguments
 * @return {*}
 */
World.prototype.annotatedFunctionFactory = function(context, annotation, customMatcher) {
    if (isUndefined(annotation)) {
        return noop;
    } else if (isArray(annotation)) {
        customMatcher = customMatcher || noop;
        var fn = annotation[annotation.length - 1];
        var fnAnnotate = annotate(annotation);
        var args = this.$$getDependencyByAnnotation(fnAnnotate);
        var argumentsMatcher = customMatcher(fnAnnotate);
        if (isDefined(argumentsMatcher)) {
            return factoryOfFastFunctionWithMatcher(fn, context, args, argumentsMatcher);
        } else {
            return factoryOfFastFunction(fn, context, args);
        }
    } else {
        return annotation;
    }
};

function matchFactory(annotation, name) {
    var index = annotation.indexOf(name);
    if (index >= 0) {
        return function(args, value) {
            args[index] = value;
        };
    } else {
        return noop;
    }
};

function beforeAfterUpdateCustomMatcher(annotation) {
    var match$time = matchFactory(annotation, '$time');
    var match$nodes = matchFactory(annotation, '$nodes');

    return function(argsTarget, argsSource) {
        match$time(argsTarget, argsSource[0]);
        match$nodes(argsTarget, argsSource[1]);
    };
}

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

    systemInstance.$$beforeUpdateHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$beforeUpdate, beforeAfterUpdateCustomMatcher);
    systemInstance.$$afterUpdateHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$afterUpdate, beforeAfterUpdateCustomMatcher);

    if (isDefined(systemInstance.$update)) {
        if (isArray(systemInstance.$update)) {
            var updateArray = systemInstance.$update;
            var updateHandler = updateArray[updateArray.length - 1];
            var updateAnnotate = annotate(updateArray);

            var args = this.$$getDependencyByAnnotation(updateAnnotate);

            var match$node = matchFactory(updateAnnotate, '$node');
            var match$nodes = matchFactory(updateAnnotate, '$nodes');
            var match$time = matchFactory(updateAnnotate, '$time');
            var match$world = matchFactory(updateAnnotate, '$world');

            var worldInstance = this;

            var updateFunction = factoryOfFastFunction(updateHandler, systemInstance, args);

            var updateForEveryNode = updateAnnotate.indexOf('$node') >= 0;
            if (updateForEveryNode) {
                systemInstance.$$updateHandler = systemInstance.$$updateEveryNode(function(node, time) {
                    match$time(args, time);
                    match$node(args, node);
                    match$nodes(args, systemInstance.$nodes);
                    match$world(args, worldInstance);

                    updateFunction();
                });
            } else {
                systemInstance.$$updateHandler = function(time) {
                    match$time(args, time);
                    match$nodes(args, systemInstance.$nodes);
                    match$world(args, worldInstance);

                    updateFunction();
                };
            }
        } else {
            systemInstance.$$updateHandler = systemInstance.$update;
        }
    }

    if (isDefined(systemInstance.$added)) {
        systemInstance.$$addedHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$added, noop);
    } else {
        systemInstance.$$addedHandler = noop;
    }

    if (isDefined(systemInstance.$removed)) {
        systemInstance.$$removedHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$removed, noop);
    } else {
        systemInstance.$$removedHandler = noop;
    }

    if (isDefined(systemInstance.$addNode)) {
        //TODO : inject all dependency
        systemInstance.$$addNodeHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$addNode, addRemoveNodeCustomMatcher);
    } else {
        systemInstance.$$addNodeHandler = noop;
    }

    if (isDefined(systemInstance.$removeNode)) {
        //TODO : inject all dependency
        systemInstance.$$removeNodeHandler = this.annotatedFunctionFactory(systemInstance, systemInstance.$removeNode, addRemoveNodeCustomMatcher);
    } else {
        systemInstance.$$removeNodeHandler = noop;
    }

    return systemInstance;
};

function addRemoveNodeCustomMatcher(annotation) {
    for (var i = 0, l = annotation.length; i < l; i++) {
        if (annotation[i] === '$node') {
            return function(argsTarget, argsSource) {
                argsTarget[i] = argsSource[0];
            };
        }
    }

    return noop;
}

/**
 * Architecture Design:
 *
 * Goal:
 * Should apply only one match function simultaneously.
 *
 * Solution:
 * BeforeMatch we are verify that we are not in match phase. Is so, just store operation.
 * in AfterMatch we are execute each stored operations
 *
 * @param entity
 */
World.prototype.$$matchNewEntityToFamilies = function (entity) {
    if (!beforeMatch(entity, 'matchNewEntityToFamilies', this, this.$$matchNewEntityToFamilies, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.newEntity(entity);
    }

    afterMatch(entity, 'matchNewEntityToFamilies');
};

World.prototype.$$matchRemoveEntityToFamilies = function (entity) {
    if (!beforeMatch(entity, 'matchRemoveEntityToFamilies', this, this.$$matchRemoveEntityToFamilies, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.removeIfMatch(entity);
    }

    afterMatch(entity, 'matchRemoveEntityToFamilies');
};

World.prototype.$$onComponentAdd = function(entity, component) {
    if (!beforeMatch(entity, 'onComponentAdd', this, this.$$onComponentAdd, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.addIfMatch(entity);
    }

    afterMatch(entity, 'onComponentAdd');
};

World.prototype.$$onComponentRemove = function(entity, component) {
    if (!beforeMatch(entity, 'onComponentRemove', this, this.$$onComponentRemove, arguments)) {
        return;
    }

    for (var componentsString in this.$$families) {
        var family = this.$$families[componentsString];
        family.removeIfMatch(entity, component);
    }

    afterMatch(entity, 'onComponentRemove');
};

function beforeMatch(entity, phase, context, phaseFunction, args) {
    if (isUndefined(entity._matchingToFamily)) {
        entity._matchingToFamily = {
            processing: false,
            phases: {}
        };
    }

    var phaseHandler = entity._matchingToFamily.phases[phase];
    if (isUndefined(phaseHandler)) {
        phaseHandler = [];
        entity._matchingToFamily.phases[phase] = phaseHandler;
    }

    if(entity._matchingToFamily.processing) {
        phaseHandler.push({
            fn: phaseFunction,
            ctx: context,
            args: args
        });
        return false;
    }

    entity._matchingToFamily.processing = true;
    return true;
}

function afterMatch(entity, phase) {
    entity._matchingToFamily.processing = false;
    var phases = entity._matchingToFamily.phases;
    for (var key in phases) {
        if (phases.hasOwnProperty(key)) {
            var phaseHandlerArray = entity._matchingToFamily.phases[key];
            if (phaseHandlerArray.length > 0) {
                var phaseHandler = phaseHandlerArray.pop();
                phaseHandler.fn.apply(phaseHandler.ctx, phaseHandler.args);
                return;
            }
        }
    }
}

World.prototype.$queryByComponents = function(request) {
    var componentsArray;
    var componentsString;
    var componentsHash = {};
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

    for(var i = 0, l = componentsArray.length; i < l; i++) {
        componentsHash[componentsArray[i]] = true;
    }

    var family = new Family();
    family.components = componentsArray;
    family.componentsHash = componentsHash;
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
        var system = this.$$systems[index];
        system.$$beforeUpdateHandler(time, system.$nodes);
        system.$$updateHandler(time);
        system.$$afterUpdateHandler(time, system.$nodes);
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