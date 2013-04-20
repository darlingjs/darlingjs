/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {


'use strict';
var m = darlingjs.module('ngPixijsAdapter');

m.$s('ngPixijsMovieClip', {
    $require: ['ng2D', 'ngMovieClip'],

    _frames: null,

    $addNode: function($node) {
        var spriteAtlas = $node.ngMovieClip;
        var self = this;
        LoadAtlas(spriteAtlas.url)
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

                var ng2DSize = $node.ng2DSize;

                if (ng2DSize && spriteAtlas.fitToSize) {
                    movieClip.width = ng2DSize.width;
                    movieClip.height = ng2DSize.height;
                }

                $node.$add('ngPixijsSprite', {
                    sprite: movieClip,
                    fitToSize: spriteAtlas.fitToSize
                });
            });
    }
});

m.$s('ngPixijsSheetSprite', {
    $require: ['ng2D', 'ngSpriteAtlas'],

    $added: function() {

    },

    $addNode: ['$node', function($node) {
        var spriteAtlas = $node.ngSpriteAtlas;
        LoadAtlas(spriteAtlas.url)
            .then(function() {
                var sprite = PIXI.Sprite.fromFrame(spriteAtlas.name);
                if (spriteAtlas.anchor) {
                    sprite.anchor.x = spriteAtlas.anchor.x;
                    sprite.anchor.y = spriteAtlas.anchor.y;
                } else {
                    sprite.anchor.x = 0.5;
                    sprite.anchor.y = 0.5;
                }

                var ng2DSize = $node.ng2DSize;

                if (ng2DSize && spriteAtlas.fitToSize) {
                    sprite.width = ng2DSize.width;
                    sprite.height = ng2DSize.height;
                }

                $node.$add('ngPixijsSprite', {
                    sprite: sprite
                });
            });
    }]
});

var _loaders = [];
var _loadersPromises = {};
var _loaded = {};

function LoadAtlas(url) {
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

m.$s('ngPixijsSprite', {
    $require: ['ng2D', 'ngSprite'],

    $added: function() {

    },

    $addNode: ['$node', function($node) {
        var ngSprite = $node.ngSprite;

        // create a texture from an image path
        ngSprite._texture = PIXI.Texture.fromImage(ngSprite.name);

        // create a new Sprite using the texture
        var sprite = ngSprite._sprite = new PIXI.Sprite(ngSprite._texture);

        // center the sprites anchor point
        sprite.anchor.x = ngSprite.anchor.x || 0.5;
        sprite.anchor.y = ngSprite.anchor.y || 0.5;

        var ng2DSize = $node.ng2DSize;
        if(ng2DSize && ngSprite.fitToSize) {
            ngSprite._texture.addEventListener( 'update', function() {
                sprite.width = ng2DSize.width;
                sprite.height = ng2DSize.height;
            });
            //sprite.scale.x = 0.5;
            //sprite.scale.y = 0.5;
        }

        $node.$add('ngPixijsSprite', {
            sprite: sprite
        });
    }]
});

m.$c('ngPixijsSprite', {
    sprite: null
});

m.$c('ngBindLifeToAlpha', {
    min: 0.0,
    max: 1.0
});

m.$s('ngBindLifeToAlpha', {
    $require: ['ngBindLifeToAlpha', 'ngLife', 'ngPixijsSprite'],

    $update: ['$node', function($node) {
        var sprite = $node.ngPixijsSprite.sprite;
        sprite.alpha = $node.ngBindLifeToAlpha.min + $node.ngLife.life * ($node.ngBindLifeToAlpha.max - $node.ngBindLifeToAlpha.min);
    }]
});

m.$s('ngPixijsStage', {
    width: 640,
    height: 480,

    shiftX: 0.0,
    shiftY: 0.0,

    domId: '',

    useWebGL: true,

    _center: {x:0.0, y:0.0},

    $require: ['ng2D', 'ngPixijsSprite'],

    $added: function() {
        // create an new instance of a pixi stage
        this._stage = new PIXI.Stage(0x0);

        // create a renderer instance.
        var width, height;
        var view;
        if (this.domId !== null && this.domId !== '') {
            view = darlingutil.placeCanvasInStack(this.domId, this.width, this.height);
            width = view.width;
            height = view.height;
        } else {
            width = this.width;
            height = this.height;
        }

        this._center.x = 0.5 * this.width;
        this._center.y = 0.5 * this.height;

        if (this.useWebGL) {
            this._renderer = PIXI.autoDetectRenderer(width, height, view);
        } else {
            this._renderer = new PIXI.CanvasRenderer(width, height, view);
        }

        // add the renderer view element to the DOM
        if (!darlingutil.isDefined(view)) {
            document.body.appendChild(this._renderer.view);
        }
    },

    $removed: function() {
        document.removeChild(this._renderer.view);
    },

    $addNode: function($node) {
        this._stage.addChild($node.ngPixijsSprite.sprite);
    },

    $removeNode: function($node) {
        this._stage.removeChild($node.ngPixijsSprite.sprite);
    },

    $update: ['$node', 'ng2DViewPort', function($node, ng2DViewPort) {
        var sprite = $node.ngPixijsSprite;

        var ng2D = $node.ng2D;

        sprite.sprite.position.x = ng2D.x + this._center.x;
        sprite.sprite.position.y = ng2D.y + this._center.y;

        if (!($node.ngLockViewPort && $node.ngLockViewPort.lockX)) {
            sprite.sprite.position.x -= ng2DViewPort.lookAt.x;
        }

        if (!($node.ngLockViewPort && $node.ngLockViewPort.lockY)) {
            sprite.sprite.position.y -= ng2DViewPort.lookAt.y;
        }

        var ngParallax = $node.ngParallax;
        if (ngParallax) {
            sprite.sprite.position.x *= ngParallax.basis;
            sprite.sprite.position.y *= ngParallax.basis;
        }

        var ng2DRotation = $node.ng2DRotation;
        if (ng2DRotation) {
            sprite.sprite.rotation = ng2DRotation.rotation;
        }

        var ng2DSize = $node.ng2DSize;

        if (ng2DSize && sprite.fitToSize) {
            sprite.sprite.scale.x = ng2DSize.width / sprite.sprite.width;
            sprite.sprite.scale.y = ng2DSize.height / sprite.sprite.height;
        }
    }],

    $afterUpdate: ['$nodes', function($nodes) {
        //$nodes.forEach(this.$updateNode);
        // render the stage
        this._renderer.render(this._stage);
    }],

    lookAt: function(x, y) {
        this.shiftX = -x;
        this.shiftY = -y;
    }
});

})(darlingjs, darlingutil);