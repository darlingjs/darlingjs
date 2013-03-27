/**
 * Project: DarlingJS Game Engine
 * Copyright (c) 2013, Eugene-Krevenets
 */

//(function() {
    'use strict';

    var AABB = Box2D.Collision.b2AABB;
    var Vec2 = Box2D.Common.Math.b2Vec2;
    var BodyDef = Box2D.Dynamics.b2BodyDef;
    var Body = Box2D.Dynamics.b2Body;
    var FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var Fixture = Box2D.Dynamics.b2Fixture;
    var World = Box2D.Dynamics.b2World;
    var MassData = Box2D.Collision.Shapes.b2MassData;
    var PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
    var MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

    var m = darlingjs.module('ngBox2D');

    m.$c('ngPhysic', {
        type: 'dynamic', //static
        restitution: 0.5,
        friction: 0.1,
        density: 1.0
    });

    var zeroVec2 = new Vec2();

/**
 * ngBox2DSystem
 *
 * Draggable subsystem based on ngBox2DSystem. And use it Box2D properties
 * to interact with dragged entity.
 *
 */

    m.$s('ngBox2DDraggable', {
        targetId: 'game',

        $require: ['ngPhysic', 'ngDraggable'],

        $added: ['ngBox2DSystem', function(ngBox2DSystem) {
            this.scale = ngBox2DSystem.scale;
            this._invScale = ngBox2DSystem._invScale;

            this._target = document.getElementById(this.targetId) || document;

            var pos = placement.getElementAbsolutePos(this._target);

            this._shiftX = pos.x;
            this._shiftY = pos.y;

            var self = this;
            this._isMouseDown = false;
            document.addEventListener("mousedown", function(e) {
                self._isMouseDown = true;
                self._handleMouseMove(e);
                document.addEventListener("mousemove", function(e) {
                    self._handleMouseMove(e);
                }, true);
            }, true);

            document.addEventListener("mouseup", function() {
                document.removeEventListener("mousemove", function(e) {
                    self._handleMouseMove(e);
                }, true);
                self._isMouseDown = false;
            }, true);
        }],

        _handleMouseMove: function (e) {
            this._mouseX = (e.clientX - this._shiftX) * this._invScale;
            this._mouseY = (e.clientY - this._shiftY) * this._invScale;
        },

        $update: ['$nodes', 'ngBox2DSystem', function($nodes, ngBox2DSystem) {
            var world;

            if (this._isMouseDown && !this._mouseJoint) {
                world = ngBox2DSystem._world;
                var body = this._getBodyAtMouse(world);
                if(body && body.m_userData && body.m_userData.ngDraggable) {
                    var md = new MouseJointDef();
                    md.bodyA = world.GetGroundBody();
                    md.bodyB = body;
                    md.target.Set(this._mouseX, this._mouseY);
                    md.collideConnected = true;
                    md.maxForce = 300.0 * body.GetMass();
                    this._mouseJoint = world.CreateJoint(md);
                    body.SetAwake(true);
                }
            }

            if(this._mouseJoint) {
                if(this._isMouseDown) {
                    this._mouseJoint.SetTarget(new Vec2(this._mouseX, this._mouseY));
                } else {
                    world = ngBox2DSystem._world;
                    world.DestroyJoint(this._mouseJoint);
                    this._mouseJoint = null;
                }
            }
        }],

        _mousePVec: new Vec2(),

        _getBodyAtMouse: function(world) {
            this._mousePVec.x = this._mouseX;
            this._mousePVec.y = this._mouseY;

            var aabb = new AABB();
            aabb.lowerBound.Set(this._mouseX - 0.001, this._mouseY - 0.001);
            aabb.upperBound.Set(this._mouseX + 0.001, this._mouseY + 0.001);

            // Query the world for overlapping shapes.

            this._selectedBody = null;
            this._getBodyCB.self = this;
            var self = this;
            world.QueryAABB(function(fixtures) {
                self._getBodyCB(fixtures);
            }, aabb);
            return this._selectedBody;
        },

        _getBodyCB: function(fixture) {
            if(fixture.GetBody().GetType() !== Body.b2_staticBody) {
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), this._mousePVec)) {
                    this._selectedBody = fixture.GetBody();
                    return false;
                }
            }
            return true;
        }
    });

/**
 * ngBox2DRollingControl
 *
 * is Box2D subsystem.
 * description: control of box2d entity to roll it and jump.
 * usually fit to platform arcades like Mario Br.
 *
 */

    m.$s('ngBox2DRollingControl', {
        $require: ['ngControlPlatformStyle', 'ngPhysic'],
        _actions: {},
        _keyBinding: [],
        _keyBind: function(keyId, action) {
            this._keyBinding[keyId] = action;
            this._actions[action] = false;
        },
        $added: function() {
            this._runImpulse = new Vec2();
            this._jumpImpulse = new Vec2();
            this._flyImpulse = new Vec2();

            this._keyBind(87, 'move-up');
            this._keyBind(65, 'move-left');
            this._keyBind(83, 'move-down');
            this._keyBind(68, 'move-right');

            this._keyBind(37, 'move-left');
            this._keyBind(38, 'move-up');
            this._keyBind(39, 'move-right');
            this._keyBind(40, 'move-down');

            this._target = document.getElementById(this.targetId) || document;
            var self = this;
            this._target.addEventListener('keydown', function(e) {
                var action = self._keyBinding[e.keyCode];
                if (action) {
                    self._actions[action] = true;
                }
            });
            this._target.addEventListener('keyup', function(e) {
                var action = self._keyBinding[e.keyCode];
                if (action) {
                    self._actions[action] = false;
                }
            });
        },
        $removed: function() {
            //TODO : stop listening keys
        },
        _stayOnGroundDefined: false,
        _stayOnGround: false,
        //TODO : move to ngBox2dSystem
        _isStayOnGround: function(body) {
            if (this._stayOnGroundDefined) {
                return this._stayOnGround;
            }
            var contactItem = body.m_contactList;
            while(contactItem) {
                if (contactItem.contact.IsTouching()) {
                    var norm = contactItem.contact.m_manifold.m_localPlaneNormal;
//                    var sin = Math.sin(contactItem.contact.m_fixtureA.m_body.GetAngle());
//                    var cos = Math.sin(contactItem.contact.m_fixtureA.m_body.GetAngle());
//                    console.log('sin: '+sin);
//                    console.log('cos: '+cos);
//                    console.log('norm.x: '+norm.x + ', ' + norm.x);
                    if (norm.y < -Math.SQRT1_2) {
                        this._stayOnGroundDefined = true;
                        this._stayOnGround = true;
                        return true;
                    }
                }
                contactItem = contactItem.next;
            }
            this._stayOnGroundDefined = true;
            this._stayOnGround = false;
            return false;
        },
        _resetDoubleJump: function(control) {
            this._justFly = false;
            control._jumpCount = 1;
        },
        _doubleJump: function($node, body, control) {
            if (++control._jumpCount > control.doubleJump || !control._hasJumped) {
                return;
            }

            this._jump(body, control);
        },
        _jump: function(body, control) {
            control._hasJumped = true;
            this._jumpImpulse.y = -control.jumpSpeed;
            if (this._actions['move-left']) {
                this._jumpImpulse.x = -control.runSpeed;
            } else if (this._actions['move-right']) {
                this._jumpImpulse.x = control.runSpeed;
            } else {
                this._jumpImpulse.x = 0.0;
            }

            body.SetLinearVelocity(this._jumpImpulse);
//                    body.SetLinearVelocity(zeroVec2);
//                    body.ApplyImpulse(this._jumpImpulse, body.GetWorldCenter());
        },
        $update: ['$node', function($node) {
            this._stayOnGroundDefined = false;
            var body = $node.ngPhysic._b2dBody;
            var control = $node.ngControlPlatformStyle;

            if (this._actions['move-up']) {
                if (this._isStayOnGround(body)) {
                    this._resetDoubleJump(control);
                    this._jump(body, control);
                } else if (this._justFly) {
                    this._doubleJump($node, body, control);
                    this._justFly = false;
                }
            } else {
                this._justFly = !this._isStayOnGround(body);
                if (this._actions['move-left']) {
                    if (this._isStayOnGround(body)) {
                        //TODO: two different approach:
                        // 1) but rotation
//                    body.SetAngularVelocity(-control.runSpeed);

                        // 2) but linera velocity
                        this._runImpulse.x = -control.runSpeed;
                        body.SetLinearVelocity(this._runImpulse);
                    } else {
                        this._flyImpulse.x = -control.flySpeed;
                        body.ApplyImpulse(this._flyImpulse, body.GetWorldCenter());
                    }
                } else if (this._actions['move-right']) {
                    if (this._isStayOnGround(body)) {
                        //1)
//                    body.SetAngularVelocity(control.runSpeed);

                        //2)
                        this._runImpulse.x = control.runSpeed;
                        body.SetLinearVelocity(this._runImpulse);
                    } else {
                        this._flyImpulse.x = control.flySpeed;
                        body.ApplyImpulse(this._flyImpulse, body.GetWorldCenter());
                    }
                } else {
                    body.SetAngularVelocity(0);
                    this._flyImpulse.x = 0;
                    body.ApplyImpulse(this._flyImpulse, body.GetWorldCenter());
                }
            }
        }]
    });

/**
 * ngBox2DSystem
 * description: add Box2D physics simulation to entities.
 *
 */

    m.$s('ngBox2DSystem', {
        gravity: {x:0.0, y:0.0},
        PHYSICS_LOOP_HZ: 1.0 / 60.0,
        scale: 30.0,
        _invScale: 1.0,

        useDebugDraw: true,
        debugDrawDOMId: 'game',

        _world: null,
        _debugDrawVisible:false,

        $require: ['ng2D', 'ngPhysic'],
        $added: function() {
            this._invScale = 1/this.scale;
            this._world = new World(
                new Vec2(this.gravity.x, this.gravity.y), // Gravity vector
                false           // Don't allow sleep
            );
            this.debugDraw(this.useDebugDraw);
        },
        $removed: function() {
            this._world = null;
        },
        $addNode: function($node) {
            var ngPhysic = $node.ngPhysic;
            var ng2D = $node.ng2D;
            var ng2DSize = $node.ng2DSize;
            var ng2DRotation = $node.ng2DRotation;
            var ng2DCircle = $node.ng2DCircle;

            var bodyDef = new BodyDef();
            if (ngPhysic.type === 'static') {
                bodyDef.type = Body.b2_staticBody;
            } else {
                bodyDef.type = Body.b2_dynamicBody;
            }

            var rotation = 0.0;

            var fixDef = new FixtureDef();
            if (darlingutil.isDefined(ng2DSize)) {
                fixDef.shape = new PolygonShape();
                fixDef.shape.SetAsBox(0.5 * ng2DSize.width * this._invScale, 0.5 * ng2DSize.height * this._invScale);
            } else if (darlingutil.isDefined(ng2DCircle)) {
                fixDef.shape = new CircleShape(ng2DCircle.radius * this._invScale);
            } else {
                //TODO : other shapes
                throw new Error('Shape type doesn\'t detected. Need to add component ng2DCircle or ng2DSize.');
            }

            if (ng2DRotation) {
                rotation = ng2DRotation.rotation;
            }

            fixDef.restitution = ngPhysic.restitution;
            fixDef.friction = ngPhysic.friction;
            fixDef.density = ngPhysic.density;

            bodyDef.position.Set(ng2D.x * this._invScale, ng2D.y * this._invScale);
            bodyDef.angle = 0;

            //fixDef.filter.categoryBits   = 0x0002;
            //fixDef.filter.maskBits       = 0x0001;

            ngPhysic._b2dBody = this._world.CreateBody(bodyDef);
            ngPhysic._b2dBody.SetAngle(rotation);
            ngPhysic._b2dBody.CreateFixture(fixDef);
            ngPhysic._b2dBody.m_userData = $node;
        },
        $removeNode: function($node) {
            var body = $node.ngPhysic._b2dBody;
            if (darlingutil.isDefined(body)) {
                this._world.DestroyBody(body);
            }
        },
        $update: ['$nodes', '$time', function($nodes, $time) {
            this._world.Step(
                this.PHYSICS_LOOP_HZ,    //frame-rate
                10,                      //velocity iterations
                10                       //position iterations
            );
            if (this._debugDrawVisible) {
                this._world.DrawDebugData();
            }
            $nodes.forEach(this.$$updateNodePosition);
            this._world.ClearForces();
        }],

        $$updateNodePosition: function($node) {
            var body = $node.ngPhysic._b2dBody;
            var pos = body.GetPosition();

            var ng2D = $node.ng2D;
            ng2D.x = pos.x * 30; // FIXME : this.scale;
            ng2D.y = pos.y * 30; // FIXME : this.scale;

            var ng2DRotation = $node.ng2DRotation;
            if (ng2DRotation) {
                ng2DRotation.rotation = body.GetAngle();
            }
        },

        debugDraw: function(visible) {
            if (this._debugDrawVisible === visible) {
                return;
            }

            this._debugDrawVisible = visible;

            if (this._debugDrawVisible) {
                this._debugDraw = new DebugDraw();
                var canvas = placeCanvasAtId(this.debugDrawDOMId);
                /*
                var targetElement = document.getElementById(this.debugDrawDOMId);
                if (targetElement === null) {
                    throw new Error('Can\'t show debug draw because there is no any "' + this.debugDrawDOMId + '" DOM elements.');
                }

                var canvas;
                if (!targetElement.getContext) {
                    var container = document.createElement('div');
                    container.style.position = 'absolute';
                    container.style.left = '0px';
                    container.style.top = '0px';
                    targetElement.appendChild(container);
                    canvas = document.createElement('canvas');
                    canvas.width = targetElement.clientWidth;
                    canvas.height = targetElement.clientHeight;
                    container.appendChild(canvas);
                } else {
                    canvas = targetElement;
                }
                */

                this._debugDraw.SetSprite(canvas.getContext("2d"));
                this._debugDraw.SetDrawScale(this.scale);
                this._debugDraw.SetFillAlpha(0.5);
                this._debugDraw.SetLineThickness(1.0);
                this._world.SetDebugDraw(this._debugDraw);
                this._debugDraw.SetFlags(
                        DebugDraw.e_shapeBit |
                        DebugDraw.e_jointBit |
                        //DebugDraw.e_aabbBit |
//                        DebugDraw.e_pairBit |
                        DebugDraw.e_centerOfMassBit |
                        DebugDraw.e_controllerBit);
            } else {
                this._world.SetDebugDraw(null);
                this._debugDraw = null;
            }
        },
        _addContactListener: function (callbacks) {
            var listener = new Box2D.Dynamics.b2ContactListener();

            if(callbacks.PostSolve) {
                listener.PostSolve = function (contact, impulse) {
                    callbacks.PostSolve(
                        contact.GetFixtureA().GetBody(),
                        contact.GetFixtureB().GetBody(),
                        impulse.normalImpulses[0]);
                };
            }


            this._world.SetContactListener(listener);
        }
    });

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

    function placeCanvasAtId(id) {
        var targetElement = document.getElementById(id);
        if (targetElement === null) {
            throw new Error('Can\'t find DOM element with id: "' + id + '"');
        }

        var canvas;
        if (!targetElement.getContext) {
            var container = document.createElement('div');
            container.style.position = 'absolute';
            var position = placement.getElementAbsolutePos(targetElement);
            container.style.left = position.x + 'px';
            container.style.top = position.y + 'px';
            targetElement.appendChild(container);
            canvas = document.createElement('canvas');
            canvas.width = targetElement.clientWidth;
            canvas.height = targetElement.clientHeight;
            container.appendChild(canvas);
        } else {
            canvas = targetElement;
        }

        return canvas;
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
//})();