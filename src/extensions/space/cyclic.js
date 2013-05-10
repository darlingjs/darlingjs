/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

/**
 *
 * @description Implementation of Cyclic pattern in 2D and 3D enviropment
 *
 */
(function(darlingjs, darlingutil) {
    'use strict';

    var m = darlingjs.m('ngCyclic');

    /**
     * Marker for entity with cyclic pattern behaviour
     */
    m.$c('ngCyclic', {
        /**
         * PatternWidth, if value <= 0.0 that pattern doesn't cyclic in that direction
         */
        patternWidth: 0.0,
        /**
         * PatternHeight, if value <= 0.0 that pattern doesn't cyclic in that direction
         */
        patternHeight: 0.0
    });

    /**
     * 2D Implementation
     */

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortVertical2D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes outside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortHorizontal2D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes outside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortVertical2D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes inside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortHorizontal2D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes inside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    /**
     * System that implement 2D cyclic layer
     */
    m.$s('ng2DCyclicLayer', {
        $require: ['ngCyclic', 'ng2D'],

        $addEntity: ['$entity', function($entity) {
            if ($entity.ngCyclic.patternWidth) {
                insideConfigHorizontal2D.minWidth = $entity.ngCyclic.patternWidth;
                $entity.$add('ngMarkIfInsideOfTheViewPortHorizontal2D',
                    insideConfigHorizontal2D);
                outsideConfigHorizontal2D.minWidth = $entity.ngCyclic.patternWidth;
                $entity.$add('ngMarkIfOutsideOfTheViewPortHorizontal2D',
                    outsideConfigHorizontal2D);
            }
            if ($entity.ngCyclic.patternHeight) {
                insideConfigVertical2D.minHeight = $entity.ngCyclic.patternHeight;
                $entity.$add('ngMarkIfInsideOfTheViewPortVertical2D',
                    insideConfigVertical2D);
                outsideConfigVertical2D.minHeight = $entity.ngCyclic.patternHeight;
                $entity.$add('ngMarkIfOutsideOfTheViewPortVertical2D',
                    outsideConfigVertical2D);
            }
        }]
    });

    /**
     * Define handler for entity that goes outside
     *
     * @private
     * @ignore
     * @type {{handler: Function}}
     */
    var outsideConfigHorizontal2D = {
        handler: function($entity, lowerEdge, higherEdge) {
            if (lowerEdge) {
                //if goes left place to right side
                $entity.ng2D.x += $entity.ngCyclic.patternWidth;
            } else if (higherEdge) {
                //if goes right place to left side
                $entity.ng2D.x -= $entity.ngCyclic.patternWidth;
            }

            //handle of returning to the viewport
            if (!$entity.ngMarkIfInsideOfTheViewPortHorizontal2D) {
                $entity.$add('ngMarkIfInsideOfTheViewPortHorizontal2D',
                    insideConfigHorizontal2D);
            }

            //stop handling of goes outside
            $entity.$remove('ngMarkIfOutsideOfTheViewPortHorizontal2D');
        }
    };

    /**
     * Define handler for entity that goes outside
     *
     * @private
     * @ignore
     * @type {{handler: Function}}
     */
    var outsideConfigVertical2D = {
        handler: function($entity, lowerEdge, higherEdge) {
            if (lowerEdge) {
                $entity.ng2D.y += $entity.ngCyclic.patternHeight;
            } else if (higherEdge) {
                $entity.ng2D.y -= $entity.ngCyclic.patternHeight;
            }

            //handle of returning to the viewport
            if (!$entity.ngMarkIfInsideOfTheViewPortVertical2D) {
                $entity.$add('ngMarkIfInsideOfTheViewPortVertical2D',
                    insideConfigVertical2D);
            }

            //stop handling of goes outside
            $entity.$remove('ngMarkIfOutsideOfTheViewPortVertical2D');
        }
    };

    /**
     * Start handle again if goes inside of viewPort
     *
     * @private
     * @ignore
     * @type {{marker: {ngMarkIfOutsideOfTheViewPortHorizontal2D: {handler: Function}}}}
     */
    var insideConfigHorizontal2D = {
        marker: {
            ngMarkIfOutsideOfTheViewPortHorizontal2D: outsideConfigHorizontal2D
        }
    };

    /**
     * Start handle again if goes inside of viewPort
     *
     * @private
     * @ignore
     * @type {{marker: {ngMarkIfOutsideOfTheViewPortVertical2D: {handler: Function}}}}
     */
    var insideConfigVertical2D = {
        marker: {
            ngMarkIfOutsideOfTheViewPortVertical2D: outsideConfigVertical2D
        }
    };

    /**
     * System that waits for entity goes outside of viewport in vertical dimension and handle that situation
     */
    m.$s('ngMarkIfOutsideOfTheViewPortVertical2D', {
        $require: ['ng2D', 'ngMarkIfOutsideOfTheViewPortVertical2D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfOutsideOfTheViewPortVertical2D;
            var viewPortHeight = component.viewPortHeight ||
                0.5 * Math.max(ng2DViewPort.height, component.minHeight);
            component.viewPortHeight = viewPortHeight;

            outsideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical2D',
                component,
                $entity.ng2D.y,

                ng2DViewPort.lookAt.y,
                viewPortHeight
            );
        }]
    });

    /**
     * System that waits for entity goes outside of viewport in horizontal dimension and handle that situation
     */
    m.$s('ngMarkIfOutsideOfTheViewPortHorizontal2D', {
        $require: ['ng2D', 'ngMarkIfOutsideOfTheViewPortHorizontal2D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfOutsideOfTheViewPortHorizontal2D;
            var viewPortWidth = component.viewPortWidth ||
                0.5 * Math.max(ng2DViewPort.width, component.minWidth);
            component.viewPortWidth = viewPortWidth;

            outsideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical2D',
                component,
                $entity.ng2D.x,

                ng2DViewPort.lookAt.x,
                viewPortWidth
            );
        }]
    });

    /**
     * System that waits for entity goes inside of viewport in vertical dimension and handle that situation
     */
    m.$s('ngMarkIfInsideOfTheViewPortVertical2D', {
        $require: ['ng2D', 'ngMarkIfInsideOfTheViewPortVertical2D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfInsideOfTheViewPortVertical2D;
            var viewPortHeight = component.viewPortHeight ||
                0.5 * Math.max(ng2DViewPort.height, component.minHeight);
            component.viewPortHeight = viewPortHeight;

            insideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical',
                component,
                $entity.ng2D.y,

                ng2DViewPort.lookAt.y,
                viewPortHeight
            );
        }]
    });

    /**
     * System that waits for entity goes inside of viewport in horizontal dimension and handle that situation
     */
    m.$s('ngMarkIfInsideOfTheViewPortHorizontal2D', {
        $require: ['ng2D', 'ngMarkIfInsideOfTheViewPortHorizontal2D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfInsideOfTheViewPortHorizontal2D;
            var viewPortWidth = component.viewPortWidth ||
                0.5 * Math.max(ng2DViewPort.width, component.minWidth);
            component.viewPortWidth = viewPortWidth;

            insideOf($entity,
                'ngMarkIfInsideOfTheViewPortHorizontal2D',
                component,
                $entity.ng2D.x,

                ng2DViewPort.lookAt.x,
                viewPortWidth
            );
        }]
    });

    /**
     * 3D Implementation
     */

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortVertical3D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes outside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortHorizontal3D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes outside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortVertical3D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes inside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    /**
     * Mark entity by component if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortHorizontal3D', {
        /**
         * handler callback get $entity and top/bottom edge
         */
        handler: null,

        /**
         * apply component-markers for any $entity that goes inside
         * can be {string} name of component, or object with key, value
         * where key is component name, value is config of component
         */
        marker: null,

        /**
         * auto-remove current component
         */
        autoRemove: true
    });

    m.$s('ng3DCyclicLayer', {
        $require: ['ngCyclic', 'ng3D'],

        $addEntity: ['$entity', function($entity) {
            if ($entity.ngCyclic.patternWidth > 0) {
                insideConfigHorizontal3D.minWidth = $entity.ngCyclic.patternWidth;
                $entity.$add('ngMarkIfInsideOfTheViewPortHorizontal3D',
                    insideConfigHorizontal3D);
                outsideConfigHorizontal3D.minWidth = $entity.ngCyclic.patternWidth;
                $entity.$add('ngMarkIfOutsideOfTheViewPortHorizontal3D',
                    outsideConfigHorizontal3D);
            }
            if ($entity.ngCyclic.patternHeight > 0) {
                insideConfigVertical3D.minHeight = $entity.ngCyclic.patternHeight;
                $entity.$add('ngMarkIfInsideOfTheViewPortVertical3D',
                    insideConfigVertical3D);
                outsideConfigVertical3D.minHeight = $entity.ngCyclic.patternHeight;
                $entity.$add('ngMarkIfOutsideOfTheViewPortVertical3D',
                    outsideConfigVertical3D);
            }
        }]
    });

    var outsideConfigHorizontal3D = {
        handler: function($entity, lowerEdge, higherEdge) {
            if (lowerEdge) {
                $entity.ng3D.x += $entity.ngCyclic.patternWidth;
            } else if (higherEdge) {
                $entity.ng3D.x -= $entity.ngCyclic.patternWidth;
            }

            if (!$entity.ngMarkIfInsideOfTheViewPortHorizontal3D) {
                $entity.$add('ngMarkIfInsideOfTheViewPortHorizontal3D',
                    insideConfigHorizontal3D);
            }

            $entity.$remove('ngMarkIfOutsideOfTheViewPortHorizontal3D');
        }
    };

    var outsideConfigVertical3D = {
        handler: function($entity, lowerEdge, higherEdge) {
            if (lowerEdge) {
                $entity.ng3D.y += $entity.ngCyclic.patternHeight;
            } else if (higherEdge) {
                $entity.ng3D.y -= $entity.ngCyclic.patternHeight;
            }

            if (!$entity.ngMarkIfInsideOfTheViewPortVertical3D) {
                $entity.$add('ngMarkIfInsideOfTheViewPortVertical3D',
                    insideConfigVertical3D);
            }

            $entity.$remove('ngMarkIfOutsideOfTheViewPortVertical3D');
        }
    };

    var insideConfigHorizontal3D = {
        marker: {
            ngMarkIfOutsideOfTheViewPortHorizontal3D: outsideConfigHorizontal3D
        }
    };

    var insideConfigVertical3D = {
        marker: {
            ngMarkIfOutsideOfTheViewPortVertical3D: outsideConfigVertical3D
        }
    };

    m.$s('ngMarkIfOutsideOfTheViewPortVertical3D', {
        $require: ['ng3D', 'ngMarkIfOutsideOfTheViewPortVertical3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfOutsideOfTheViewPortVertical3D;
            var viewPortHeight = component.viewPortHeight ||
                0.5 * Math.max(ng2DViewPort.height, component.minHeight);
            component.viewPortHeight = viewPortHeight;

            outsideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical3D',
                component,
                $entity.ng3D.y,

                ng2DViewPort.lookAt.y,
                viewPortHeight
            );
        }]
    });

    m.$s('ngMarkIfOutsideOfTheViewPortHorizontal3D', {
        $require: ['ng3D', 'ngMarkIfOutsideOfTheViewPortHorizontal3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfOutsideOfTheViewPortHorizontal3D;
            var viewPortWidth = component.viewPortWidth ||
                0.5 * Math.max(ng2DViewPort.width, component.minWidth);
            component.viewPortWidth = viewPortWidth;

            outsideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical3D',
                component,
                $entity.ng3D.x,

                ng2DViewPort.lookAt.x,
                viewPortWidth
            );
        }]
    });

    m.$s('ngMarkIfInsideOfTheViewPortVertical3D', {
        $require: ['ng3D', 'ngMarkIfInsideOfTheViewPortVertical3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfInsideOfTheViewPortVertical3D;
            var viewPortHeight = component.viewPortHeight ||
                0.5 * Math.max(ng2DViewPort.height, component.minHeight);
            component.viewPortHeight = viewPortHeight;

            insideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical',
                component,
                $entity.ng3D.y,

                ng2DViewPort.lookAt.y,
                viewPortHeight
            );
        }]
    });

    m.$s('ngMarkIfInsideOfTheViewPortHorizontal3D', {
        $require: ['ng3D', 'ngMarkIfInsideOfTheViewPortHorizontal3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfInsideOfTheViewPortHorizontal3D;
            var viewPortWidth = component.viewPortWidth ||
                0.5 * Math.max(ng2DViewPort.width, component.minWidth);
            component.viewPortWidth = viewPortWidth;

            insideOf($entity,
                'ngMarkIfInsideOfTheViewPortHorizontal3D',
                component,
                $entity.ng3D.x,

                ng2DViewPort.lookAt.x,
                viewPortWidth
            );
        }]
    });

    /**
     * check is $entity is outside of viewPort
     *
     * @private
     * @ignore
     *
     * @param $entity
     * @param componentName
     * @param component
     * @param componentPosition
     * @param viewPortPosition
     * @param viewPortSize
     */
    function outsideOf($entity, componentName, component,
                       componentPosition, viewPortPosition, viewPortSize) {
        var crossBottom = viewPortPosition + viewPortSize < componentPosition,
            crossTop = componentPosition < viewPortPosition - viewPortSize;

        if (crossTop || crossBottom) {
            var handler = component.handler;
            applyMarker($entity, component.marker);
            if (component.autoRemove) {
                $entity.$remove(componentName);
            }
            callIfHasHandler(handler, $entity, crossTop, crossBottom);
        }
    }

    /**
     * check is $entity is inside of viewPort
     *
     * @ignore
     *
     * @private
     *
     * @param $entity
     * @param componentName
     * @param component
     * @param componentPosition
     * @param viewPortPosition
     * @param viewPortSize
     */
    function insideOf($entity, componentName, component,
                      componentPosition, viewPortPosition, viewPortSize) {
        var crossBottom = viewPortPosition + viewPortSize >= componentPosition,
            crossTop = componentPosition >= viewPortPosition - viewPortSize;

        if (crossTop && crossBottom) {
            var handler = component.handler;
            applyMarker($entity, component.marker);
            if (component.autoRemove) {
                $entity.$remove(componentName);
            }
            callIfHasHandler(handler, $entity, crossTop, crossBottom);
        }
    }

    /**
     * Execute handle if has it defined
     *
     * @private
     * @ignore
     * @param handler
     * @param $entity
     * @param lowerEdge
     * @param higherEdge
     */
    function callIfHasHandler(handler, $entity, lowerEdge, higherEdge) {
        if (handler) {
            handler($entity, lowerEdge, higherEdge);
        }
    }

    /**
     * apply markers from component
     *
     * @ignore
     *
     * @private
     *
     * @param $entity
     * @param marker
     */
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
})(darlingjs, darlingutil);