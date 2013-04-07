/**
 * Project: darlingjs / GameEngine.
 *
 * Adapter for emscripten port of Box2D 2.2.1 to javascript
 *
 * Copyright (c) 2013, Eugene-Krevenets
 *
 */

(function(darlingjs, darlingutil) {
    'use strict';
    var m = darlingjs.module('ngBox2DEmscripten');



    /**
     * ngBox2DSystem.
     *
     * description: add Box2D physics simulation to entities.
     *
     */

    m.$s('ngBox2DSystem', {
        gravity: {x:0.0, y:0.0},
        PHYSICS_LOOP_HZ: 1.0 / 60.0,
        scale: 30.0,
        allowSleep: true,
        velocityIterations: 10,
        positionIterations: 10,

        _invScale: 1.0,

        _world: null,

        $require: ['ng2D', 'ngPhysic'],

        $added: function() {
            using(Box2D, "b2.+");
            this._invScale = 1/this.scale;
            this._world = new b2World(
                new b2Vec2(this.gravity.x, this.gravity.y) // Gravity vector
                //, !this.allowSleep // Don't allow sleep
            );
        },
        $removed: function() {
            if (this._world !== null) {
                Box2D.destroy(this._world);
            }
            this._world = null;
        },
        $addNode: function($node) {
            var ngPhysic = $node.ngPhysic;
            var ng2D = $node.ng2D;
            var ng2DSize = $node.ng2DSize;
            var ng2DRotation = $node.ng2DRotation;
            var ng2DCircle = $node.ng2DCircle;
            var ng2DPolygon = $node.ng2DPolygon;

            var bodyDef = new b2BodyDef();
            switch(ngPhysic.type) {
                case 'static':
                    bodyDef.set_type(b2_staticBody);
                    break;
                case 'kinematic':
                    bodyDef.set_type(b2_kinematicBody);
                    break;
                default:
                    bodyDef.set_type(b2_dynamicBody);
                    break;
            }

            var rotation = 0.0;
            var shape;
            var fixDef = new b2FixtureDef();

            if (darlingutil.isDefined(ng2DSize)) {
                shape = new b2PolygonShape();
                shape.SetAsBox(0.5 * ng2DSize.width * this._invScale, 0.5 * ng2DSize.height * this._invScale);
            } else if (darlingutil.isDefined(ng2DCircle)) {
                shape = new b2CircleShape();
                shape.set_m_radius(ng2DCircle.radius * this._invScale);
            } else if (darlingutil.isDefined(ng2DPolygon)) {
                var vertexes = [];
                for (var vertexIndex = 0, vertexCount = ng2DPolygon.line.length; vertexIndex < vertexCount; vertexIndex++) {
                    var point = ng2DPolygon.line[vertexIndex];
                    vertexes.push(new b2Vec2(point.x * this._invScale, point.y * this._invScale));
                }

                shape = new b2PolygonShape();
                //shape.SetAsVector(vertexes, ng2DPolygon.line.length);
                shape.Set(vertexes, ng2DPolygon.line.length);
            } else {
                //TODO : other shapes
                throw new Error('Shape type doesn\'t detected. Need to add component ng2DCircle or ng2DSize.');
            }

            fixDef.set_shape(shape);

            if (ng2DRotation) {
                rotation = ng2DRotation.rotation;
            }

            fixDef.set_restitution(ngPhysic.restitution);
            fixDef.set_friction(ngPhysic.friction);
            fixDef.set_density(ngPhysic.density);

            bodyDef.set_position(new b2Vec2(ng2D.x * this._invScale, ng2D.y * this._invScale));
            bodyDef.set_angle(rotation);
            bodyDef.set_fixedRotation(ngPhysic.fixedRotation);

            //fixDef.filter.categoryBits   = 0x0002;
            //fixDef.filter.maskBits       = 0x0001;

            var body = this._world.CreateBody(bodyDef);
            //body.SetAngle(rotation);
            body.CreateFixture(fixDef);
            body.m_userData = $node;

            ngPhysic._b2dBody = body;
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
                this.velocityIterations, //velocity iterations
                this.positionIterations  //position iterations
            );

            $nodes.forEach(this.$$updateNodePosition);
            this._world.ClearForces();
        }],

        $$updateNodePosition: function($node) {
            var body = $node.ngPhysic._b2dBody;
            var pos = body.GetPosition();

            var ng2D = $node.ng2D;
            ng2D.x = pos.get_x() * 30; // FIXME : this.scale;
            ng2D.y = pos.get_y() * 30; // FIXME : this.scale;

            var ng2DRotation = $node.ng2DRotation;
            if (ng2DRotation) {
                ng2DRotation.rotation = body.GetAngle();
            }
        },

        /**
         * Create joint instance by joint definition
         *
         * @param def
         * @return {*}
         */
        createJoint: function(def) {
            return this._world.CreateJoint(def);
        },

        /**
         * Get bodies array by position
         *
         * @param x
         * @param y
         */
        _getBodiesAtAABB: null,
        getBodiesAt: function(x, y) {
            if (this._getBodiesAtAABB === null) {
                this._getBodiesAtAABB = new AABB();
            }
            var aabb = this._getBodiesAtAABB;
            aabb.lowerBound.Set(x - 0.001, y - 0.001);
            aabb.upperBound.Set(x + 0.001, y + 0.001);

            // Query the world for overlapping shapes.

            var result = [];
            this._world.QueryAABB(function(fixture) {
                result.push(fixture.GetBody());
                return true;
            }, aabb);

            return result;
        },

        getOneBoyAt: function(x, y) {
            var fixture = this.getOneFixtureAt(x, y);
            if (fixture) {
                return fixture.GetBody();
            }
            return null;
        },

        /**
         * Get one fixture in point x, y
         * @param x
         * @param y
         * @return {*}
         */
        getOneFixtureAt: function(x, y) {
            // Make a small box.
            var aabb = new b2AABB();
            var d = 0.001;
            aabb.set_lowerBound(new b2Vec2(x - d, y - d));
            aabb.set_upperBound(new b2Vec2(x + d, y + d));

            // Query the world for overlapping shapes.
            var myQueryCallback = this._getQueryCallbackForOneFixture();
            myQueryCallback.m_fixture = null;
            myQueryCallback.m_point = new b2Vec2(x, y);
            this._world.QueryAABB(myQueryCallback, aabb);

            return myQueryCallback.m_fixture;
        },

        /**
         * Lazy initialization of querycallback function for queryAABB
         *
         * @private
         */
        _getQueryCallbackForOneFixture: function() {
            if (this._myQueryCallback) {
                return this._myQueryCallback;
            }

            var myQueryCallback = new b2QueryCallback();
            this._myQueryCallback = myQueryCallback;

            Box2D.customizeVTable(myQueryCallback, [{
                original: Box2D.b2QueryCallback.prototype.ReportFixture,
                replacement:
                    function(thsPtr, fixturePtr) {
                        var ths = Box2D.wrapPointer( thsPtr, Box2D.b2QueryCallback );
                        var fixture = Box2D.wrapPointer( fixturePtr, Box2D.b2Fixture );

                        //if ( fixture.GetBody().GetType() !== Box2D.b2_dynamicBody ) //mouse cannot drag static bodies around
                        //    return true;
                        if ( ! fixture.TestPoint( ths.m_point ) )
                            return true;
                        ths.m_fixture = fixture;
                        return false;
                    }
            }]);

            return this._myQueryCallback;
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
        },

        /**
         * b2World::GetGroundBody() is gone. So we need simulate it now
         * http://www.box2d.org/forum/viewtopic.php?f=3&t=5325
         *
         * @return {*}
         */
        getGroundBody: function() {
            if (this._groundBody) {
                return this._groundBody;
            }
            this._groundBody = this._world.CreateBody( new b2BodyDef() );
            return this._groundBody;
        }
    });

    /**
     * Box2D Debug Draw System
     *
     */

    m.$s('ngBox2DDebugDraw', {
        $require: ['ng2D', 'ngPhysic'],
        _debugDrawVisible: false,

        _canvasHasCreated: false,
        _canvas: null,

        useDebugDraw: true,
        domID: 'game',

        $added: ['ngBox2DSystem', function(ngBox2DSystem) {
            this.ngBox2DSystem = ngBox2DSystem;
            this.showDebugDrawVisible(this.useDebugDraw);
        }],

        $update: ['ng2DViewPort', function(ng2DViewPort) {
            //TODO: shift debug visualization
            var context = this._context;
            context.save();
                //context.scale(this.ngBox2DSystem.scale, this.ngBox2DSystem.scale);

                //black background
                context.fillStyle = 'rgb(0,0,0)';
                context.fillRect( 0, 0, this.width, this.height );
                context.fillStyle = 'rgb(255,255,0)';
                context.scale(this.ngBox2DSystem.scale, this.ngBox2DSystem.scale);
                context.lineWidth /= this.ngBox2DSystem.scale;

                customDebugDraw.drawAxes(context);

                var centerX = 300;
                var centerY = 300;
                //context.translate(centerX -ng2DViewPort.lookAt.x, centerY -ng2DViewPort.lookAt.y);
                this.ngBox2DSystem._world.DrawDebugData();

            context.restore();
        }],

        showShape: function(value) {
            this._debugDraw.SetFlags(this._debugDraw.GetFlags() | e_shapeBit);
        },

        showJoint: function(value) {
            this._debugDraw.SetFlags(this._debugDraw.GetFlags() | e_jointBit);
        },

        showAABB: function(value) {
            this._debugDraw.SetFlags(this._debugDraw.GetFlags() | e_aabbBit);
        },

        showPair: function(value) {
            this._debugDraw.SetFlags(this._debugDraw.GetFlags() | e_pairBit);
        },

        showCenterOfMass: function(value) {
            this._debugDraw.SetFlags(this._debugDraw.GetFlags() | e_centerOfMassBit);
        },

        showDebugDrawVisible: function(visible) {
            if (this._debugDrawVisible === visible) {
                return;
            }

            this._debugDrawVisible = visible;

            if (this._debugDrawVisible) {
                var canvas = darlingutil.getCanvas(this.domID);

                if (canvas === null) {
                    canvas = darlingutil.placeCanvasInStack(this.domID, this.width, this.height);
                    this._canvasHasCreated = true;
                }

                this._canvas = canvas;
                this._context = canvas.getContext("2d");

                /*
                this._debugDraw = new DebugDraw();
                this._debugDraw.SetSprite(this._context);
                this._debugDraw.SetDrawScale(this.ngBox2DSystem.scale);
                this._debugDraw.SetFillAlpha(0.5);
                this._debugDraw.SetLineThickness(1.0);

                this._debugDraw.SetFlags(
                    DebugDraw.e_shapeBit |
                        DebugDraw.e_jointBit |
                        //DebugDraw.e_aabbBit |
//                        DebugDraw.e_pairBit |
                        DebugDraw.e_centerOfMassBit |
                        DebugDraw.e_controllerBit);
                */


                this._debugDraw = customDebugDraw.getCanvasDebugDraw(this._context);
                var flags = 0;
                flags |= e_shapeBit;
                flags |= e_jointBit;
//                flags |= e_aabbBit;
                //flats |= e_pairBit;
                flags |= e_centerOfMassBit;
                this._debugDraw.SetFlags(flags);
                this.ngBox2DSystem._world.SetDebugDraw(this._debugDraw);
            } else {
                this.ngBox2DSystem._world.SetDebugDraw(null);

                if (this._canvasHasCreated) {
                    removeCanvasFromStack(this._canvas);

                    this._canvasHasCreated = false;
                }

                this._canvas = null;

                this._debugDraw = null;
            }
        }
    });


    /**
     * ngBox2DDraggable
     *
     * Draggable subsystem based on ngBox2DSystem. And use it Box2D properties
     * to interact with dragged entity.
     *
     */
    m.$s('ngBox2DDraggable', {
        domId: 'game',

        $require: ['ngPhysic', 'ngDraggable'],

        $added: ['ngBox2DSystem', function(ngBox2DSystem) {
            this.scale = ngBox2DSystem.scale;
            this._invScale = ngBox2DSystem._invScale;

            this._target = document.getElementById(this.domId) || document.body;

            var pos = darlingutil.getElementAbsolutePos(this._target);

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
                var body = ngBox2DSystem.getOneBoyAt(this._mouseX, this._mouseY);
                if(body && body.m_userData && body.m_userData.ngDraggable) {
                    var md = new b2MouseJointDef();
                    md.set_bodyA(ngBox2DSystem.getGroundBody());
                    md.set_bodyB(body);
                    md.set_target(new b2Vec2(this._mouseX, this._mouseY));
                    md.set_collideConnected(true);
                    md.set_maxForce(300.0 * body.GetMass());
                    this._mouseJoint = Box2D.castObject( world.CreateJoint(md), b2MouseJoint);
                    body.SetAwake(true);
                }
            }

            if(this._mouseJoint) {
                if(this._isMouseDown) {
                    this._mouseJoint.SetTarget(new b2Vec2(this._mouseX, this._mouseY));
                } else {
                    world = ngBox2DSystem._world;
                    world.DestroyJoint(this._mouseJoint);
                    this._mouseJoint = null;
                }
            }
        }]
    });


    /**
     *
     */
    m.$s('ngBox2DFixRotation', {
        $require: ['ngFixedRotation', 'ngPhysic'],

        $addNode: function($node) {
            $node.ngPhysic._b2dBody.SetFixedRotation(true);
        },

        $removeNode: function($node) {
            $node.ngPhysic._b2dBody.SetFixedRotation(false);
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
        useRotation: false,
        _actions: {},
        _keyBinding: [],
        _keyBind: function(keyId, action) {
            this._keyBinding[keyId] = action;
            this._actions[action] = false;
        },
        $added: function() {
            this._runImpulse = new b2Vec2();
            this._jumpImpulse = new b2Vec2();
            this._flyImpulse = new b2Vec2();

            this._keyBind(87, 'move-up');
            this._keyBind(65, 'move-left');
            this._keyBind(83, 'move-down');
            this._keyBind(68, 'move-right');

            this._keyBind(37, 'move-left');
            this._keyBind(38, 'move-up');
            this._keyBind(39, 'move-right');
            this._keyBind(40, 'move-down');

            this._target = document.getElementById(this.domId) || document;
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
            this.setUseRotation(this.useRotation);
        },
        setUseRotation: function(value) {
            this.useRotation = value;
            if (this.useRotation) {
                this._move = this._moveByRotation;
            } else {
                this._move = this._moveByImpulse;
            }
        },
        _moveByImpulse: function(body, speed) {
            this._runImpulse.set_x(speed);
            body.SetLinearVelocity(this._runImpulse);
        },
        _moveByRotation: function(body, speed) {
            body.SetAngularVelocity(3 * speed);
        },
        $removed: function() {
            //TODO : stop listening keys
        },
        _stayOnGroundDefined: false,
        _stayOnGround: false,
        //TODO : move to ngBox2dSystem
        _isStayOnGround: function(body, sharpCos) {
            if (this._stayOnGroundDefined) {
                return this._stayOnGround;
            }
            var contactItem = body.GetContactList();
            while(contactItem) {
                var contact = contactItem.get_contact();
                if (contact.IsTouching()) {
                    if (this._isCirclesCollision(contact)) {
                        if (contactItem.get_other().GetPosition().get_y() > body.GetPosition().get_y()) {
                            return true;
                        }
                    } else {
                        var ny;
                        //TODO: !!!!
                        var manifold = contact.GetManifold();
                        var norm = manifold.get_localNormal();
                        var sensor = false;
                        var fixtureA = contact.GetFixtureA();
                        var fixtureB = contact.GetFixtureB();
                        if (fixtureB.GetBody() !== body) {
                            if (fixtureB.IsSensor() ) {
                                sensor = true;
                            }
                            ny = norm.get_y();
                        } else {
                            if (fixtureA.IsSensor() ) {
                                sensor = true;
                            }
                            var angle = fixtureA.GetBody().GetAngle();
                            var sin = Math.sin(angle);
                            var cos = Math.cos(angle);
                            //var nx = cos * norm.x - sin * norm.y;
                            ny = sin * norm.get_x() + cos * norm.get_y();
                        }

                        if (!sensor && ny <= -sharpCos) {
                            this._stayOnSDefined = true;
                            this._stayOnGround = true;
                            return true;
                        }
                    }
                }
                var next = contactItem.get_next();
                if (next !== contactItem) {
                    contactItem = next;
                } else {
                    contactItem = null;
                }

            }
            this._stayOnGroundDefined = true;
            this._stayOnGround = false;
            return false;
        },

        _isCirclesCollision: function(contact) {
            return contact.GetFixtureA().GetShape().GetType() === 0 && contact.GetFixtureB().GetShape().GetType() === 0;
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
            this._jumpImpulse.set_y(-control.jumpSpeed);
            if (this._actions['move-left']) {
                this._jumpImpulse.set_x(-control.runSpeed);
            } else if (this._actions['move-right']) {
                this._jumpImpulse.set_x(control.runSpeed);
            } else {
                this._jumpImpulse.set_x(0.0);
            }

            body.SetLinearVelocity(this._jumpImpulse);
//                    body.SetLinearVelocity(zeroVec2);
//                    body.ApplyImpulse(this._jumpImpulse, body.GetWorldCenter());
        },

        $removeNode: function($node) {
            var body = $node.ngPhysic._b2dBody;
            body.SetAngularVelocity(0);
        },

        $update: ['$node', function($node) {
            this._stayOnGroundDefined = false;
            var body = $node.ngPhysic._b2dBody;
            var control = $node.ngControlPlatformStyle;

            var fixRotation = false;

            if (this._actions['move-up']) {
                if (this._isStayOnGround(body, control.slope)) {
                    this._resetDoubleJump(control);
                    this._jump(body, control);
                } else if (this._justFly) {
                    this._doubleJump($node, body, control);
                    this._justFly = false;
                }
            } else {
                this._justFly = !this._isStayOnGround(body, control.slope);
                if (this._actions['move-left']) {
                    this._setMovingState($node, control, 'ngGoingLeft');
                    this._stayOnGroundDefined = false;
                    if (this._isStayOnGround(body, control.slope)) {
                        this._move(body, -control.runSpeed);
                    } else {
                        this._flyImpulse.set_x(-control.flySpeed);
                        body.ApplyLinearImpulse(this._flyImpulse, body.GetWorldCenter());
                    }
                } else if (this._actions['move-right']) {
                    this._setMovingState($node, control, 'ngGoingRight');
                    if (this._isStayOnGround(body, control.slope)) {
                        this._move(body, control.runSpeed);
                    } else {
                        this._flyImpulse.set_x(control.flySpeed);
                        body.ApplyLinearImpulse(this._flyImpulse, body.GetWorldCenter());
                    }
                } else {
                    fixRotation = true;
                }
            }

            if (fixRotation) {
                body.SetAngularVelocity(0);
                body.SetFixedRotation(true);
            } else {
                body.SetFixedRotation(false);
            }
        }],

        _setMovingState: function($node, control, value) {
            if (control._movingState === value) {
                return;
            }

            control._movingState = value;
            $node.$remove(control._movingState);
            $node.$add(value);
        }
    });


    /**
     * System for locking rotation of physics entities
     */
    m.$s('ngBox2DFixRotation', {
        $require: ['ngFixedRotation', 'ngPhysic'],

        $addNode: function($node) {
            $node.ngPhysic._b2dBody.SetFixedRotation(true);
        },

        $removeNode: function($node) {
            $node.ngPhysic._b2dBody.SetFixedRotation(false);
        }
    });
})(darlingjs, darlingutil);