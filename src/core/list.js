'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

/**
 *
 * @inner
 * @constructor
 */
var List = function() {
    this._head = this._tail = null;
    this._length = 0;
    this.PROPERTY_LINK_TO_NODE = '$$listNode_' + Math.random();
    mixin(this, Events);
};

darlingutil.List = List;

/**
 * Add instance to list
 *
 * @param {*} instance
 * @return {ListNode}
 */
List.prototype.add = function(instance) {
    var node = poolOfListNodes.get();
    node.init(instance, this.PROPERTY_LINK_TO_NODE);

    if (this._head) {
        this._tail.$next = node;
        node.$prev = this._tail;
        this._tail = node;
    } else {
        this._head = this._tail = node;
    }

    if (instance) {
        this.trigger('add', instance);
    } else {
        this.trigger('add', node);
    }

    this._length++;

    return node;
};

/**
 * Add instance to head
 *
 * @param {*} instance
 * @return {ListNode}
 */
List.prototype.addHead = function(instance) {
    var node = poolOfListNodes.get();
    node.init(instance, this.PROPERTY_LINK_TO_NODE);

    if (this._head) {
        this._head.$prev = node;
        node.$next = this._head;
        this._head = node;
    } else {
        this._head = this._tail = node;
    }

    if (instance) {
        this.trigger('add', instance);
    } else {
        this.trigger('add', node);
    }

    this._length++;

    return node;
};

/**
 * Remove {ListNode} by instance
 * @param {*} instance
 * @return {boolean}
 */
List.prototype.remove = function(instance) {
    var node;
    if (instance instanceof ListNode) {
        node = instance;
    } else {
        if (!instance.hasOwnProperty(this.PROPERTY_LINK_TO_NODE)) {
            return false;
        }

        node = instance[this.PROPERTY_LINK_TO_NODE];
        if (node === null) {
            return false;
        }
    }

    if (this._tail === node) {
        this._tail = node.$prev;
    }

    if (this._head === node) {
        this._head = node.$next;
    }

    if (node.$prev !== null) {
        node.$prev.$next = node.$next;
    }

    if (node.$next !== null) {
        node.$next.$prev = node.$prev;
    }

    node.dispose(instance, this.PROPERTY_LINK_TO_NODE);

    this.trigger('remove', instance);

    this._length--;
    return true;
};

/**
 * Length of the list
 * @return {number}
 */
List.prototype.length = function() {
    return this._length;
};

/**
 * Execute callback for each node of the List
 *
 * @param {function} callback
 * @param context
 * @param arg
 */
List.prototype.forEach = function(callback, context, arg) {
    if (!isFunction(callback)) {
        return;
    }

    var node = this._head;
    if (context) {
        while(node) {
            callback.call(context, node.instance, arg);
            node = node.$next;
        }
    } else {
        while(node) {
            callback(node.instance, arg);
            node = node.$next;
        }
    }
};

/**
 * Node of {List}
 *
 * @param {*} instance
 * @param {String} linkBack
 * @constructor
 */
var ListNode = function(instance, linkBack) {
    if (instance) {
        this.init(instance, linkBack);
    }
};

ListNode.prototype.instance = null;
ListNode.prototype.$next = null;
ListNode.prototype.$prev = null;

ListNode.prototype.init = function(instance, linkBack) {
    this.$prev = this.$next = null;

    if (!instance) {
        return;
    }

    this.instance = instance;

    //optimization
    //if (instance.hasOwnProperty(linkBack)) {
    if (instance.linkBack) {
        throw new Error('Can\'t store "' + instance + '" because it containe ' + linkBack + ' property.');
    }

    instance[linkBack] = this;
};

/**
 * Dispose of node
 *
 * @param instance
 * @param linkBack
 */
ListNode.prototype.dispose = function(instance, linkBack) {
    this.$prev = this.$next = null;
    this.instance = null;

    //optimization:
    //delete instance[linkBack];
    instance[linkBack] = null;
    this.onDispose();
}

function disposePoolInstance() {
    this.pool.dispose(this);
}

/**
 * Pool of Object. For recycling of ListNode instances
 *
 * @param TypeOfObject
 * @constructor
 */
var PoolOfObjects = function(TypeOfObject) {
    var _pool = [],
        //maxInstanceCount = 0,
        self = this;

    function createNewInstance() {
        var instance = new TypeOfObject();
        instance.onDispose = disposePoolInstance;
        instance.pool = self;
        return instance;
    }

    /**
     * Request new instance
     * @return {*}
     */
    this.get = function() {
        if (_pool.length === 0) {
            var instance = createNewInstance();
            //it's seems that it give any performance benefits
            //this.warmup(maxInstanceCount + 4);
            return instance;
        } else {
            //maxInstanceCount--;
            return _pool.pop();
        }
    };

    /**
     * Dispose of instance
     * @param instance
     */
    this.dispose = function(instance) {
        //maxInstanceCount++;
        _pool.push(instance);
    };

    /**
     * Put some instances to pool
     * @param {number} count
     * @return {PoolOfObjects}
     */
    this.warmup = function(count) {
        for (var i = 0; i < count; i++) {
            createNewInstance().onDispose();
        }
        return this;
    };
};

darlingutil.PoolOfObjects = PoolOfObjects;
var poolOfListNodes = new PoolOfObjects(ListNode).warmup(1024);