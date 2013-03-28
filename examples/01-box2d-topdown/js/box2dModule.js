/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

//(function() {
    'use strict';

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

    var m = darlingjs.module('ngBox2D');
    m.$c('ngPhysic', {
        type: 'dynamic', //static
        restitution: 0.5,
        friction: 0.1,
        density: 1.0
    });

//    m.$s('ngBox2DRollingControl', {
    m.$s('ngBox2DLinearControl', {
        $require: ['ngControl', 'ngPhysic'],
        _actions: {},
        _keyBinding: [],
        _keyBind: function(keyId, action) {
            this._keyBinding[keyId] = action;
            this._actions[action] = false;
        },
        $added: function() {
            this._speed = new Vec2();
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
        $update: ['$node', function($node) {
            var speed = this._speed;

            if (this._actions['move-up']) {
                speed.y = -1.0;
            }
            if (this._actions['move-down']) {
                speed.y = +1.0;
            }
            if (this._actions['move-left']) {
                speed.x = -1.0;
            }
            if (this._actions['move-right']) {
                speed.x = +1.0;
            }

            this._normalize(speed);

            speed.x *= $node.ngControl.speed;
            speed.y *= $node.ngControl.speed;

            $node.ngPhysic._b2dBody.SetLinearVelocity(speed);

            speed.x = 0.0;
            speed.y = 0.0;
        }],
        _speed: new Vec2(),
        _normalize: function(speed) {
            if (speed.x === 0.0 || speed.y === 0.0 ) {
                return speed;
            }

            speed.x *= Math.SQRT1_2;
            speed.y *= Math.SQRT1_2;
        }
    });

    m.$s('ngBox2DSystem', {
        gravity: {x:0.0, y:0.0},
        PHYSICS_LOOP_HZ: 1.0 / 60.0,
        scale: 0.5,
        _invScale: 1.0,

        useDebugDraw: true,
        domID: 'game',

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

            var fixDef = new FixtureDef();
            if (darlingutil.isDefined(ng2DSize)) {
                fixDef.shape = new PolygonShape();
                fixDef.shape.SetAsBox(0.5 * ng2DSize.width * this._invScale, 0.5 * ng2DSize.height * this._invScale);
            } else {
                //TODO : other shapes
                fixDef.shape = new PolygonShape();
                fixDef.shape.SetAsBox(10, 10);
            }

            fixDef.restitution = ngPhysic.restitution;
            fixDef.friction = ngPhysic.friction;
            fixDef.density = ngPhysic.density;

            var bodyDef = new BodyDef();
            if (ngPhysic.type === 'static') {
                bodyDef.type = Body.b2_staticBody;
            } else {
                bodyDef.type = Body.b2_dynamicBody;
            }

            bodyDef.position.Set(ng2D.x * this._invScale, ng2D.y * this._invScale);
            bodyDef.angle = 0;

            //fixDef.filter.categoryBits   = 0x0002;
            //fixDef.filter.maskBits       = 0x0001;

            ngPhysic._b2dBody = this._world.CreateBody(bodyDef);
            ngPhysic._b2dBody.CreateFixture(fixDef);
            ngPhysic._b2dBody.m_userDara = $node;
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
                10,                 //velocity iterations
                10                  //position iterations
            );
            if (this._debugDrawVisible) {
                this._world.DrawDebugData();
            }
            $nodes.forEach(this.$$updateNodePosition);
            this._world.ClearForces();
        }],

        $$updateNodePosition: function($node) {
            var pos = $node.ngPhysic._b2dBody.GetPosition();
            $node.ng2D.x = pos.x;
            $node.ng2D.y = pos.y;
        },

        debugDraw: function(visible) {
            if (this._debugDrawVisible === visible) {
                return;
            }

            this._debugDrawVisible = visible;

            if (this._debugDrawVisible) {
                this._debugDraw = new DebugDraw();
                var domElement = document.getElementById(this.domID);
                if (domElement === null) {
                    throw new Error('Can\'t show debug draw because there is no any "' + this.domID + '" DOM elements.');
                }
                this._debugDraw.SetFlags(DebugDraw.e_shapeBit | DebugDraw.e_jointBit);
                this._debugDraw.SetSprite(domElement.getContext("2d"));
                this._world.SetDebugDraw(this._debugDraw);
            } else {
                this._world.SetDebugDraw(null);
                this._debugDraw = null;
            }
        }
    });
//})();