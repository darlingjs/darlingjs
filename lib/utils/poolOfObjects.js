/**
 * Project: Darlingjs
 * Copyright (c) 2015, Eugene-Krevenets
 */

'use strict';

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

function disposePoolInstance() {
    this.pool.dispose(this);
}

module.exports = PoolOfObjects;
