'use strict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * DESIGN NOTES
 * ============
 *
 * Because entity can frequently will be added and removed,
 * them implemented by list.
 *
 */

/**
 * @class World
 * @classdesc
 *
 * Game World. Contain Modules, System and Entities.
 *
 * @constructor
 */
var World = function(){
    this.$$injectedComponents = {};
    this.$$injectedModules = {};
    this.$$injectedSystems = {};

    this.$$systems = [];
    this.$$beforeUpdateHandledSystems = [];
    this.$$afterUpdateHandledSystem = [];
    this.$$updateHandledSystem = [];

    this.$$families = {};
    this.$$interval = 1.0;
    this.$$updating = false;
    this.$playing = false;

    this.$entities = new List('World');
    this.$name = '';
    //this.$$entitiesHead = this.$$entitiesTail = null;
    //this.$$entitiesCount = 0;
};

/**
 * Is contain definition of Component, Module or System
 * @param {string} name The name of Component, Module or System
 * @return {boolean}
 */
World.prototype.$has = function(name) {
    return isDefined(this.$$injectedComponents[name]) ||
           isDefined(this.$$injectedModules[name]) ||
           isDefined(this.$$injectedSystems[name]);
};

/**
 * Is System used (added) in the World
 * @param {string|System} value The name or instance of System
 * @return {boolean}
 */
World.prototype.$isUse = function(value) {
    if (value instanceof System) {
        return this.$$systems.indexOf(value) >= 0;
    } else {
        return this.$$getSystemByName(value) !== null;
    }

    return false;
};

/**
 * Add Entity or System to the World
 * @param {Entity|System|String} value The Entity or the System
 * @param {Object} [config] The config of the added instance
 * @return {Entity|System}
 */
World.prototype.$add = function(value, config) {
    var instance;

    if (value instanceof Entity) {
        instance = this.$$addEntity(value);
    } else if (value instanceof System) {
        this.$$addSystem(value);
    } else {
        instance = this.$system(value, config);
    }

    return instance;
};

/**
 * Add Entity to the World
 * @private
 * @param {Entity} instance The instance of Entity
 * @return {Entity}
 */
World.prototype.$$addEntity = function(instance) {
    this.$entities.add(instance);
    instance.$$world = this;
    instance.on('add', this.$$onComponentAdd, this);
    instance.on('remove', this.$$onComponentRemove, this);
    this.$$matchNewEntityToFamilies(instance);
    return instance;
};

/**
 * Remove Entity from the World
 * @private
 * @param {Entity} instance
 * @return {Entity}
 */
World.prototype.$$removeEntity = function(instance) {
    instance.$$world = null;
    this.$entities.remove(instance);
    this.$$matchRemoveEntityToFamilies(instance);
    instance.off('add', this.$$onComponentAdd);
    instance.off('remove', this.$$onComponentRemove);
    return instance;
};

/**
 * Get array of instance by it names
 * @ignore
 * @private
 * @param {array} annotation The annotation array with names.
 * @param {array} target
 * @return {array}
 */
World.prototype.$$getDependencyByAnnotation = function(annotation, target) {
    target = target || [];
    for (var i = 0, l = annotation.length; i < l; i++) {
        var name = annotation[i];
        target[i] = this.$$getDependencyByName(name);
    }
    return target;
};

/**
 * Get dependency by names. For example $world - return current game world.
 * Implementation of service locator
 * @ignore
 * @private
 * @param {string} name
 * @return {World|System|*}
 */
World.prototype.$$getDependencyByName = function(name) {
    //TODO: Get from AngularJS
    switch(name) {
        case '$world':
            return this;
    }
    return this.$$getSystemByName(name);
};

/**
 * Get add System by name
 * @private
 * @param {string} name
 * @return {System}
 */
World.prototype.$$getSystemByName = function(name) {
    for (var i = 0, l = this.$$systems.length; i < l; i++) {
        if (this.$$systems[i].$name === name) {
            return this.$$systems[i];
        }
    }

    return null;
};

/**
 * Remove Entity or System for the World
 * @param {Entity|System} instance
 */
World.prototype.$remove = function(instance) {
    if (instance instanceof Entity) {
        this.$$removeEntity(instance);
    } else if(instance instanceof System) {
        this.$$removeSystem(instance);
    } else {
        throw new Error('can\'t remove "' + instance + '" from world "' + this.$name + '"' );
    }
};

/**
 * Add system by instance
 * @private
 * @param {System} instance
 * @return {System}
 */
World.prototype.$$addSystem = function(instance) {
    this.$$systems.push(instance);

    instance.$$addedHandler();

    if (isDefined(instance.$require)) {
        instance.$$setNodes(this.$queryByComponents(instance.$require));
    }

    return instance;
};

/**
 * Remove System by instance
 * @private
 * @param {System} instance
 * @return {System}
 */
World.prototype.$$removeSystem = function(instance) {
    var index = this.$$systems.indexOf(instance);
    this.$$systems.splice(index);

    instance.$$init();

    instance.$$removedHandler();

    return instance;
};

/**
 * Get entity by name
 * @param {string} value
 * @return {Entity}
 */
World.prototype.$getByName = function(value) {
    var node = this.$entities.$head;
    while(node) {
        var entity = node.instance;
        if (entity.$name === value) {
            return entity;
        }
        node = node.$next;
    }

    return null;
};

/**
 * Get number of entities
 * @return {number}
 */
World.prototype.$numEntities = function() {
    return this.$entities.length();
};


/**
 * @description Build and add Entity
 * @see Entity
 *
 * @example
 * <pre>
 //config as array
 GameEngine.e('player', [
   'ngDOM', { color: 'rgb(255,0,0)' },
   'ng2D', { x: 0, y: 50 },
   'ngControl',
   'ngCollision'
 ]));

 //or config as object
 GameEngine.e('player', {
   ngDOM: { color: 'rgb(255,0,0)' },
   ng2D: {x : 0, y: 50},
   ngControl: {},
   ngCollision: {}
 }));

 * </pre>
 *
 * @type {Function}
 *
 * @param {string} name (optional) entity name
 * @param {object} config (optional) config object of entity
 * @param {boolean} doesntAddToWorld (optional) doen't add entity to World
 * @return {Entity}
 */
World.prototype.$e = World.prototype.$entity = function() {
    var name = '';
    var componentsIndex = 0;

    if (isString(arguments[0])) {
        name = arguments[0];
        componentsIndex = 1;
    }

    var entity = new Entity();
    entity.$name = name;
    entity.$$world = this;

    if (isArray(arguments[componentsIndex])) {
        var componentsArray = arguments[componentsIndex];
        componentsIndex++;
        for (var index = 0, count = componentsArray.length; index < count; index++) {
            if (isString(componentsArray[index])) {
                var componentName = componentsArray[index];
                var component = this.$$injectedComponents[componentName];
                var componentConfig;

                if (isUndefined(component)) {
                    throw new Error('World ' + this.$name + ' doesn\'t has component ' + componentName + '. Only ' + this.$$injectedComponents);
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
        componentsIndex++;
        for (var key in components) {
            if (components.hasOwnProperty(key) && key.charAt(0) !== '$') {
                var value = components[key];
                if (value === false) {
                    entity[key] = null;
                } else if (isEmptyObject(value) || value === null) {
                    entity.$add(key, null);
                } else {
                    entity.$add(key, value);
                }
            }
        }

        if (isDefined(components.$name)) {
            entity.$name = components.$name;
        }
    }

    if(!arguments[componentsIndex]) {
        this.$$addEntity(entity);
    }

    return entity;
};

/**
 * Check to see if an object is empty (contains no enumerable properties).
 * get from jquery
 *
 * @ignore
 * @param obj
 * @return {boolean}
 */
function isEmptyObject( obj ) {
    var name;
    for ( name in obj ) {
        return false;
    }
    return true;
}

/**
 * Define component.
 * if component already defined under @name function return component with config customization.
 * if component doesn't define function defines it the world under @name with @config state.
 * But if config doesn't defined it's rise exception
 *
 * @param {string} name name of component
 * @param {object} [config] state of component
 * @return {Component}
 */
World.prototype.$c = World.prototype.$component = function(name, config) {
    var defaultConfig;
    var instance;

    if (!isString(name)) {
        throw new Error('1st argument must be [String]');
    }

    defaultConfig = this.$$injectedComponents[name];
    if (isUndefined(defaultConfig)) {
        //define new custom component
        if (isDefined(config) && config !== null) {
            this.$$injectedComponents[name] = config;
        } else {
            throw new Error('Can\'t find component "' + name + '" definition. You need to add appropriate module to world.');
        }
        instance = config;
    } else {
        instance = copy(defaultConfig);
        if (isDefined(config) && config !== null) {
            swallowCopy(instance, config);
        }
    }

    instance.$name = name;

    return instance;
};

/**
 * Prepare handle function by annotation [], or strait function.
 * Return function with injected dependency.
 *
 * @ignore
 * @param context
 * @param annotationPropertyName
 * @param customMatcher - custom annotation matcher. get array of arguments, return function(argsTarget, argsSource) {} to match arguments
 * @return {*}
 */
World.prototype.$$annotatedFunctionFactory = function (context, annotationPropertyName, customMatcher) {
    var annotation = context[annotationPropertyName];
    if (isUndefined(annotation)) {
        return null;
    } else if (isArray(annotation)) {
        customMatcher = customMatcher || noop;
        var fn = annotation[annotation.length - 1];
        context[annotationPropertyName] = fn;
        var fnAnnotate = annotate(annotation);
        var args = this.$$getDependencyByAnnotation(fnAnnotate);
        var argumentsMatcher = customMatcher(fnAnnotate);
        if (isDefined(argumentsMatcher)) {
            return factoryOfFastFunctionWithMatcher(fn, context, args, argumentsMatcher, annotationPropertyName);
        } else {
            return factoryOfFastFunction(fn, context, args, annotationPropertyName);
        }
    } else {
        return annotation;
    }
};

/**
 * @ignore
 * @param annotation
 * @param name
 * @return {*}
 */
function matchFactory(annotation, name) {
    var index = annotation.indexOf(name);
    if (index >= 0) {
        return function(args, value) {
            args[index] = value;
        };
    } else {
        return noop;
    }
}

/**
 * @ignore
 * @param annotation
 * @return {Function}
 */
function beforeAfterUpdateCustomMatcher(annotation) {
    var match$time = matchFactory(annotation, '$time');
    var match$entities = matchFactory(annotation, '$entities');

    return function(argsTarget, argsSource) {
        match$time(argsTarget, argsSource[0]);
        match$entities(argsTarget, argsSource[1]);
    };
}

/**
 * Build instance of System. Instantiate injected system or define custom system.
 * @see System
 * @example
 <pre>
     world.$s('healerSystem', {

        //apply to components:
        $require: ['ngLife', 'healer'],

        //iterate each frame for each entity
        $update: ['$node', function($node) {
            if ($node.ngLife.life <= this.healer.maxLife) {
                //heals entity
                $node.ngLife.life += this.healer.power;
            } else {
                //stop healing when life reach of maxLife
                $node.$remove('healer');
            }
        }]
    });
 </pre>
 *
 * @param {string} name
 * @param {object} [config]
 * @return {System}
 */
World.prototype.$s = World.prototype.$system = function(name, config) {
    var defaultConfig = this.$$injectedSystems[name];

    if (isUndefined(defaultConfig) && isUndefined(config)) {
        throw new Error('Instance of system "' + name + '" doesn\'t injected in the world "' + this.$name + '".');
    }

    var systemInstance = new System();

    if (isDefined(defaultConfig)) {
        copy(defaultConfig, systemInstance, false);
    } else {
        systemInstance.$name = systemInstance.$name || name;
    }

    if (isDefined(config)) {
        copy(config, systemInstance, false);
    }

    systemInstance.$$beforeUpdateHandler = this.$$annotatedFunctionFactory(systemInstance, '$beforeUpdate', beforeAfterUpdateCustomMatcher);
    if (systemInstance.$$beforeUpdateHandler) {
        this.$$beforeUpdateHandledSystems.push(systemInstance);
    }
    systemInstance.$$afterUpdateHandler = this.$$annotatedFunctionFactory(systemInstance, '$afterUpdate', beforeAfterUpdateCustomMatcher);
    if (systemInstance.$$afterUpdateHandler) {
        this.$$afterUpdateHandledSystem.push(systemInstance);
    }

    if (isDefined(systemInstance.$update)) {
        if (isArray(systemInstance.$update)) {
            var updateArray = systemInstance.$update;
            var updateHandler = updateArray[updateArray.length - 1];
            var updateAnnotate = annotate(updateArray);

            systemInstance.$$update = updateHandler;

            var args = this.$$getDependencyByAnnotation(updateAnnotate);

            var match$entity = matchFactory(updateAnnotate, '$entity');
            var match$entities = matchFactory(updateAnnotate, '$entities');
            var match$time = matchFactory(updateAnnotate, '$time');
            var match$world = matchFactory(updateAnnotate, '$world');

            var worldInstance = this;

            var updateFunction = factoryOfFastFunction(updateHandler, systemInstance, args, '$$update');

            var updateForEveryNode = updateAnnotate.indexOf('$entity') >= 0;
            if (updateForEveryNode) {
                systemInstance.$$updateHandler = systemInstance.$$updateEveryNode(function(entity, time) {
                    match$time(args, time);
                    match$entity(args, entity);
                    match$entities(args, systemInstance.$nodes);
                    match$world(args, worldInstance);

                    updateFunction();
                });
            } else {
                systemInstance.$$updateHandler = function(time) {
                    match$time(args, time);
                    match$entities(args, systemInstance.$nodes);
                    match$world(args, worldInstance);

                    updateFunction();
                };
            }
        } else {
            systemInstance.$$updateHandler = systemInstance.$update;
        }

        this.$$updateHandledSystem.push(systemInstance);
    }

    if (isDefined(systemInstance.$added)) {
        systemInstance.$$addedHandler = this.$$annotatedFunctionFactory(systemInstance, '$added', noop);
    } else {
        systemInstance.$$addedHandler = noop;
    }

    if (isDefined(systemInstance.$removed)) {
        systemInstance.$$removedHandler = this.$$annotatedFunctionFactory(systemInstance, '$removed', noop);
    } else {
        systemInstance.$$removedHandler = noop;
    }

    if (isDefined(systemInstance.$addEntity)) {
        //TODO : inject all dependency
        systemInstance.$$addEntityHandler = this.$$annotatedFunctionFactory(systemInstance, '$addEntity', addRemoveNodeCustomMatcher);
    } else {
        systemInstance.$$addEntityHandler = noop;
    }

    if (isDefined(systemInstance.$removeEntity)) {
        //TODO : inject all dependency
        systemInstance.$$removeEntityHandler = this.$$annotatedFunctionFactory(systemInstance, '$removeEntity', addRemoveNodeCustomMatcher);
    } else {
        systemInstance.$$removeEntityHandler = noop;
    }

    this.$$addSystem(systemInstance);

    return systemInstance;
};

/**
 * @ignore
 * @param annotation
 * @return {*}
 */
function addRemoveNodeCustomMatcher(annotation) {
    for (var i = 0, l = annotation.length; i < l; i++) {
        if (annotation[i] === '$entity') {
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
 * @ignore
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

/**
 * @ignore
 * @param entity
 */
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

/**
 * @ignore
 * @param entity
 * @param component
 */
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

/**
 * @ignore
 * @param entity
 * @param component
 */
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

/**
 * @ignore
 * @param entity
 * @param phase
 * @param context
 * @param phaseFunction
 * @param args
 * @return {boolean}
 */
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

/**
 * @ignore
 * @param entity
 * @param phase
 */
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

/**
 * Query nodes by them components.
 * @param {array|string} request The request filter
 * @return {*}
 * @see Entity
 */
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
    } else {
        throw new Error('Can\'t query entities by ' + request);
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

/**
 * Update the World by interval
 * @param {number} time The time interval
 */
World.prototype.$update = function(time) {
    this.$$updating = true;
    time = time || this.$$interval;

    var index, count, system;
    for(index = 0, count = this.$$beforeUpdateHandledSystems.length; index < count; index++ ) {
        system = this.$$beforeUpdateHandledSystems[index];
        system.$$beforeUpdateHandler(time, system.$nodes);
    }

    for (index = 0, count = this.$$updateHandledSystem.length; index < count; index++) {
        system = this.$$updateHandledSystem[index];
        system.$$updateHandler(time);
    }

    for(index = 0, count = this.$$afterUpdateHandledSystem.length; index < count; index++ ) {
        system = this.$$afterUpdateHandledSystem[index];
        system.$$afterUpdateHandler(time, system.$nodes);
    }

    this.$$updating = false;
};

/**
 * Start update the World every 1/60 of second
 */
World.prototype.$start = function() {
    if (this.$playing) {
        return;
    }

    this.$playing = true;

    var self = this;
    var previousTime = 0;
    (function step(time) {
        var deltaTime = 0;
        if (previousTime) {
            deltaTime = time - previousTime;
        }

        self.$update(deltaTime);
        previousTime = time;
        if (self.$playing) {
            self.$requestAnimationFrameId = window.requestAnimationFrame(step);
        }
    })(0);
};

/**
 * Stop update the World every 1/60 of second
 */
World.prototype.$stop = function() {
    if (!this.$playing) {
        return;
    }
    this.$playing = false;

    window.cancelAnimationFrame(this.$requestAnimationFrameId);
};