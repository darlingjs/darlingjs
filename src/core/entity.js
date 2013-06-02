/**
 * Project: GameEngine.
 * @copyright (c) 2013, Eugene-Krevenets
 */

/**
 * @class Entity
 * @classdesc
 *
 * Entity is bag of game property in one instance.
 * For example instance of bonus with component position in (ng2D).
 *
 * @constructor
 */
var Entity = function() {

};

mixin(Entity.prototype, Events);

/**
 * Name of entity
 * @type {string}
 */
Entity.prototype.$name = '';

/**
 * World of entity
 * @private
 * @type {World}
 */
Entity.prototype.$$world = null;

/**
 * Add new Component to entity
 *
 * @example
 * <pre>
 entity.$add('ng2D', {
   x: 1.0,
   y: 3.0
 });
 * </pre>
 * @param {string|Component} value The name of the Component or
 * @param {object} [config] The config of adding Component
 * @return {Component}
 */
Entity.prototype.$add = function(value, config) {
    var instance;
    var name;

    if (isString(value)) {
        instance = this.$$world.$component(value, config);
        name = value;
    } else if (isComponent(value)) {
        instance = value;
        name = instance.$name;
    } else if (isUndefined(value)) {
        throw new Error('Can\'t add component with null name.');
    } else {
        throw new Error('Can\'t add ' + value + ' to entity');
    }

    if (isUndefined(instance)) {
        throw new Error('Can\'t add null component.');
    }

    if (this[name]) {
        this.$remove(name);
    }

    this[name] = instance;

    this.trigger('add', this, instance);
    return instance;
};

/**
 * Remove component from entity
 *
 * @example
 * <pre>
 entity.$remove('ngVisible');
 * </pre>
 * @param {string|Component} value The name or instance of component
 * @return {Component}
 */
Entity.prototype.$remove = function(value) {
    var instance;
    var name;
    if (isComponent(value)) {
        name = value.$name;
        instance = value;
    } else if (isString(value)) {
        name = value;
        instance = this[value];
    } else {
        throw new Error('Can\'t remove from component ' + value);
    }

    if (!this[name]) {
        return;
    }

    this.trigger('remove', this, instance);

    //nullity optimization
    //delete this[name];
    this[name] = null;

    return instance;
};

/**
 * Is entity has component
 *
 * @param {string|Component} value The name or instance of component test
 * @return {boolean}
 */
Entity.prototype.$has = function(value) {
    if (isString(value)) {
        return !!this[value];
    } else {
        return !!this[value.$name];
    }
};



/**
 * Apply modifier to $entity
 *
 * modifier can be:
 * 1. callback function (execute);
 * 2. name of component (add);
 * 3. object with key - components, value - is config of components (add);
 * 4. array of components (add);
 *
 * @param modifier
 */
Entity.prototype.$applyModifier = function(modifier) {
    if (darlingutil.isFunction(modifier)) {
        modifier.call(this);
    } else {
        //TODO : add components from ngAnyJoint.onEnableReverse
        if (darlingutil.isString(modifier)) {
            this.$add(modifier);
        } else if (darlingutil.isArray(modifier)) {
            for(var i = 0, count = modifier.length; i < count; i++) {
                this.$add(modifier[i]);
            }
        } else if (darlingutil.isObject(modifier)) {
            for(var key in modifier) {
                this.$add(key, modifier[key])
            }
        } else {
            throw new Error('Unknown modifier')
        }
    }
}

/**
 * Revert modifier to $entity
 *
 * modifier can be:
 * 1. callback function (can't be reverted);
 * 2. name of component (remove);
 * 3. object with key - components, value - is config of components (remove);
 * 4. array of components (remove);
 *
 * @param handler
 */
Entity.prototype.$revertModifier = function(modifier) {
    if (!darlingutil.isFunction(modifier)) {
        //TODO : remove components from ngAnyJoint.onEnableReverse
        if (darlingutil.isString(modifier)) {
            this.$remove(modifier);
        } else if (darlingutil.isArray(modifier)) {
            for(var i = 0, count = modifier.length; i < count; i++) {
                this.$remove(modifier[i]);
            }
        } else if (darlingutil.isObject(modifier)) {
            for(var key in modifier) {
                this.$remove(key, modifier[key])
            }
        } else {
            throw new Error('Unknown modifier')
        }
    }
}

function isComponent(value) {
    return isObject(value) && isDefined(value.$name);
}