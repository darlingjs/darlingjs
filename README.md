darlingjs [![Build Status](https://travis-ci.org/Hyzhak/darlingjs.png?branch=master)](https://travis-ci.org/Hyzhak/darlingjs)
=========


Quick and Dirty Entity Game Engine.

Create Module
=============

``` javascript

var ngModule = GameEngine.module('ngModule');

ngModule.c('ngCollision', {
    fixed: false
});

ngModule.c('ngScan', {
    target: 'ngPlayer'
});

ngModule.c('ngRamble', {
    frame: {
        left: 0, right: 0,
        top: 0, bottom: 0
    }
});

ngModule.c('ngPlayer', {
});

ngModule.c('ngDOM', {
    color: 'rgb(255,0,0)'
});

ngModule.c('ng2D', {
    x: 0.0,
    y: 0.0,
    width: 10.0,
    height: 10.0
});

ngModule.c('ngControl', {
    speed: 10,
    keys:{ UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180}
});

ngModule.system('ng2DRamble', {
    require: ['ngRamble', 'ng2D'],
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
    update: function($node) {
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
    }
})

ngModule.system('ng2DCollisionSystem', {
    require: ['ngCollision', 'ng2D'],
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
    update: function($nodes) {
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
    }
});

ngModule.system('ng2DScan', {
    require: ['ng2D', 'ngScan'],
    update : function($nodes) {
        //TODO brute-force. just push away after collision
        for (var j = 0, lj = $nodes.length; j < lj; j++) {
            for ( var i = 0, li = $nodes.length; i < li; i++) {

            }
        }
    }
})

ngModule.system('ngControlSystem', {
    require: ['ng2D', 'ngControl'],
    _targetElementID: 'game',
    _target:null,
    _actions: {},
    _keyBinding: [],
    _keyBind: function(keyId, action) {
        this._keyBinding[keyId] = action;
        this._actions[action] = false;
    },
    init: function() {
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
    update: function($node, $time, $world) {
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
    }
});

ngModule.system('ngDOMSystem', {
    _targetElementID: 'game',
    _target: null,
    _element: null,
    _style: null,
    require: ['ngDOM', 'ng2D'],
    init: function($config) {
        $config = $config | {};

        this._target = $config.target;
        if (this._target == null) {
            this._target = document.getElementById($config.targetId);
        }
    },
    addNode: function($node) {
        var element = document.createElement("div");
        var style = element.style;

        style.position = "absolute";

        $node._style = style;
        $node._element = element;
        this._target.appendChild(element);
    },
    removeNode: function($node) {
        //TODO:
        this._target.removeChild($node._element);
    },
    update: function($node) {
        var style = $node._style;
        style.left = $node.ng2D.x + 'px';
        style.top = $node.ng2D.y + 'px';
    }
});

```

Usage
=====

``` javascript

var world = GameEngine.world('myGame', ['ngModule', 'flatWorld']);
world.config({
    fps: 60
});

world.add('ngDOMSystem', { targetId: 'gameID' });
world.add('ngFlatControlSystem');
world.add('ng2DCollisionSystem');

world.add(world.e('player', [
    'ngDOM', { color: 'rgb(255,0,0)' },
    'ng2D', {x : 0, y: 50},
    'ngControl',
    'ngCollision'
]));

for (var i = 0, l = 10; i < l; i++) {
    var fixed = Math.random() > 0.5;
    world.add(world.e('obstacle_' + i, [
        'ngDOM', { color: fixed?'rgb(0, 255, 0)':'rgb(200, 200, 0)'},
        'ng2D', {x : 10 + 80 * Math.random(), y: 10 + 80 * Math.random()},
        'ngCollision', {fixed: fixed}
    ]));
}

world.add(world.e('goblin', [
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
]));

world.start();

```