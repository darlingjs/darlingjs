/**
 * Get from Three.js
 * @author mrdoob / http://mrdoob.com/
 * @author Larry Battle / http://bateru.com/news
 */

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

'use strict';

var lastTime = 0;
var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

for ( var x = 0; x < vendors.length && !this.requestAnimationFrame; ++ x ) {
    this.requestAnimationFrame = this[ vendors[ x ] + 'RequestAnimationFrame' ];
    this.cancelAnimationFrame = this[ vendors[ x ] + 'CancelAnimationFrame' ] || this[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
}

if ( this.requestAnimationFrame === undefined ) {

    this.requestAnimationFrame = function ( callback, element ) {

        var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
        var id = setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
        lastTime = currTime + timeToCall;
        return id;

    };

}

this.cancelAnimationFrame = this.cancelAnimationFrame || function ( id ) { clearTimeout( id ) };

module.exports = {
    cancel: this.cancelAnimationFrame,
    request: this.requestAnimationFrame
};