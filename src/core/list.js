'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var List = function() {
    this._head = this._tail = null;
    this._length = 0;
    this.PROPERTY_LINK_TO_NODE = '$$listNode_' + Math.random();
    mixin(this, Events);
};

darlingutil.List = List;

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
    poolOfListNodes.dispose(node);

    this.trigger('remove', instance);

    this._length--;
    return true;
};

List.prototype.length = function() {
    return this._length;
};

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

var ListNode = function(instance, linkBack) {
    if (instance) {
        this.init(instance, linkBack);
    }
};

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

ListNode.prototype.dispose = function(instance, linkBack) {
    this.$prev = this.$next = null;
    this.instance = null;

    //optimization:
    //delete instance[linkBack];
    instance[linkBack] = null;
};

var PoolOfObjects = function(objectType) {
    var _pool = [];

    this.get = function() {
        if (_pool.length === 0) {
            return new objectType();
        } else {
            return _pool.pop();
        }
    };

    this.dispose = function(instance) {
        _pool.push(instance);
    };
};

var poolOfListNodes = new PoolOfObjects(ListNode);