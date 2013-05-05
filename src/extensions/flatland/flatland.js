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

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPort', {
        shift: {dx: 0.0, dy:0.0},
        handler: null,
        marker: null,
        autoRemove: true
    });

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPort', {
        shift: {dx: 0.0, dy:0.0},
        handler: null,
        marker: null,
        autoRemove: true
    });

    m.$s('ngMarkIfOutsideOfTheViewPort', {
        $require: ['ng2D', 'ng2DSize', 'ngMarkIfOutsideOfTheViewPort'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var x = $entity.ng2D.x + $entity.ngMarkIfOutsideOfTheViewPort.shift.dx,
                y = $entity.ng2D.y + $entity.ngMarkIfOutsideOfTheViewPort.shift.dy,
                viewPortWidth = 0.5 * ng2DViewPort.width,
                viewPortHeight = 0.5 * ng2DViewPort.height;


            if (ng2DViewPort.lookAt.x + viewPortWidth < x ||
                ng2DViewPort.lookAt.y + viewPortHeight < y ||
                x + $entity.ng2DSize.width < ng2DViewPort.lookAt.x - viewPortWidth ||
                y + $entity.ng2DSize.height < ng2DViewPort.lookAt.y - viewPortHeight) {

                var handler = $entity.ngMarkIfOutsideOfTheViewPort.handler;
                applyMarker($entity, $entity.ngMarkIfOutsideOfTheViewPort.marker);
                if ($entity.ngMarkIfOutsideOfTheViewPort.autoRemove) {
                    $entity.$remove('ngMarkIfOutsideOfTheViewPort');
                }
                callIfHasHandler(handler, $entity);
            }
        }]
    });

    m.$s('ngMarkIfInsideOfTheViewPort', {
        $require: ['ng2D', 'ng2DSize', 'ngMarkIfInsideOfTheViewPort'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var x = $entity.ng2D.x + $entity.ngMarkIfInsideOfTheViewPort.shift.dx,
                y = $entity.ng2D.y + $entity.ngMarkIfInsideOfTheViewPort.shift.dy,
                viewPortWidth = 0.5 * ng2DViewPort.width,
                viewPortHeight = 0.5 * ng2DViewPort.height;

            if (ng2DViewPort.lookAt.x + viewPortWidth >= x &&
                ng2DViewPort.lookAt.y + viewPortHeight >= y &&
                x + $entity.ng2DSize.width >= ng2DViewPort.lookAt.x - viewPortWidth &&
                y + $entity.ng2DSize.height >= ng2DViewPort.lookAt.y - viewPortHeight) {

                applyMarker($entity, $entity.ngMarkIfInsideOfTheViewPort.marker);

                var handler = $entity.ngMarkIfInsideOfTheViewPort.handler;
                if ($entity.ngMarkIfInsideOfTheViewPort.autoRemove) {
                    $entity.$remove('ngMarkIfInsideOfTheViewPort');
                }
                callIfHasHandler(handler, $entity);
            }
        }]
    });

    function callIfHasHandler(handler, $entity) {
        if (handler) {
            handler($entity);
        }
    }

    function applyMarker($entity, marker) {
        if (darlingutil.isString(marker)) {
            if (!$entity[marker]) {
                $entity.$add(marker);
            }
        } else if (darlingutil.isObject(marker)) {
            for (var key in marker) {
                if (!$entity[key]) {
                    $entity.$add(key, marker[key]);
                }
            }
        }
    }

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