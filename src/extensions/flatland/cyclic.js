/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {
    'use strict';

    var m = darlingjs.m('ngCyclic');

    var pools = {};

    var cyclicConfig = {
        marker: {
            ngMarkIfOutsideOfTheViewPort: {
                handler: function($entity, leftEdge, rightEdge) {
                    var pool = pools[$entity.ngCyclic.group];
                    if (leftEdge) {
                        //go right
                        var rightEntity = getTheRightMost(pool);
                        $entity.ng3D.x = rightEntity.ng3D.x + $entity.ng3DSize.width;
                        $entity.$add('ngMarkIfInsideOfTheViewPort', cyclicConfig);
                    } else if (rightEdge) {
                        //go left
                        var leftEntity = getTheLeftMost(pool);
                        $entity.ng3D.x = leftEntity.ng3D.x - $entity.ng3DSize.width;
                        $entity.$add('ngMarkIfInsideOfTheViewPort', cyclicConfig);
                    }
                }
            }
        }
    };

    function getTheLeftMost(list) {
        var left = Number.MAX_VALUE,
            leftEntity;

        var node = list.$head;
        while(node) {
            var entity = node.instance;
            var x = entity.ng3D.x;
            if (left > x) {
                left = x;
                leftEntity = entity;
            }
            node = node.$next;
        }

        return leftEntity;
    }

    function getTheRightMost(list) {
        var right = -Number.MAX_VALUE,
            rightEntity;
        var node = list.$head;
        while(node) {
            var entity = node.instance;
            var x = entity.ng3D.x;
            if (right < x) {
                right = x;
                rightEntity = entity;
            }
            node = node.$next;
        }

        return rightEntity;
    }

    m.$c('ngCyclic', {
        group: 'mountains',

        step: {
            width: 100.0,
            height: 100.0
        },

        leftRight: true,
        topBottom: true
    });

    m.$s('ngCyclic3DLayer', {
        $require: ['ngCyclic', 'ng3D'],

        $addEntity: ['$entity', function($entity) {
            var pool = pools[$entity.ngCyclic.group];
            if (!pool) {
                pool = new darlingutil.List('ngCyclic_' + $entity.ngCyclic.group + '_group');
                pools[$entity.ngCyclic.group] = pool;
            }
            pool.add($entity);

            $entity.$add('ngMarkIfInsideOfTheViewPort', cyclicConfig);
        }],

        $removeEntity: ['$entity', function($entity) {
            pools[$entity.ngCyclic.group].remove($entity);
        }]
    });

})(darlingjs, darlingutil);