var createGame = require('voxel-engine');
var tic = require('tic')();
var _ = require('lodash');
var maze = require('./lib/maze');
var map = require('./maps/level1');

var game = createGame({
  chunkDistance: 2,
  generate: function(x, y, z) {
    return maze(x, y, z, map);
  },
  materials: ['white', 'black', 'red', 'gray'],
  texturePath: 'textures/',
  lightsDisabled: true,
  fogDisabled: true,
  //materialParams: { vertexColors: 2 },
});
var container = document.getElementById('container');
game.appendTo(container);

// needs more gravity
game.gravity = [0, -0.0000036 * 10, 0];
game.friction = 0.1;

game.addStats();

// hide title screen on click
var title = document.getElementById('title');
title.addEventListener('click', function() {
  title.classList.add('done');
});

// highlight voxels
require('voxel-highlight')(game, {color: 0xdddddd, animate: true, wireframeOpacity: 0.2});

// add materials
//require('./lib/materials')(game);

// change sky color
game.view.renderer.setClearColorHex(0xdddddd, 1);
//game.view.renderer.setClearColorHex(0x000000, 1);

// add lights
require('./lib/lights')(game);

// create a player
var createPlayer = require('voxel-player')(game);
var mal = createPlayer('textures/black.png');
mal.yaw.position.set(3, 10, 3);
mal.yaw.rotation.set(0, Math.PI / 180 * 210, 0);
mal.possess();

// fly!
//require('voxel-fly')(game)(game.controls.target());

// markers
var markers = require('./lib/markers')(game);
var markerCount = document.getElementById('markers');
markerCount.innerHTML = 'x' + markers.max;

// explode voxel on click
var explode = require('voxel-debris')(game, { power : 1.5 });
game.on('fire', _.debounce(function(pos) {
  var pos = game.raycast(game.cameraPosition(), game.cameraVector(), 10).voxel;
  markerCount.innerHTML = 'x' + markers.place(pos);
  //if (erase) explode(pos);
  //else game.createBlock(pos, 1);
}, 200));

window.addEventListener('keydown', ctrlToggle);
window.addEventListener('keyup', ctrlToggle);

var erase = true;
function ctrlToggle (ev) { erase = !ev.ctrlKey }

game.on('tick', function(dt) {
  tic.tick(dt);
  //follow.tick(dt);
});

