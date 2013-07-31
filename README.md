darlingjs [![Build Status](https://travis-ci.org/darlingjs/darlingjs.png?branch=master)](https://travis-ci.org/darlingjs/darlingjs)
=========

![Logo](http://darlingjs.github.io/images/logo-oldschool.png)

Lightweight entity, component, system based game engine. With flexible architecture. Decupled from any dependecy. So all interaction with Box2D, Render system, Particle System and so on put in pluggable modules. Use fluent API [Crafty.js](craftyjs.com), [jQUery](http://jquery.com) like.

## Support

* [documentation](http://darlingjs.github.io/docs/)
* [forum](https://plus.google.com/communities/100075954096144611101)

## Examples

* [Game of Pong](http://darlingjs.github.io/games/game-of-pong/) with [sources](https://github.com/darlingjs/darlingjs-examples/blob/master/game-of-pong/);
* [*In Progress* Red Cabrioler](http://darlingjs.github.io/games/cabriolet/) with [sources](https://github.com/darlingjs/darlingjs-examples/tree/master/red-cabriolet/);
* [Repo with other sources](https://github.com/darlingjs/darlingjs-examples/);

## Quick Start

### Creating the World

Create the World for Box2D experiments

``` javascript

var world = darlingjs.world('myGame', [
    //inject some modules

    //get 2D components
    'ngFlatland',

    //get Common Physics components
    'ngPhysics',

    //get Box2D implementation of Physics components
    'ngBox2DEmscripten'
], {
    fps: 60
});

```

*DarlingJS is lightweight framework so it's decoupled from any rendering, physics, sound, assets and so on libraries. And it possible to develop on pure javascript with your own simulation systems.*

*Every darlingjs modules start with prefix 'ng', for example: 'ngPhysics'.*

### Add systems

add physics simulation system

``` javascript
world.$add('ngBox2DSystem', {
    //define gravity of box2d world
    gravity: {
        x: 0,
        y: 9.8
    },

    //define properties of physics simulation
    velocityIterations: 3,    
    positionIterations: 3
});

```

add view port system for definition 2D camera position

``` javascript
world.$add('ng2DViewPort', {
    //centor of the camera
    lookAt: {
        x: width / 2, y: height / 2
    },

    //size of the camera view
    width: width,
    height: height
});
```

add box2d debug draw visualization

``` javascript
world.$add('ngBox2DDebugDraw', {
    //target div/convas element. For div element automaticaly create canvas element and place into the div
    domID: 'gameView', 

    //size of canvas
    width: width, height: height
});
```

add drugging support system. 

```
world.$add('ngBox2DDraggable', { 
    //target div/convas element
    domId: 'gameView', 

    //width, height of it
    width: width, height: height 
});
```

### Create Entity

Create entity of draggable box and add it to the world

``` javascript

darlingjs.$e('box', {
//define position
    ng2D: {
        x: 0.0,
        y: 0.0
    },

//define size of
    ng2DSize: {
        width: 10.0,
        height: 10.0
    },

//mark entity as physics object
    ngPhysics: {},

//mark entity as draggable object
    ngDraggable: {}
});

```

*Here is alternative notation: When you have a lot of components in default state, it useful to count of components by array*

``` javascript

darlingjs.$e('box', ['ng2D', 'ng2DSize', 'ngPhysics', 'ngDraggable']}

```

### Start The Game

To run update of game the world 60 times in second just use:

``` javascript
world.$start();
```

One frame emulation:

``` javascript
world.$update(1/60);
```

### Create custom system with custom component

Create system that automaticaly increase life of any entities with 'ngLife' and 'lifeHealer' components. So you if you want to heal some entity you can just add 'lifeHealer' component to it.

#### Usage

```javascript
//start healing entity

entity.$add('healer');

//stop healing entity

entity.$remove('healer');
```

#### Define component and system

```javascript

//define healer component

world.$c('healer', { 
    power: 0.1,
    maxLife: 100.0
});

//define and add healer system to the game world
//!ATTENTION! in next verstion $node and $nodes will be changed to the $entity and $entities

world.$s('healerSystem', {

    //apply to components:
    $require: ['ngLife', 'healer'],

    //iterate each frame for each entity
    $update: ['$node', function($node) {
        if ($node.ngLife.life <= this.healer.maxLife) {
            //heals entity
            $node.ngLife.life += this.healer.power;
        } else {
            //stop healing when life reach of maxLife
            $node.$remove('healer');
        }
    }]
});

```

## Inspired by

* [AngularJs](http://angularjs.org) - dependecy injections;
* [Ash](http://ashframework.org) - component, entity, system architecture;
* [CraftyJS](http://craftyjs.com) - fluent api;

## Pluggable darlingjs Modules

* 2D Renderering [uses pixi.js](http://www.goodboydigital.com/pixi-js-is-out/);
* Physics [uses emscripted box2d 2.2.1](https://github.com/kripken/box2d.js/) or [box2dweb 2.1a](https://code.google.com/p/box2dweb/);
* Performance (FPS/Mem) metter [uses Stats.js](https://github.com/mrdoob/stats.js);
* Flatland (2D components);
* Generators (systems of procedural generation of infinity world);
* Particles (systems and components for emitting particles);
* Player (components for store player state: score, life);

### Comming soon Modules

* Advanced Particle System;
* AI
* FlashJS, EaselJS Rendering;
* Sound;
* and so on.

## Example of Usage

Game Engine now in active developing and here is just proof of concept.

``` javascript

var world = darlingjs.world('myGame', ['ngModule', 'flatWorld'], {
    fps: 60
});

world.$add('ngDOMSystem', { targetId: 'gameID' });
world.$add('ngFlatControlSystem');
world.$add('ng2DCollisionSystem');

world.$e('player', [
    'ngDOM', { color: 'rgb(255,0,0)' },
    'ng2D', {x : 0, y: 50},
    'ngControl',
    'ngCollision'
]);

for (var i = 0, l = 10; i < l; i++) {
    var fixed = Math.random() > 0.5;
    world.$e('obstacle_' + i, [
        'ngDOM', { color: fixed?'rgb(0, 255, 0)':'rgb(200, 200, 0)'},
        'ng2D', {x : 10 + 80 * Math.random(), y: 10 + 80 * Math.random()},
        'ngCollision', {fixed: fixed}
    ]);
}

world.$e('goblin', [
    'ngDOM', { color: 'rgb(255,0,0)' },
    'ng2D', {x : 99, y: 50},
    'ngRamble', {frame: {
        left: 50, right: 99,
        top: 0, bottom: 99
    }},
    'ngScan', {
        radius: 3,
        target: 'ngPlayer',
        switchTo: {
            e:'ngAttack',
            params: {
                switchTo:'ngRamble'
            }
        }
    },
    'ngCollision'
]);

world.$start();

```

## Create Module


``` javascript

var ngModule = darlingjs.module('ngModule');

ngModule.$c('ngCollision', {
    fixed: false
});

ngModule.$c('ngScan', {
    target: 'ngPlayer'
});

ngModule.$c('ngRamble', {
    frame: {
        left: 0, right: 0,
        top: 0, bottom: 0
    }
});

ngModule.$c('ngPlayer', {
});

ngModule.$c('ngDOM', {
    color: 'rgb(255,0,0)'
});

ngModule.$c('ng2D', {
    x: 0.0,
    y: 0.0,
    width: 10.0,
    height: 10.0
});

ngModule.$c('ngControl', {
    speed: 10,
    keys:{ UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180}
});

ngModule.$system('ng2DRamble', {
    
    $require: ['ngRamble', 'ng2D'],

    _updateTarget: function($node) {
        $node._target = {
            x: 4 * Math.random() - 2,
            y: 4 * Math.random() - 2
        };

        $node._target = this._normalizePosition($node._target, $node.frame);
    },

    _normalizePosition: function(p, frame) {
        if (p.x < frame.left) {
            p.x = frame.left;
        }

        if (p.x > frame.right) {
            p.x = frame.right;
        }

        if (p.y < frame.top) {
            p.y = frame.top;
        }

        if (p.y > frame.bottom) {
            p.y = frame.bottom;
        }
    },
    
    _distanceSqr: function(p1, p2) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        return dx * dx + dy * dy;
    },

    $update: ['$node', function($node) {
        if (!$node._target) {
            this._updateTarget($node);
        } else if (this._distanceSqr($node.ng2D, $node._target) < 1) {
            this._updateTarget($node);
        } else {
            var dx = Math.abs($node._target.x - $node.ng2D.x);
            var dy = Math.abs($node._target.y - $node.ng2D.y);
            if (dx > dy) {
                $node.ng2D.x+= $node._target.x > $node.ng2D.x?1:-1;
            } else {
                $node.ng2D.y+= $node._target.y > $node.ng2D.y?1:-1;
            }
        }
    }]
})

ngModule.$system('ng2DCollisionSystem', {
    
    $require: ['ngCollision', 'ng2D'],
    
    _isLeftCollision: function(p1, p2) {
        return false;
    },
    
    _isRightCollision: function(p1, p2) {
        return false;
    },
    
    _isTopCollision: function(p1, p2) {
        return false;
    },
    
    _isBottomCollision: function(p1, p2) {
        return false;
    },
    
    $update: ['$nodes', function($nodes) {
        //TODO brute-force. just push away after collision
        for (var j = 0, lj = $nodes.length; j < lj; j++) {
            for ( var i = 0, li = $nodes.length; i < li; i++) {
                var node1p = $nodes[i].ng2D;
                var node2p = $nodes[j].ng2D;
                var node1Fixed = $nodes[i].ngCollision.fixed;
                var node2Fixed = $nodes[j].ngCollision.fixed;

                if (this._isLeftCollision(node1p, node2p)) {
                    //TODO shift nodes based on
                    node1Fixed, node2Fixed;
                } else if (this._isRightCollision(node1p, node2p)) {
                    //TODO shift nodes based on
                    node1Fixed, node2Fixed;
                } else if (this._isTopCollision(node1p, node2p)) {
                    //TODO shift nodes based on
                    node1Fixed, node2Fixed;
                } else if (this._isBottomCollision(node1p, node2p)) {
                    //TODO shift nodes based on
                    node1Fixed, node2Fixed;
                }
            }
        }
    }]
});

ngModule.$system('ng2DScan', {
    $require: ['ng2D', 'ngScan'],
    
    $update : ['$nodes', function($nodes) {
        //TODO brute-force. just push away after collision
        for (var j = 0, lj = $nodes.length; j < lj; j++) {
            for ( var i = 0, li = $nodes.length; i < li; i++) {

            }
        }
    }]
})

ngModule.$system('ngControlSystem', {
    $require: ['ng2D', 'ngControl'],
    
    _targetElementID: 'game',
    
    _target:null,
    
    _actions: {},
    
    _keyBinding: [],
    
    _keyBind: function(keyId, action) {
        this._keyBinding[keyId] = action;
        this._actions[action] = false;
    },
    
    $added: function() {
        this._keyBind(87, 'move-up');
        this._keyBind(65, 'move-left');
        this._keyBind(83, 'move-down');
        this._keyBind(68, 'move-right');

        this._target = document.getElementById(this._targetElementID);
        var self = this;
        this._target.addEventListener('keydown', function(e) {
            var action = self._keyBinding[e.keyID];
            if (action) {
                self._actions[action] = true;
            }
        });
        this._target.addEventListener('keyup', function(e) {
            var action = self._keyBinding[e.keyID];
            if (action) {
                self._actions[action] = false;
            }
        });
    },
    _speed: {x:0.0, y:0.0},
    _normalize: function(speed) {
        //TODO : ...
    },
    
    $update: ['$node', '$time', '$world', function($node, $time, $world) {
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

        $node.ng2D.x += speed.x * $time * $world.fps;
        $node.ng2D.y += speed.y * $time * $world.fps;
    }]
});

ngModule.$system('ngDOMSystem', {
    _targetElementID: 'game',
    
    _target: null,
    
    _element: null,
    
    _style: null,
    
    $require: ['ngDOM', 'ng2D'],
    
    $added: function() {
        if (this.target === null && this.targetId !== null) {
            this.target = document.getElementById(this.targetId);
        }
    },
    
    $addNode: function($node) {
        var element = document.createElement("div");
        var style = element.style;

        style.position = "absolute";

        $node._style = style;
        $node._element = element;
        this._target.appendChild(element);
    },
    
    $removeNode: function($node) {
        //TODO:
        this._target.removeChild($node._element);
    },
    
    $update: ['$node', function($node) {
        var style = $node._style;
        style.left = $node.ng2D.x + 'px';
        style.top = $node.ng2D.y + 'px';
    }]
});

```

## Copyrights

Logo by Alena Krevenets (Burenka) <http://burenkaz.daportfolio.com/>
