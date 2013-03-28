'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

function getCanvas(id) {
    var domElement = document.getElementById(id);
    if (domElement === null) {
        throw new Error('Can\'t find DOM element with id: "' + id + '"');
    }

    if (darlingutil.isDefined(domElement.getContext)) {
        return domElement;
    } else {
        return null;
    }
}

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
    container.style.left = 0 + 'px';
    container.style.top = 0 + 'px';
    targetElement.appendChild(container);

    var canvas = document.createElement('canvas');
    canvas.width = width || targetElement.clientWidth;
    canvas.height = height || targetElement.clientHeight;
    container.appendChild(canvas);

    return canvas;
}

function removeCanvasFromStack(canvas) {
    if (canvas.parentNode) {
        if (canvas.parentNode.parentNode) {
            canvas.parentNode.parentNode.removeChild(canvas.parentNode);
        }
        canvas.parentNode.removeChild(canvas);
    }
}

//helpers

//http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
    var elem=element, tagname="", x=0, y=0;

    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
        y += elem.offsetTop;
        x += elem.offsetLeft;
        tagname = elem.tagName.toUpperCase();

        if(tagname == "BODY")
            elem=0;

        if(typeof(elem) == "object") {
            if(typeof(elem.offsetParent) == "object")
                elem = elem.offsetParent;
        }
    }

    return {x: x, y: y};
}

/**
 * Get DOM element absolute position
 */
(function(window) {
    function __getIEVersion() {
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }

    function __getOperaVersion() {
        var rv = 0; // Default value
        if (window.opera) {
            var sver = window.opera.version();
            rv = parseFloat(sver);
        }
        return rv;
    }

    var __userAgent = navigator.userAgent;
    var __isIE =  navigator.appVersion.match(/MSIE/) != null;
    var __IEVersion = __getIEVersion();
    var __isIENew = __isIE && __IEVersion >= 8;
    var __isIEOld = __isIE && !__isIENew;

    var __isFireFox = __userAgent.match(/firefox/i) != null;
    var __isFireFoxOld = __isFireFox && ((__userAgent.match(/firefox\/2./i) != null) ||
        (__userAgent.match(/firefox\/1./i) != null));
    var __isFireFoxNew = __isFireFox && !__isFireFoxOld;

    var __isWebKit =  navigator.appVersion.match(/WebKit/) != null;
    var __isChrome =  navigator.appVersion.match(/Chrome/) != null;
    var __isOpera =  window.opera != null;
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

    var api = {};
    window.placement = api;

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

                while (offsetParent != null) {
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
})(window);