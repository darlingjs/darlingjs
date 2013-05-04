'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

/**
 * @class Module
 * @classdesc
 *
 * Abstract Module. Use for holding some (for one propose) components and systems
 * in one bag and easy plug-n-play to the World.
 *
 * For example here is some system engine modules, like ngPhysics - that holds components
 * that describe physics properties of the entity or like ngPixijsAdapter - that holds
 * system of integration with Pixi.js library.
 *
 * @constructor
 */
var Module = function(){
    this.$$components = {};
    this.$$systems = {};
};

/**
 * Name of the Module
 * @type {string}
 */
Module.prototype.$name = '';

/**
 * Define is module has component or system.
 *
 * @param {string} name of component or system
 * @return {boolean}
 */
Module.prototype.$has = function(name) {
    return isDefined(this.$$components[name]) ||
           isDefined(this.$$systems[name]);
};

/**
 * Describe Component
 * @example
 *<pre>
 module.$c('Goblin', {
    gold: 100,
    health: 50,
    wisdom: 10
 });
 *</pre>
 * @param {string} name The name of the Component
 * @param {Object} [component] The bag of properties of component
 * @return {Module}
 */
Module.prototype.$c = Module.prototype.$component = function(name, component) {
    component = component || {};
    component.$name = component.$name || name;
    this.$$components[name] = component;
    return this;
};

/**
 * Describe System. Like a filter in AngularJS
 *
 * @example
 * <pre>
 module.$s('theSystem', {
    //define array of requiested component
    $require: ['theComponent1', 'theComponent2']

    //(optional) execute on adding system
    $added: function() {

    },

    //(optional) execute on removing system
    $removed: function() {

    },

    //(optional) execute on adding entity to system
    $addEntity: function($entity) {

    },

    //(optional) execute on removing entity from system
    $removeEntity: function($entity) {

    },

    //(optional) beforeUpdate
    //before function define all injections (angularjs style)
    $beforeUpdate: ['$entities', function($entities) {

    }],

    //(optional) handle each entity in the system.
    //before function define all injections (angularjs style)
    $update: ['#entity', '$world', function($entity, $world) {

    }],

    //(optional) afterUpdate
    //before function define all injections (angularjs style)
    $afterUpdate: ['$entities', function($entities) {

    }]
 });
 * </pre>
 *
 * @param {String} name The name of component
 * @param {Object} [config]
 *
 * @see System
 *
 * @return {Module}
 */
Module.prototype.$s = Module.prototype.$system = function(name, config) {
    if (isUndefined(name)) {
        throw new Error('System name must to be defined.');
    }
    config = config || {};
    config.$name = name;

    if (isDefined(this.$$systems[name])) {
        throw new Error('Module "' + this.$name + '" already has system with name "' + name + '".');
    }
    this.$$systems[name] = config;
    return this;
};