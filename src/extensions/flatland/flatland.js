/**
 * Project: DarlingJS
 *
 * Flatland Extensions (2D).
 * Inspired by http://en.wikipedia.org/wiki/Flatland
 *
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {
    'use strict';

    var m = darlingjs.module('ngFlatland');

    /**
     * Component describe position in 2D environment
     */
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
    m.$c('ngLockViewPort', {
        lockX: true,
        lockY: true
    });

    /**
     * Component of moving entity. Can be used in any dimension.
     */
    m.$c('ngShiftMove', {
    });

    m.$s('ng2DShiftMovingSystem', {
        $require: ['ng2D', 'ngShiftMove'],

        $addEntity : function($entity) {
            $entity.ngShiftMove.dx = $entity.ngShiftMove.dx || 0.0;
            $entity.ngShiftMove.dy = $entity.ngShiftMove.dy || 0.0;
        },

        $update: ['$entity', '$time', function($entity, $time) {
            $entity.ng2D.x += 0.001 * $entity.ngShiftMove.dx * $time;
            $entity.ng2D.y += 0.001 * $entity.ngShiftMove.dy * $time;
        }]
    });
})(darlingjs, darlingutil);