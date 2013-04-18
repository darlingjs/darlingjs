/**
 * Project: DarlingJS
 *
 * Flatland Extensions (2D).
 * Inspired by http://en.wikipedia.org/wiki/Flatland
 *
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngFlatland');

    m.$c('ng2D', {
        x: 0.0,
        y: 0.0
    });

    m.$c('ng2DSize', {
        width: 10.0,
        height: 10.0
    });

    m.$c('ng2DRotation', {
        rotation: 0.0
    });

    m.$c('ng2DCircle', {
        radius: 10.0
    });

    m.$c('ng2DPolygon', {
        line: null
    });

    //Markers or State in FiniteStateMachine
    m.$c('ngGoingLeft', {});
    m.$c('ngGoingRight', {});

    //Service
    m.$s('ng2DViewPort', {
        lookAt: {x:0.0, y:0.0},
        width: 640,
        height: 480
    });

    /**
     * Marker for elements that doesn't influenced by the viewPort
     */
    m.$c('ngLockViewPort');

    m.$c('ngParallax', {
        basis: 0.5
    });

    /**
     * Component of moving entity. Can be used in any dimension
     */
    m.$c('ngMove', {
    });

    m.$s('ng2DMovingSystem', {
        $require: ['ng2D', 'ngMove'],

        $update: ['$node', '$time', function($node, $time) {
            $node.ngMove.dx = $node.ngMove.dx || 0.0;
            $node.ngMove.dy = $node.ngMove.dy || 0.0;

            $node.ng2D.x += 0.001 * $node.ngMove.dx * $time;
            $node.ng2D.y += 0.001 * $node.ngMove.dy * $time;
        }]
    });
})(darlingjs);