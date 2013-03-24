(function() {
    'use strict';
    /**
     * Project: GameEngine.
     * Proof of concept v 0.0.0-2
     *
     * Copyright (c) 2013, Eugene-Krevenets
     */

//Define Engine

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
        y: 0.0
    });

    ngModule.$c('ng2DSize', {
        width: 10.0,
        height: 10.0
    });

    ngModule.$c('ngControl', {
        speed: 0.1,
        keys:{ UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180}
    });

    ngModule.$system('ng2DRamble', {
        $require: ['ngRamble', 'ng2D'],
        _updateTarget: function($node) {
            $node.ngRamble._target = {
                x: ($node.ngRamble.frame.right - $node.ngRamble.frame.left) * Math.random() + $node.ngRamble.frame.left,
                y: ($node.ngRamble.frame.bottom - $node.ngRamble.frame.top) * Math.random() + $node.ngRamble.frame.top
            };

            //$node.ngRamble._target = this._normalizePosition($node.ngRamble._target, $node.ngRamble.frame);
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
            if (!$node.ngRamble._target) {
                this._updateTarget($node);
            } else if (this._distanceSqr($node.ng2D, $node.ngRamble._target) < 1) {
                this._updateTarget($node);
            } else {
                var dx = Math.abs($node.ngRamble._target.x - $node.ng2D.x);
                var dy = Math.abs($node.ngRamble._target.y - $node.ng2D.y);
                if (dx > dy) {
                    $node.ng2D.x+= $node.ngRamble._target.x > $node.ng2D.x?1:-1;
                } else {
                    $node.ng2D.y+= $node.ngRamble._target.y > $node.ng2D.y?1:-1;
                }
            }
        }]
    });

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
        targetId: null,
        _target: null,
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
        _speed: {x:0.0, y:0.0},
        _normalize: function(speed) {
            if (speed.x === 0.0 || speed.y === 0.0 ) {
                return speed;
            }

            speed.x *= Math.SQRT1_2;
            speed.y *= Math.SQRT1_2;
        },
        $addNode: function($node) {
            console.log('add control');
        },
        $removeNode: function($node) {
            console.log('remove control');
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

            $node.ng2D.x += speed.x * $time * $node.ngControl.speed;
            $node.ng2D.y += speed.y * $time * $node.ngControl.speed;

            speed.x = 0.0;
            speed.y = 0.0;
        }]
    });

    ngModule.$system('ngDOMSystem', {
        $require: ['ngDOM', 'ng2D'],
        _targetElementID: 'game',
        _target: null,
        _element: null,
        _style: null,
        $added: function() {

            this._target = this.target;
            if (darlingutil.isUndefined(this._target)) {
                this._target = document.getElementById(this.targetId);
            }
        },
        $addNode: function($node) {
            var element = document.createElement("div");
            var style = element.style;
            style.position = 'relative';

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
            var ng2DSize = $node.ng2DSize;
            if (ng2DSize) {
                style.width = ng2DSize.width + 'px';
                style.height = ng2DSize.height + 'px';
            }

            style.backgroundColor = $node.ngDOM.color;
        }]
    });
}) ();
