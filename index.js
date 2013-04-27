var createGame = require('voxel-engine');
var tic = require('tic')();
var _ = require('lodash');
var maze = require('./lib/maze');
var map = require('./maps/level1');
var createRed = require('./lib/red');

var game = createGame({
  chunkDistance: 2,
  //generate: function(x, y, z) { return 0; },
  generate: function(x, y, z) {
    return maze.generate(x, y, z, map);
  }.bind(game),
  materials: ['white', 'black', 'red', 'gray', 'redface', 'redfacemouth', 'marker'],
  texturePath: 'textures/',
  lightsDisabled: true,
  fogDisabled: true,
  //materialParams: { vertexColors: 2 },
});
var container = document.getElementById('container');
game.appendTo(container);

// Create a grid for npc to navigate
var grid = maze.createGrid(map);

// needs more gravity
//game.gravity = [0, -0.0000036 * 10, 0];
//game.friction = 0.1;

// give a copy for easier access
game.tic = tic;

game.addStats();

// keep track of reds
var reds = [];

// hide title screen on click
var title = document.getElementById('title');
title.addEventListener('click', function() {
  title.classList.add('done');
});

// highlight voxels
var highlighter = require('voxel-highlight')(game, {color: 0xdddddd, animate: true, wireframeOpacity: 0.2});
highlighter.on('highlight', function(pos) {
  // antagonize reds
  reds.forEach(function(r) {
    r.antagonize(pos);
  });
});

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
require('voxel-fly')(game)(game.controls.target());

// markers
var markers = require('./lib/markers')(game);
var markerCount = document.getElementById('markers');
markerCount.innerHTML = 'x' + markers.max;

// explode voxel on click
var explode = require('voxel-debris')(game, { power : 1.5 });
game.on('fire', _.debounce(function() {
  var pos = game.raycast(game.cameraPosition(), game.cameraVector(), 10).voxel;
  if (!pos) return;
  markerCount.innerHTML = 'x' + markers.place(pos);

  reds.forEach(function(r) {
    r.navigate(pos);
  });

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

  if (Object.keys(maze.spawn).length > 0) {
    Object.keys(maze.spawn).forEach(function(pos) {
      var type = maze.spawn[pos];
      if (type === 'red') {
        reds.push(createRed(game, pos.split('|'), grid));
      }
      delete maze.spawn[pos];
    });
  }
});

