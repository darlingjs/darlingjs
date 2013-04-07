/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';
    var m = darlingjs.module('ngBox2DEmscripten');

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
                //context.scale(this.ngBox2DSystem.scale, this.ngBox2DSystem.scale);

                //black background
                context.fillStyle = 'rgb(0,0,0)';
                context.fillRect( 0, 0, this.width, this.height );

                customDebugDraw.drawAxes(context);

                var centerX = 300;
                var centerY = 300;
                //context.translate(centerX -ng2DViewPort.lookAt.x, centerY -ng2DViewPort.lookAt.y);
                this.ngBox2DSystem._world.DrawDebugData();

            context.restore();
        }],

        showDebugDrawVisible: function(visible) {
            if (this._debugDrawVisible === visible) {
                return;
            }

            this._debugDrawVisible = visible;

            if (this._debugDrawVisible) {
                var canvas = getCanvas(this.domID);

                if (canvas === null) {
                    canvas = placeCanvasInStack(this.domID, this.width, this.height);
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


                this._debugDraw = customDebugDraw.getCanvasDebugDraw(this._context, this.ngBox2DSystem.scale);
                this._debugDraw.SetFlags(e_shapeBit);
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
})(darlingjs);