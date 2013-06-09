/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

/**
 * Systems:
 * ngPixijsSpriteFactory - use for building Pixijs Sprite from entity
 * ngPixijsStage - create Pixijs Stage, connect it with DOM
 * ngPixijsUpdateCycle - basic update cycle
 * ngPixijsViewPortUpdateCycle - update cycle with applying of ViewPort
 *
 */
(function(darlingjs, darlingutil) {

    'use strict';
    var m = darlingjs.module('ngPixijsAdapter');

    m.$c('ngPixijsSprite', {
        sprite: null
    });

    m.$c('ngBindLifeToAlpha', {
        min: 0.0,
        max: 1.0
    });

    m.$s('ngBindLifeToAlpha', {
        $require: ['ngBindLifeToAlpha', 'ngLife', 'ngPixijsSprite'],

        $update: ['$entity', function($entity) {
            var sprite = $entity.ngPixijsSprite.sprite;
            sprite.alpha = $entity.ngBindLifeToAlpha.min + $entity.ngLife.life * ($entity.ngBindLifeToAlpha.max - $entity.ngBindLifeToAlpha.min);
        }]
    });

    m.$s('ngLayer', {
        layerName: null
    });

    m.$s('ngPixijsStaticZ', {
        $require: ['ngLayer', 'ngPixijsSprite'],

        //layers with fixed distance. Use for applying z-depth
        layers: null,
        _layers: {},

        $added: ['ngPixijsStage', function(ngPixijsStage) {
            if (this.layers) {
                for (var i = 0, count = this.layers.length; i < count; i++) {
                    var layerName = this.layers[i];
                    var layer = new PIXI.DisplayObjectContainer();
                    ngPixijsStage._stage.addChild(layer);
                    this._layers[layerName] = layer;
                }
            }
        }],

        $removed: ['ngPixijsStage', function(ngPixijsStage) {
            if (ngPixijsStage._stage) {
                for (var layerName in this._layers) {
                    ngPixijsStage._stage.removeChild(this._layers[layerName]);
                }
            }
            this._layers = {};
        }],

        $addEntity: ['$entity', function($entity) {
            this.addChildAt($entity.ngLayer.layerName, $entity.ngPixijsSprite.sprite);
        }],

        $removeEntity: ['$entity', 'ngPixijsStage', function($entity, ngPixijsStage) {
            if ($entity.ngPixijsSprite.sprite) {
                ngPixijsStage._stage.addChild($entity.ngPixijsSprite.sprite);
            }
        }],

        addChildAt: function(layerName, sprite) {
            var layer = this._layers[layerName];
            layer.addChild(sprite);
        }
    });

    m.$c('ngSprite', {
        name: null,
        spriteSheetUrl: null,
        fitToSize: false,
        anchor: {
            x: 0.5,
            y: 0.5
        },
        layerName: null,
        tiled: false
    });

    m.$c('ngSpriteShift', {
        dx: 0.0,
        dy: 0.0
    });

    m.$s('ngPixijsSpriteFactory', {
        $require: ['ngSprite'],

        $addEntity: ['ngPixijsStage', 'ngPixijsStaticZ', '$entity', 'ngResourceLoader', function(ngPixijsStage, ngPixijsStaticZ, $entity, ngResourceLoader) {
            var state = $entity.ngSprite;
            if (state.spriteSheetUrl) {
                if (isLoaded(state.spriteSheetUrl)) {
                    handler();
                } else {
                    if (ngResourceLoader) {
                        ngResourceLoader.startLoading(state.spriteSheetUrl);
                    }
                    loadAtlas(state.spriteSheetUrl)
                        .then(handler);
                }
            }

            function handler() {
                if (ngResourceLoader) {
                    ngResourceLoader.stopLoading(state.spriteSheetUrl);
                }
                buildSprite(state, $entity.ng2DSize);
                fitToSize(state, $entity.ng2DSize);
                //hide sprite before update phase
                state._sprite.position.x = -1048576;
                state._sprite.position.y = -1048576;
                if (state.layerName) {
                    ngPixijsStaticZ.addChildAt(state.layerName, state._sprite);
                } else {
                    ngPixijsStage.addChild(state._sprite);
                }
                $entity.$add('ngPixijsSprite', {
                    sprite: state._sprite
                });

                if (state.tiled && state.anchor) {
                    $entity.$add('ngSpriteShift', {
                        dx: -$entity.ng2DSize.width * state.anchor.x,
                        dy: -$entity.ng2DSize.height * state.anchor.y
                    });
                }
            }
        }],

        $removeEntity: ['ngPixijsStage', '$entity', function(ngPixijsStage, $entity) {
            var state = $entity.ngSprite;
            ngPixijsStage.removeChild(state._sprite);
            state._texture = null;
            if (state._sprite instanceof PIXI.Sprite) {
                disposeSprite(state._sprite);
            }
            state._sprite = null;
        }]
    });

    /**
     * TODO: integrate with ngPixijsUpdateCycle_FullCycleInOne
     */
    m.$s('ngPixijsMovieClip', {
        $require: ['ng2D', 'ngMovieClip'],

        _frames: null,

        $addEntity: function($entity) {
            var spriteAtlas = $entity.ngMovieClip;
            var self = this;
            loadAtlas(spriteAtlas.url)
                .then(function() {
                    var frameNames = spriteAtlas.frames;

                    var frames = [];
                    if (self._frames !== null) {
                        frames = self._frames;
                    } else {
                        for (var i = 0, l = frameNames.length; i < l; i++) {
                            frames.push(PIXI.Texture.fromFrame(frameNames[i]));
                        }
                        self._frames = frames;
                    }

                    var movieClip = new PIXI.MovieClip(frames);
                    movieClip.gotoAndPlay(1);

                    if (spriteAtlas.anchor) {
                        movieClip.anchor.x = spriteAtlas.anchor.x || 0.5;
                        movieClip.anchor.y = spriteAtlas.anchor.y || 0.5;
                    } else {
                        movieClip.anchor.x = 0.5;
                        movieClip.anchor.y = 0.5;
                    }

                    var ng2DSize = $entity.ng2DSize;

                    if (ng2DSize && spriteAtlas.fitToSize) {
                        movieClip.width = ng2DSize.width;
                        movieClip.height = ng2DSize.height;
                    }

                    $entity.$add('ngPixijsSprite', {
                        sprite: movieClip,
                        fitToSize: spriteAtlas.fitToSize
                    });
                });
        }
    });

    m.$s('ngPixijsUpdateCycle', {
        $require: ['ng2D', 'ngPixijsSprite'],

        $removeEntity: ['ngPixijsStage', '$entity', function(ngPixijsStage, $entity) {
            $entity.ngPixijsSprite.sprite = null;
        }],

        $update: ['$entity', 'ng2DViewPort', 'ngPixijsStage', function($entity, ng2DViewPort, ngPixijsStage) {
            var state = $entity.ngPixijsSprite;

            var ng2D = $entity.ng2D;
            var pos = state.sprite.position;
            pos.x = ng2D.x + ngPixijsStage._center.x;
            pos.y = ng2D.y + ngPixijsStage._center.y;

            pos.x -= ng2DViewPort.lookAt.x;
            pos.y -= ng2DViewPort.lookAt.y;
        }]
    });

    /**
     * System for applying dynamic shift of Sprite
     */
    m.$s('ngPixijsSpriteShiftUpdate', {
        $require: ['ngSpriteShift', 'ngPixijsSprite'],

        $update: ['$entity', function($entity) {
            var pos = $entity.ngPixijsSprite.sprite.position;
            var shift = $entity.ngSpriteShift;
            pos.x += shift.dx;
            pos.y += shift.dy;
        }]
    });

    m.$s('ngPixijsViewPortUpdateCycle', {
        $require: ['ngPixijsSprite', 'ngLockViewPort'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var state = $entity.ngPixijsSprite;
            if ($entity.ngLockViewPort.lockX) {
                state.sprite.position.x += ng2DViewPort.lookAt.x;
            }

            if ($entity.ngLockViewPort.lockY) {
                state.sprite.position.y += ng2DViewPort.lookAt.y;
            }
        }]
    });

    /**
     * System perform rotation of sprite
     */
    m.$s('ngPixijsRotationUpdateCycle', {
        $require: ['ngPixijsSprite', 'ng2DRotation'],

        $update: ['$entity', function($entity) {
            $entity.ngPixijsSprite.sprite.rotation = $entity.ng2DRotation.rotation;
        }]
    });

    m.$c('ngFitToSize');

    /**
     * System perform rescale to 2d size of entity
     */
    m.$s('ngPixijsScaleUpdateCycle', {
        $require: ['ngPixijsSprite', 'ng2DSize', 'ngFitToSize'],

        $update: ['$entity', function($entity) {
            var state = $entity.ngPixijsSprite;
            var ng2DSize = $entity.ng2DSize;

            state.sprite.scale.x = ng2DSize.width / state.sprite.width;
            state.sprite.scale.y = ng2DSize.height / state.sprite.height;
        }]
    });

    m.$s('ngPixijsStage', {
        width: 640,
        height: 480,

        fitToWindow: false,

        domId: '',

        /**
         * user webGL to renderer scene
         */
        useWebGL: true,

        /**
         * @private
         */
        _onResizeDefaultHandler: null,
        _canvasWasCreated: false,
        _canvas: null,
        _stage: null,
        _center: {x:0.0, y:0.0},

        _visible: false,

        $added: function() {
            // create an new instance of a pixi stage
            this._stage = new PIXI.Stage(0x0);

            this.show();
        },

        $removed: function() {
            this._stage = null;
            this.hide();
            clearLoaders();

            //clear all cache in Pixi.js
            PIXI._batchs.length = 0;
            PIXI.TextureCache = {};
            PIXI.BaseTextureCache = {};
            PIXI.shaderProgram = null;
        },

        /**
         * Show pixi.js stage
         */
        show: function() {
            if (this._visible) {
                return;
            }

            this._visible = true;

            // create a renderer instance.
            var width, height;
            var view;

            if (this.domId !== null && this.domId !== '') {
                view = darlingutil.getCanvas(this.domId);
                if (view) {
                    view.width = this.width;
                    view.height = this.height;
                } else {
                    view = darlingutil.placeCanvasInStack(this.domId, this.width, this.height);
                    this._canvasWasCreated = true;
                }
                this._canvas = view;
                width = view.width;
                height = view.height;
            } else {
                width = this.width;
                height = this.height;
            }

            this._center.x = 0.5 * this.width;
            this._center.y = 0.5 * this.height;

            if (this._renderer) {
                this._renderer.view = view;
                this._renderer.handleContextRestored();
            } else {
                if (this.useWebGL) {
                    this._renderer = PIXI.autoDetectRenderer(width, height, view);
                } else {
                    this._renderer = new PIXI.CanvasRenderer(width, height, view);
                }
            }

            // add the renderer view element to the DOM
            if (!darlingutil.isDefined(view)) {
                document.body.appendChild(this._renderer.view);
            }

            if (this.fitToWindow) {
                this._onResizeDefaultHandler = window.onresize || function(){};
                var self = this;
                window.onresize = function(e) {
                    self._onResize(e);
                };
                self._onResize();
            }
        },

        _onResize: function(e) {
            this._onResizeDefaultHandler(e);

            var widthRatio = window.innerWidth / this.width;
            var heightRatio = window.innerHeight / this.height;
            var ratio = Math.min(widthRatio, heightRatio);

            if (ratio >= 1) {
                ratio = 1;
            }

            this._center.x = 0.5 * ratio * this.width;
            this._center.y = 0.5 * ratio * this.height;
            this._canvas.width = ratio * this.width;
            this._canvas.height = ratio * this.height;
        },

        /**
         * hide pixi.js stage
         */
        hide: function() {
            if (!this._visible) {
                return;
            }
            this._visible = false;
            if (this._canvasWasCreated) {
                document.removeChild(this._canvas);
            }
            window.onresize = this._onResizeDefaultHandler;
            this._onResizeDefaultHandler = null;
            this._canvas = null;
            this._renderer = null;
            this._stage = null;
            PIXI.gl = null;
        },

        addChild: function(child) {
            this._stage.addChild(child);
        },

        removeChild: function(child) {
            if (!child) {
                return;
            }
            var parent = child.parent;
            if (!parent) {
                return;
            }

            parent.removeChild(child);
            if (child.onDispose) {
                child.onDispose();
            }
        },

        /**
         * apply renderer
         */
        $afterUpdate: function() {
            //$entities.forEach(this.$updateNode);
            // render the stage
            this._renderer.render(this._stage);
        }
    });

    /**
     * Resources of Pixi.js
     * Every Asset or image that need to bee tracked by
     * ngResourceLoader. Can by loaded though
     *
     * ngPixijsResources.load(url)
     *
     * It's good practice to preload all images and assets
     * before game is started. To avoid lack of them
     * in first seconds of game.
     */
    m.$s('ngPixijsResources', {
        load: function(url, ngResourceLoader) {
            ngResourceLoader.startLoading(url);
            loadAtlas(url)
                .then(function() {
                    ngResourceLoader.stopLoading(url);
                });
        }
    });

    function clearLoaders() {
        _loaders.length = 0;
        _loadersPromises = {};
        _loaded = {}
    }

    var _loaders = [];
    var _loadersPromises = {};
    var _loaded = {};

    function isLoaded(url) {
        return _loaded[url];
    }

    function loadAtlas(url) {
        var promise = _loadersPromises[url];

        if (promise) {
            return promise;
        }

        var deferred = Q.defer();
        if (_loaded[url]) {
            setTimeout(function() {
                deferred.resolve();
            }, 0);
            return;
        }

        var loader = new PIXI.AssetLoader([url]);
        _loaders.push(loader);
        loader.onComplete = function() {
            var index = _loaders.indexOf(loader);
            _loaders.splice(index, 1);
            _loaded[url] = true;
            deferred.resolve(loader);
        };
        loader.load();
        _loadersPromises[url] = deferred.promise;
        return deferred.promise;
    }

    function buildSprite(state, ng2DSize) {
        // create a texture from an image path
        var texture = state._texture = PIXI.Texture.fromImage(state.name);

        // create a new Sprite using the texture
        var sprite;
        if (state.tiled) {
            if (texture.width & (texture.width - 1) === 0 ||
                texture.height & (texture.height - 1) === 0) {
                throw new Error('Tiled Sprite must be power of 2');
            }

            // create a texture from an image path
            //texture = state._texture = PIXI.Texture.fromImage("assets/p2gui.jpeg");
            //texture = state._texture = PIXI.Texture.fromImage('p2.jpeg');
            sprite = state._sprite = new PIXI.TilingSprite(texture, ng2DSize.width, ng2DSize.height);

        } else {
            sprite = state._sprite = getSprite(state._texture);
            // center the sprites anchor point
            sprite.anchor.x = state.anchor.x;
            sprite.anchor.y = state.anchor.y;
        }

        return sprite;
    }

    var _poolOfSprites = [];

    function getSprite(texture) {
        var instance = _poolOfSprites.pop();
        if (!instance) {
            instance = new PIXI.Sprite(texture);
        } else {
            instance.setTexture(texture);
            instance.rotation = 0;
            instance.scale.x = 1;
            instance.scale.y = 1;
            instance.alpha = 1;
        }

        return instance;
    }

    function disposeSprite(sprite) {
        _poolOfSprites.push(sprite);
    }

    function fitToSize(state, ng2DSize) {
        var sprite = state._sprite;
        if(ng2DSize && state.fitToSize) {
            if (state._texture.baseTexture.hasLoaded) {
                sprite.width = ng2DSize.width;
                sprite.height = ng2DSize.height;
            } else {
                state._texture.addEventListener( 'update', function() {
                    sprite.width = ng2DSize.width;
                    sprite.height = ng2DSize.height;
                });
            }
        }
    }

})(darlingjs, darlingutil);