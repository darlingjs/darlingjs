/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 */

/**
 * The static facade of darlingjs utils
 *
 * @class darlingutil
 * @global
 */
var darlingutil = {};

darlingutil.version = '0.0.0';

(function(context) {
    'use strict';

    darlingutil.getCanvas = function(id) {
        var domElement = document.getElementById(id);
        if (domElement === null) {
            throw new Error('Can\'t find DOM element with id: "' + id + '"');
        }

        if (darlingutil.isDefined(domElement.getContext)) {
            return domElement;
        } else {
            return null;
        }
    };

    darlingutil.placeCanvasInStack = placeCanvasInStack;
    function placeCanvasInStack(id, width, height) {
        var targetElement = document.getElementById(id);
        if (targetElement === null) {
            throw new Error('Can\'t find DOM element with id: "' + id + '"');
        }

        var container = document.createElement('div');
        container.style.position = 'absolute';
//    var position = placement.getElementAbsolutePos(targetElement);
//    container.style.left = position.x + 'px';
//    container.style.top = position.y + 'px';
        //container.style.left = 0 + 'px';
        container.style.top = 0 + 'px';
        targetElement.appendChild(container);

        var canvas = document.createElement('canvas');
        canvas.width = width || targetElement.clientWidth;
        canvas.height = height || targetElement.clientHeight;
        container.appendChild(canvas);

        return canvas;
    }

    darlingutil.removeCanvasFromStack = removeCanvasFromStack;
    function removeCanvasFromStack(canvas) {
        if (canvas.parentNode) {
            if (canvas.parentNode.parentNode) {
                canvas.parentNode.parentNode.removeChild(canvas.parentNode);
            }
            canvas.parentNode.removeChild(canvas);
        }
    }

    /**
     * Get DOM element absolute position
     */
    //(function(window) {
        function __getIEVersion() {
            var rv = -1; // Return value assumes failure.
            if (context.navigator && context.navigator.appName == 'Microsoft Internet Explorer') {
                var ua = context.navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv;
        }

        function __getOperaVersion() {
            var rv = 0; // Default value
            if (context && context.opera) {
                var sver = context.opera.version();
                rv = parseFloat(sver);
            }
            return rv;
        }

        var __userAgent = context.navigator && context.navigator.userAgent || '';
        var __isIE =  context.navigator && context.navigator.appVersion.match(/MSIE/) != null;
        var __IEVersion = __getIEVersion();
        var __isIENew = __isIE && __IEVersion >= 8;
        var __isIEOld = __isIE && !__isIENew;

        var __isFireFox = __userAgent.match(/firefox/i) != null;
        var __isFireFoxOld = __isFireFox && ((__userAgent.match(/firefox\/2./i) != null) ||
            (__userAgent.match(/firefox\/1./i) != null));
        var __isFireFoxNew = __isFireFox && !__isFireFoxOld;

        var __isWebKit =  context.navigator && context.navigator.appVersion.match(/WebKit/) != null;
        var __isChrome =  context.navigator && context.navigator.appVersion.match(/Chrome/) != null;
        var __isOpera =  context.window && context.window.opera != null;
        var __operaVersion = __getOperaVersion();
        var __isOperaOld = __isOpera && (__operaVersion < 10);

        function __parseBorderWidth(width) {
            var res = 0;
            if (typeof(width) == "string" && width != null && width != "" ) {
                var p = width.indexOf("px");
                if (p >= 0) {
                    res = parseInt(width.substring(0, p));
                }
                else {
                    //do not know how to calculate other values
                    //(such as 0.5em or 0.1cm) correctly now
                    //so just set the width to 1 pixel
                    res = 1;
                }
            }
            return res;
        }

//returns border width for some element
        function __getBorderWidth(element) {
            var res = new Object();
            res.left = 0; res.top = 0; res.right = 0; res.bottom = 0;
            if (window.getComputedStyle) {
                //for Firefox
                var elStyle = window.getComputedStyle(element, null);
                res.left = parseInt(elStyle.borderLeftWidth.slice(0, -2));
                res.top = parseInt(elStyle.borderTopWidth.slice(0, -2));
                res.right = parseInt(elStyle.borderRightWidth.slice(0, -2));
                res.bottom = parseInt(elStyle.borderBottomWidth.slice(0, -2));
            }
            else {
                //for other browsers
                res.left = __parseBorderWidth(element.style.borderLeftWidth);
                res.top = __parseBorderWidth(element.style.borderTopWidth);
                res.right = __parseBorderWidth(element.style.borderRightWidth);
                res.bottom = __parseBorderWidth(element.style.borderBottomWidth);
            }

            return res;
        }

//        var api = {};
//        window.placement = api;
        var api = darlingutil;

//returns the absolute position of some element within document
        api.getElementAbsolutePlacement = function(element) {
            var result = getElementAbsolutePos(element);
            result.width = element.offsetWidth;
            result.height = element.offsetHeight;
            return result;
        }

        api.getElementAbsolutePos = getElementAbsolutePos;

        function getElementAbsolutePos(element) {
            var res = new Object();
            res.x = 0; res.y = 0;
            if (element !== null) {
                if (element.getBoundingClientRect) {
                    var viewportElement = document.documentElement;
                    var box = element.getBoundingClientRect();
                    var scrollLeft = viewportElement.scrollLeft;
                    var scrollTop = viewportElement.scrollTop;

                    res.x = box.left + scrollLeft;
                    res.y = box.top + scrollTop;

                }
                else { //for old browsers
                    res.x = element.offsetLeft;
                    res.y = element.offsetTop;

                    var parentNode = element.parentNode;
                    var borderWidth = null;

                    while (offsetParent !== null) {
                        res.x += offsetParent.offsetLeft;
                        res.y += offsetParent.offsetTop;

                        var parentTagName =
                            offsetParent.tagName.toLowerCase();

                        if ((__isIEOld && parentTagName != "table") ||
                            ((__isFireFoxNew || __isChrome) &&
                                parentTagName == "td")) {
                            borderWidth = kGetBorderWidth
                            (offsetParent);
                            res.x += borderWidth.left;
                            res.y += borderWidth.top;
                        }

                        if (offsetParent != document.body &&
                            offsetParent != document.documentElement) {
                            res.x -= offsetParent.scrollLeft;
                            res.y -= offsetParent.scrollTop;
                        }


                        //next lines are necessary to fix the problem
                        //with offsetParent
                        if (!__isIE && !__isOperaOld || __isIENew) {
                            while (offsetParent != parentNode &&
                                parentNode !== null) {
                                res.x -= parentNode.scrollLeft;
                                res.y -= parentNode.scrollTop;
                                if (__isFireFoxOld || __isWebKit)
                                {
                                    borderWidth =
                                        kGetBorderWidth(parentNode);
                                    res.x += borderWidth.left;
                                    res.y += borderWidth.top;
                                }
                                parentNode = parentNode.parentNode;
                            }
                        }

                        parentNode = offsetParent.parentNode;
                        offsetParent = offsetParent.offsetParent;
                    }
                }
            }
            return res;
        }
//    })(window);
})(this);

var toString = Object.prototype.toString;

/**
 * Is instance is defined
 * @param {*} value
 * @return {boolean}
 */
darlingutil.isDefined = isDefined;
function isDefined(value) {
    return typeof value !== 'undefined';
}

darlingutil.isUndefined = isUndefined;
function isUndefined(value) {
    return typeof value === 'undefined';
}

darlingutil.isObject = isObject;
function isObject(value) {
    return value !== null && typeof value === 'object';
}

darlingutil.isArray = isArray;
function isArray(value) {
    return toString.apply(value) === '[object Array]';
}

darlingutil.isString = isString;
function isString(value) {
    return typeof value === 'string';
}

/**
 * Checks if `obj` is a window object.
 *
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
darlingutil.isWindow = isWindow;
function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

/**
 * @ngdoc function
 * @name angular.isDate
 * @function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
darlingutil.isDate = isDate;
function isDate(value){
    return toString.apply(value) === '[object Date]';
}

/**
 * @ngdoc function
 * @name angular.isFunction
 * @function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
darlingutil.isFunction = isFunction;
function isFunction(value) {
    return typeof value === 'function';
}

function isTypeOf(o, t) {
    if (isString(t)) {
        return Object.prototype.toString.call(o) === '[object ' + t + ' ]';
    } else {
        throw new Error('t is require and must be a string');
    }
}

/**
 * @ngdoc function
 * @name angular.copy
 * @function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for array) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If  `source` is not an object or array, `source` is returned.
 *
 * Note: this function is used to augment the Object type in Angular expressions. See
 * {@link ng.$filter} for more information about Angular arrays.
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 */
darlingutil.copy = copy;
function copy(source, destination, deleteAllDestinationProperties){
    if (isWindow(source)) {
        throw new Error("Can't copy Window");
    }
    if (!destination) {
        destination = source;
        if (source) {
            if (isArray(source)) {
                destination = copy(source, []);
            } else if (isDate(source)) {
                destination = new Date(source.getTime());
            } else if (isObject(source)) {
                destination = copy(source, {});
            }
        }
    } else {
        if (source === destination) {
            throw new Error("Can't copy equivalent objects or arrays");
        }
        if (isArray(source)) {
            destination.length = 0;
            for ( var i = 0; i < source.length; i++) {
                destination.push(copy(source[i]));
            }
        } else {
            if (deleteAllDestinationProperties) {
                forEach(destination, function(value, key){
                    delete destination[key];
                });
            }
            for ( var key in source) {
                if (source.hasOwnProperty(key)) {
                    destination[key] = copy(source[key]);
                }
            }
        }
    }
    return destination;
}

/**
 * @ngdoc function
 * @name angular.forEach
 * @function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
 * is the value of an object property or an array element and `key` is the object property key or
 * array element index. Specifying a `context` for the function is optional.
 *
 * Note: this function was previously known as `angular.foreach`.
 *
 <pre>
 var values = {name: 'misko', gender: 'male'};
 var log = [];
 angular.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
 expect(log).toEqual(['name: misko', 'gender:male']);
 </pre>
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */

/**
 * @private
 * @ignore
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments, ...)
 */
function isArrayLike(obj) {
    if (!obj || (typeof obj.length !== 'number')) {
        return false;
    }

    // We have on object which has length property. Should we treat it as array?
    if (typeof obj.hasOwnProperty !== 'function' &&
        typeof obj.constructor !== 'function') {
        // This is here for IE8: it is a bogus object treat it as array;
        return true;
    } else  {
        return obj instanceof JQLite ||                      // JQLite
            (jQuery && obj instanceof jQuery) ||          // jQuery
            toString.call(obj) !== '[object Object]' ||   // some browser native object
            typeof obj.callee === 'function';              // arguments (on IE8 looks like regular obj)
    }
}

function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)){
            for (key in obj) {
                if (key !== 'prototype' && key !== 'length' && key !== 'name' && obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isArrayLike(obj)) {
            for (key = 0; key < obj.length; key++) {
                iterator.call(context, obj[key], key);
            }
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}


/**
 * @ngdoc method
 * @name AUTO.$injector#annotate
 * @methodOf AUTO.$injector
 *
 * @description
 * Returns an array of service names which the function is requesting for injection. This API is used by the injector
 * to determine which services need to be injected into the function when the function is invoked. There are three
 * ways in which the function can be annotated with the needed dependencies.
 *
 * # Argument names
 *
 * The simplest form is to extract the dependencies from the arguments of the function. This is done by converting
 * the function into a string using `toString()` method and extracting the argument names.
 * <pre>
 *   // Given
 *   function MyController($scope, $route) {
 *     // ...
 *   }
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * </pre>
 *
 * This method does not work with code minfication / obfuscation. For this reason the following annotation strategies
 * are supported.
 *
 * # The `$inject` property
 *
 * If a function has an `$inject` property and its value is an array of strings, then the strings represent names of
 * services to be injected into the function.
 * <pre>
 *   // Given
 *   var MyController = function(obfuscatedScope, obfuscatedRoute) {
 *     // ...
 *   }
 *   // Define function dependencies
 *   MyController.$inject = ['$scope', '$route'];
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * </pre>
 *
 * # The array notation
 *
 * It is often desirable to inline Injected functions and that's when setting the `$inject` property is very
 * inconvenient. In these situations using the array notation to specify the dependencies in a way that survives
 * minification is a better choice:
 *
 * <pre>
 *   // We wish to write this (not minification / obfuscation safe)
 *   injector.invoke(function($compile, $rootScope) {
 *     // ...
 *   });
 *
 *   // We are forced to write break inlining
 *   var tmpFn = function(obfuscatedCompile, obfuscatedRootScope) {
 *     // ...
 *   };
 *   tmpFn.$inject = ['$compile', '$rootScope'];
 *   injector.invoke(tempFn);
 *
 *   // To better support inline function the inline annotation is supported
 *   injector.invoke(['$compile', '$rootScope', function(obfCompile, obfRootScope) {
 *     // ...
 *   }]);
 *
 *   // Therefore
 *   expect(injector.annotate(
 *      ['$compile', '$rootScope', function(obfus_$compile, obfus_$rootScope) {}])
 *    ).toEqual(['$compile', '$rootScope']);
 * </pre>
 *
 * @param {function|Array.<string|Function>} fn Function for which dependent service names need to be retrieved as described
 *   above.
 *
 * @returns {Array.<string>} The names of the services which the function requires.
 */

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

darlingutil.annotate = annotate;
function annotate(fn) {
    var $inject,
        fnText,
        argDecl,
        last;

    if (typeof fn === 'function') {
        if (!($inject = fn.$inject)) {
            $inject = [];
            fnText = fn.toString().replace(STRIP_COMMENTS, '');
            argDecl = fnText.match(FN_ARGS);
            forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg){
                arg.replace(FN_ARG, function(all, underscore, name){
                    $inject.push(name);
                });
            });
            fn.$inject = $inject;
        }
    } else if (isArray(fn)) {
        last = fn.length - 1;
        assertArgFn(fn[last], 'fn');
        $inject = fn.slice(0, last);
    } else {
        assertArgFn(fn, 'fn', true);
    }
    return $inject;
}

function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && isArray(arg)) {
        arg = arg[arg.length - 1];
    }

    assertArg(isFunction(arg), name, 'not a function, got ' +
        (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
}

/**
 * throw error of the argument is falsy.
 * @ignore
 */
function assertArg(arg, name, reason) {
    if (!arg) {
        throw new Error("Argument '" + (name || '?') + "' is " + (reason || "required"));
    }
    return arg;
}

/**
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
 *
 * Get from AngularJS.
 *
 * @ignore
 * @example
 <pre>
 function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
 </pre>
 */

darlingutil.noop = noop;
function noop(){}

/**
 * Get Observer from Backbone
 * @ignore
 */


// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

darlingutil.swallowCopy = swallowCopy;
function swallowCopy(original, extended) {
    if (extended === null || original === null) {
        return original;
    }

    for (var key in extended) {
        original[key] = extended[key];
    }
}

/**
 * Get from https://www.udacity.com/course/cs255
 */

/**
 *
 * @ignore
 * @param original
 * @param extended
 * @return {*}
 */
darlingutil.mixin = mixin;
function mixin(original, extended) {
    if (extended === null) {
        return original;
    }
    for (var key in extended) {
        var ext = extended[key];
        if (typeof (ext) !== 'object') {
            original[key] = ext;
        } else {
            if (!original[key] || typeof (original[key]) !== 'object') {
                original[key] = {};
            }
            mixin(original[key], ext);
        }
    }
    return original;
}

darlingutil.factoryOfFastFunctionAsCallOrApply = factoryOfFastFunctionAsCallOrApply;
function factoryOfFastFunctionAsCallOrApply(fn, context, args) {
    switch(args.length) {
        case 0: return function() {
            return fn.call(context);
        };
        case 1: return function() {
            return fn.call(context, args[0]);
        };
        case 2: return function() {
            return fn.call(context, args[0], args[1]);
        };
        case 3: return function() {
            return fn.call(context, args[0], args[1], args[2]);
        };
        case 4: return function() {
            return fn.call(context, args[0], args[1], args[2], args[4]);
        };
        default: return function() {
            return fn.apply(context, args);
        };
    }
}

darlingutil.factoryOfFastFunctionAsCallOrApply = factoryOfFastFunctionAsAMember;
function factoryOfFastFunctionAsAMember(fn, context, args, methodName) {
    switch(args.length) {
        case 0: return function() {
            return context[methodName]();
        };
        case 1: return function() {
            return context[methodName](args[0]);
        };
        case 2: return function() {
            return context[methodName](args[0], args[1]);
        };
        case 3: return function() {
            return context[methodName](args[0], args[1], args[2]);
        };
        case 4: return function() {
            return context[methodName](args[0], args[1], args[2], args[3]);
        };
        default: return function() {
            return fn.apply(context, args);
        };
    }
}

/**
 * Optimization based on
 * http://jsperf.com/function-calls-direct-vs-apply-vs-call-vs-bind/5
 *
 * Priority of function calls:
 * 1. direct: that.f();
 * 2. by string: that['f']();
 * 3. by call: f.call(that);
 * 4. by apply: f.apply(that);
 *
 * So where it's possbile we use call by string
 *
 * @ignore
 * @param fn
 * @param context
 * @param args
 * @param methodName
 * @return {*}
 */

darlingutil.factoryOfFastFunction = factoryOfFastFunction;
function factoryOfFastFunction(fn, context, args, methodName) {
    if (context.hasOwnProperty(methodName)) {
        return factoryOfFastFunctionAsAMember(fn, context, args, methodName);
    } else {
        return factoryOfFastFunctionAsCallOrApply(fn, context, args);
    }
}

/**
 * @ignore
 * @param fn
 * @param context
 * @param args
 * @param argsMatcher
 * @return {Function}
 */
darlingutil.factoryOfFastFunctionWithMatcherAsCallOrApply = factoryOfFastFunctionWithMatcherAsCallOrApply;
function factoryOfFastFunctionWithMatcherAsCallOrApply(fn, context, args, argsMatcher) {
    switch(args.length) {
        case 0: return function() {
            return fn.call(context);
        };
        case 1: return function() {
            argsMatcher(args, arguments);
            return fn.call(context, args[0]);
        };
        case 2: return function() {
            argsMatcher(args, arguments);
            return fn.call(context, args[0], args[1]);
        };
        case 3: return function() {
            argsMatcher(args, arguments);
            return fn.call(context, args[0], args[1], args[2]);
        };
        default: return function() {
            argsMatcher(args, arguments);
            return fn.apply(context, args);
        };
    }
}

darlingutil.factoryOfFastFunctionWithMatcherAsAMember = factoryOfFastFunctionWithMatcherAsAMember;
function factoryOfFastFunctionWithMatcherAsAMember(fn, context, args, argsMatcher, methodName) {
    switch(args.length) {
        case 0: return function() {
            return context[methodName]();
        };
        case 1: return function() {
            argsMatcher(args, arguments);
            return context[methodName](args[0]);
        };
        case 2: return function() {
            argsMatcher(args, arguments);
            return context[methodName](args[0], args[1]);
        };
        case 3: return function() {
            argsMatcher(args, arguments);
            return context[methodName](args[0], args[1], args[2]);
        };
        case 4: return function() {
            argsMatcher(args, arguments);
            return context[methodName](args[0], args[1], args[2], args[3]);
        };
        default: return function() {
            argsMatcher(args, arguments);
            return fn.apply(context, args);
        };
    }
}

/**
 * Create function with custom matcher
 *
 * @ignore
 * @param fn
 * @param context
 * @param args
 * @param argsMatcher
 * @param methodName
 * @return {Function}
 */
darlingutil.factoryOfFastFunctionWithMatcher = factoryOfFastFunctionWithMatcher;
function factoryOfFastFunctionWithMatcher(fn, context, args, argsMatcher, methodName) {
    if (context.hasOwnProperty(methodName)) {
        return factoryOfFastFunctionWithMatcherAsAMember(fn, context, args, argsMatcher, methodName);
    } else {
        return factoryOfFastFunctionWithMatcherAsCallOrApply(fn, context, args, argsMatcher);
    }
}

// remove all own properties on obj, effectively reverting it to a new object
darlingutil.wipe = function(obj) {
    for (var p in obj) {
        if (obj.hasOwnProperty(p))
            delete obj[p];
    }
};

/**
 * result of function is value that lays in interval [min, max]
 *
 * http://en.wikipedia.org/wiki/Clamping_(graphics)
 *
 * @param value
 * @param min
 * @param max
 */
darlingutil.clamp = function(value, min, max) {
    if (value < min) {
        return min
    } else if (value > max) {
        return max;
    }
    return value;
}

/**
 * define is convex polygon define by vertexes clockwise on anticlockwise
 * @private
 * @param vertexes
 * @returns {*}
 */
darlingutil.isConvexPolygonClockwise = function(vertexes) {
    if (!vertexes) {
        return undefined;
    }

    if (vertexes.length < 3) {
        return undefined;
    }

    var index = 0;
    var firstPoint = vertexes[index];

    var secondPoint = null;
    while(++index < vertexes.length) {
        secondPoint = vertexes[index]
        if (firstPoint.x !== secondPoint.x || firstPoint.y !== secondPoint.y) {
            break;
        }
        secondPoint = null;
    }

    if (secondPoint === null) {
        return undefined;
    }

    var initAngle = Math.atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x);

    while(++index < vertexes.length) {
        var currentPoint = vertexes[index];
        if (firstPoint.x !== currentPoint.x && secondPoint.x !== currentPoint.x
            || firstPoint.y !== currentPoint.y && secondPoint.y !== currentPoint.y) {

            var currentAngle = Math.atan2(currentPoint.y - firstPoint.y, currentPoint.x - firstPoint.x);
            var deltaAngle = initAngle - currentAngle;
            if (deltaAngle > Math.PI) {
                deltaAngle -= 2*Math.PI;
            } else if (deltaAngle < -Math.PI) {
                deltaAngle += 2*Math.PI;
            }
            if (deltaAngle < 0) {
                return false;
            }
            if (deltaAngle > 0) {
                return true;
            }
        }
    }
};

module.exports = darlingutil;
