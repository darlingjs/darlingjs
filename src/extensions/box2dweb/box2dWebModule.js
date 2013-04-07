/**
 * Project: DarlingJS Game Engine
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {
    'use strict';

    var m = darlingjs.module('ngBox2D');

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
    var DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
    var PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
    var MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

    var zeroVec2 = new Vec2();

    /**
     * ngBox2DRevoluteJoint
     *
     * Subsystem for emulate revolute joint
     *
     */
    m.$s('ngBox2DRevoluteJoint', {
        $require: ['ngRevoluteJoint', 'ng2D'],

        $addNode: ['$node', 'ngBox2DSystem', function($node, ngBox2DSystem) {
            var jointState = $node.ngRevoluteJoint;
            var ng2D = $node.ng2D;

            var bodyA, bodyB;

            var x = ngBox2DSystem._invScale * ng2D.x,
                y = ngBox2DSystem._invScale * ng2D.y;

            var entities = ngBox2DSystem.getBodiesAt(x, y);

            switch (entities.length) {
                case 0:
                    throw new Error('Can\'t add revolute joint without jointed bodies');
                    break;
                case 1:
                    bodyA = entities[0];
                    bodyB = ngBox2DSystem._world.GetGroundBody();
                    break;
                default:
                    bodyA = entities[0];
                    bodyB = entities[1];
                    break;
            }

            var jointDef = new RevoluteJointDef();
            jointDef.Initialize(bodyA, bodyB, new Vec2(x, y));

            jointDef.lowerAngle = jointState.lowerAngle;
            jointDef.upperAngle = jointState.upperAngle;
            jointDef.enableLimit = jointState.enableLimit;

            jointDef.maxMotorTorque = jointState.maxMotorTorque;
            jointDef.motorSpeed = jointState.motorSpeed;
            jointDef.enableMotor = jointState.enableMotor;

            jointState._joint = ngBox2DSystem.createJoint(jointDef);
        }]
    });

    /**
     * ngBox2DDistanceJoint
     *
     * Distance Joint
     *
     * One of the simplest joint is a distance joint which says that the distance between two points on two bodies must be constant. When you specify a distance joint the two bodies should already be in place. Then you specify the two anchor points in world coordinates. The first anchor point is connected to body 1, and the second anchor point is connected to body 2. These points imply the length of the distance constraint.
     *
     */
    m.$s('ngBox2DDistanceJoint', {
        $require: ['ngDistanceJoint'],

        $addNode: ['$node', 'ngBox2DSystem', function($node, box2DSystem) {
            var jointState = $node.ngDistanceJoint;
            var anchorA = new Vec2(box2DSystem._invScale * jointState.anchorA.x, box2DSystem._invScale * jointState.anchorA.y);
            var anchorB = new Vec2(box2DSystem._invScale * jointState.anchorB.x, box2DSystem._invScale * jointState.anchorB.y);
            var bodyA, bodyB;

            if (jointState.bodyA) {
                bodyA = jointState.bodyA;
            } else {
                bodyA = box2DSystem.getBodiesAt(anchorA.x, anchorA.y)[0];
                if (!bodyA) {
                    bodyA = box2DSystem._world.GetGroundBody();
                }
            }

            if (jointState.bodyB) {
                bodyB = jointState.bodyB;
            } else {
                bodyB = box2DSystem.getBodiesAt(anchorB.x, anchorB.y)[0];
                if (!bodyB) {
                    bodyA = box2DSystem._world.GetGroundBody();
                }
            }

            var jointDef = new DistanceJointDef();
            jointDef.Initialize(bodyA, bodyB, anchorA, anchorB);
            jointDef.collideConnected = jointState.collideConnected;
            jointDef.frequencyHz = jointState.frequencyHz;
            jointDef.dampingRatio = jointState.dampingRatio;
            jointState._joint = box2DSystem.createJoint(jointDef);
        }]
    });

    /**
     * ngBox2DDistanceJoint
     *
     * Prismatic Joint
     *
     * A prismatic joint allows for relative translation of two bodies along a specified axis. A prismatic joint prevents relative rotation. Therefore, a prismatic joint has a single degree of freedom.
     *
     */
    m.$s('ngBox2DPrismaticJoint', {
        $require: ['ngPrismaticJoint'],

        $addNode: ['$node', 'ngBox2DSystem', function($node, box2DSystem) {
            var jointState = $node.ngPrismaticJoint;
            var anchorA = new Vec2(box2DSystem._invScale * jointState.anchorA.x, box2DSystem._invScale * jointState.anchorA.y);
            var anchorB = new Vec2(box2DSystem._invScale * jointState.anchorB.x, box2DSystem._invScale * jointState.anchorB.y);
            var axis = new Vec2(
                anchorB.x - anchorA.x,
                anchorB.y - anchorA.y
            );
            var bodyA, bodyB;

            if (jointState.bodyA) {
                bodyA = jointState.bodyA;
            } else {
                bodyA = box2DSystem.getBodiesAt(anchorA.x, anchorA.y)[0];
                if (!bodyA) {
                    bodyA = box2DSystem._world.GetGroundBody();
                }
            }

            if (jointState.bodyB) {
                bodyB = jointState.bodyB;
            } else {
                bodyB = box2DSystem.getBodiesAt(anchorB.x, anchorB.y)[0];
                if (!bodyB) {
                    bodyB = box2DSystem._world.GetGroundBody();
                }
            }

            var jointDef = new PrismaticJointDef();
            jointDef.Initialize(bodyA, bodyB, anchorA, axis);
            jointDef.localAnchorA = bodyA.GetLocalPoint(anchorA);
            jointDef.localAnchorB = bodyB.GetLocalPoint(anchorB);

            jointDef.collideConnected = false;
            jointDef.lowerTranslation = 0.0;
            jointDef.upperTranslation = 5.0;
            jointDef.enableLimit = true;
            jointDef.maxMotorForce = 50.0;
            jointDef.motorSpeed = 5.0;
            jointDef.enableMotor = false;

            jointState._joint = box2DSystem.createJoint(jointDef);
        }]
    });

    m.$s('ngBox2DEnableMotorSystem', {
        $require: ['ngEnableMotor'],

        $addNode: function($node) {
            var joint;
            if ($node.ngPrismaticJoint) {
                joint = $node.ngPrismaticJoint._joint;
            }

            if (joint) {
                joint.EnableMotor(true);
            }
        },

        $removeNode: function($node) {
            var joint;
            if ($node.ngPrismaticJoint) {
                joint = $node.ngPrismaticJoint._joint;
            }

            if (joint) {
                joint.EnableMotor(false);
            }
        }
    });

    /**
     *
     */

    m.$s('ngBox2DSensorSystem', {
        $require: ['ngSensorAny', 'ngPhysic'],

        $addNode: function($node) {
            var physic = $node.ngPhysic;
            var body = physic._b2dBody;
            var fixture = body.GetFixtureList();
            while(fixture) {
                fixture.SetSensor(true);
                fixture = fixture.GetNext();
            }
        },

        $removeNode: function($node) {
            var physic = $node.ngPhysic;
            var body = physic._b2dBody;
            var fixture = body.GetFixtureList();
            while(fixture) {
                fixture.SetSensor(false);
                fixture = fixture.GetNext();
            }
        },

        $update: ['$node', function($node) {
            var physic = $node.ngPhysic;
            var body = physic._b2dBody;
            var edge = body.GetContactList();

            var touched = false;

            while(edge) {
                if (edge.contact.IsTouching()) {
                    touched = true;
                    break;
                }
                edge = edge.next;
            }

            if (touched) {
                if (!$node.ngSensorDetectEntity) {
                    $node.$add('ngSensorAnyDetectOneEntity');
                }
            } else {
                $node.$remove('ngSensorAnyDetectOneEntity');
            }
        }]
    });

    m.$c('ngBox2DEnableMotorOnSensor', {
        targetId: null
    });

    m.$c('ngEnableMotor', {});

    m.$s('ngBox2DEnableMotorOnSensor', {
        $require: ['ngSensorAnyDetectOneEntity', 'ngBox2DEnableMotorOnSensor'],

        $addNode: ['$node', '$world', function($node, $world) {
            var entity = $world.$getByName($node.ngBox2DEnableMotorOnSensor.targetId);
            $node.ngBox2DEnableMotorOnSensor.targetEntity = entity;
            if (!entity.$has('ngEnableMotor')) {
                entity.$add('ngEnableMotor');
            }
        }],

        $removeNode: function($node) {
            var entity = $node.ngBox2DEnableMotorOnSensor.targetEntity;
            if (entity) {
                entity.$remove('ngEnableMotor');
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

            this._target = document.getElementById(this.domId) || document;

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
            this._runImpulse.x = speed;
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
            var contactItem = body.m_contactList;
            while(contactItem) {
                var contact = contactItem.contact;
                if (contact.IsTouching()) {
                    if (this._isCirclesCollision(contact)) {
                        if (contactItem.other.GetPosition().y > body.GetPosition().y) {
                            return true;
                        }
                    } else {
                        var ny;
                        var norm = contactItem.contact.m_manifold.m_localPlaneNormal;
                        var sensor = false;

                        if (contactItem.contact.m_fixtureB.m_body !== body) {
                            if (contactItem.contact.m_fixtureB.IsSensor() ) {
                                sensor = true;
                            }
                            ny = norm.y;
                        } else {
                            if (contactItem.contact.m_fixtureA.IsSensor() ) {
                                sensor = true;
                            }
                            var angle = contactItem.contact.m_fixtureA.m_body.GetAngle();
                            var sin = Math.sin(angle);
                            var cos = Math.cos(angle);
                            //var nx = cos * norm.x - sin * norm.y;
                            ny = sin * norm.x + cos * norm.y;
                        }

                        if (!sensor && ny <= -sharpCos) {
                            this._stayOnSDefined = true;
                            this._stayOnGround = true;
                            return true;
                        }
                    }
                }
                contactItem = contactItem.next;
            }
            this._stayOnGroundDefined = true;
            this._stayOnGround = false;
            return false;
        },

        _isCirclesCollision: function(contact) {
            var norm = contact.m_manifold.m_localPlaneNormal;
            return norm.x === 0.0 && norm.x === 0.0 && contact.m_fixtureA.m_shape.m_type === 0 && contact.m_fixtureB.m_shape.m_type === 0;
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
                        this._flyImpulse.x = -control.flySpeed;
                        body.ApplyImpulse(this._flyImpulse, body.GetWorldCenter());
                    }
                } else if (this._actions['move-right']) {
                    this._setMovingState($node, control, 'ngGoingRight');
                    if (this._isStayOnGround(body, control.slope)) {
                        this._move(body, control.runSpeed);
                    } else {
                        this._flyImpulse.x = control.flySpeed;
                        body.ApplyImpulse(this._flyImpulse, body.GetWorldCenter());
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
 * Box2D Debug Draw System
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
            var centerX = 300;
            var centerY = 300;
            //context.translate(centerX -ng2DViewPort.lookAt.x, centerY -ng2DViewPort.lookAt.y);
            //context.scale(0.4,0.4);
            this.ngBox2DSystem._world.DrawDebugData();
            context.restore();
        }],

        showDebugDrawVisible: function(visible) {
            if (this._debugDrawVisible === visible) {
                return;
            }

            this._debugDrawVisible = visible;

            if (this._debugDrawVisible) {
                this._debugDraw = new DebugDraw();

                var canvas = darlingutil.getCanvas(this.domID);

                if (canvas === null) {
                    canvas = darlingutil.placeCanvasInStack(this.domID, this.width, this.height);
                    this._canvasHasCreated = true;
                }

                this._canvas = canvas;
                this._context = canvas.getContext("2d");

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

    m.$s('ngBox2DLeftHanded', {
        $require: ['ng2D', 'ngPhysic', 'ngGoingLeft'],

        $addNode: function($node) {
            var axis = $node.ng2D.x;
            //TODO : mirror physics by axis
        },

        $removeNode: function($node) {

        }
    });

    m.$s('ngBox2DRightHanded', {
        $require: ['ng2D', 'ngPhysic', 'ngGoingRight'],

        $addNode: function($node) {

        },

        $removeNode: function($node) {

        }
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
        allowSleep: true,
        velocityIterations: 10,
        positionIterations: 10,

        _invScale: 1.0,

        _world: null,

        $require: ['ng2D', 'ngPhysic'],

        $added: function() {
            this._invScale = 1/this.scale;
            this._world = new World(
                new Vec2(this.gravity.x, this.gravity.y), // Gravity vector
                !this.allowSleep // Don't allow sleep
            );
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
            var ng2DPolygon = $node.ng2DPolygon;

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
            } else if (darlingutil.isDefined(ng2DPolygon)) {
                var vertexes = new Vector();
                for (var vertexIndex = 0, vertexCount = ng2DPolygon.line.length; vertexIndex < vertexCount; vertexIndex++) {
                    var point = ng2DPolygon.line[vertexIndex];
                    vertexes.push(new Vec2(point.x * this._invScale, point.y * this._invScale));
                }
                fixDef.shape = new PolygonShape();
                fixDef.shape.SetAsVector(vertexes, ng2DPolygon.line.length);
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
            bodyDef.fixedRotation = ngPhysic.fixedRotation;

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
            ng2D.x = pos.x * 30; // FIXME : this.scale;
            ng2D.y = pos.y * 30; // FIXME : this.scale;

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

})(darlingjs, darlingutil);