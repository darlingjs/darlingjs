'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var m = darlingjs.module('ngPixijsIntegration');

m.$s('ngPixijsStage', {
    width:400, height: 300,

    $require: ['ng2D', 'ngSprite'],

    $added: function() {
        // create an new instance of a pixi stage
        this._stage = new PIXI.Stage(0x66FF99);

        // create a renderer instance.
        this._renderer = PIXI.autoDetectRenderer(this.width, this.height);

        // add the renderer view element to the DOM
        document.body.appendChild(this._renderer.view);
    },

    $removed: function() {

    },

    $addNode: function($node) {
        var sprite = $node.ngSprite;

        // create a texture from an image path
        sprite._texture = PIXI.Texture.fromImage(sprite.name);
        // create a new Sprite using the texture
        sprite._bunny = new PIXI.Sprite(sprite._texture);

        // center the sprites anchor point
        sprite._bunny.anchor.x = 0.5;
        sprite._bunny.anchor.y = 0.5;

        this._stage.addChild(sprite._bunny);
    },

    $updateNode: function($node) {
        var sprite = $node.ngSprite;

        var ng2D = $node.ng2D;
        sprite._bunny.position.x = ng2D.x;
        sprite._bunny.position.y = ng2D.y;

        var ng2DRotation = $node.ng2DRotation;
        if (ng2DRotation) {
            sprite._bunny.rotation = ng2DRotation.rotation;
        }
    },

    $update: ['$nodes', function($nodes) {
        $nodes.forEach(this.$updateNode);
        // render the stage
        this._renderer.render(this._stage);
    }]
});