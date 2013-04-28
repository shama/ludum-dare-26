var createGame = require('voxel-engine');
var tic = require('tic')();
var _ = require('lodash');
var maze = require('./lib/maze');
var map = require('./lib/map');
var createRed = require('./lib/red');

var game = createGame({
  chunkDistance: 2,
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

// Create grids for npc to navigate
var grids = Object.create(null);
Object.keys(map).forEach(function(i) {
  grids[i] = maze.createGrid(map[i], i);
});

// add in effects
game.composer = require('voxel-pp')(game);
game.composer.use(require('./shaders/badtv'));
game.composer.use(require('./shaders/rgbshift'));

// needs more gravity
//game.gravity = [0, -0.0000036 * 10, 0];
//game.friction = 0.1;

// give a copy for easier access
game.tic = tic;

//game.addStats();

// keep track of reds
var reds = [];

// hide title screen on click
var title = document.getElementById('title');
title.addEventListener('click', function() {
  title.innerHTML = 'mal';
  title.classList.add('done');
});

// highlight voxels
var highlighter = require('voxel-highlight')(game, {color: 0xdddddd, animate: true, wireframeOpacity: 0.2});

// change sky color
game.view.renderer.setClearColorHex(0xdddddd, 1);

// add lights
require('./lib/lights')(game);

// create a player
var player = require('./lib/player')(game);
player.on('level', function(level) {
  // kill previous level reds and activate new level reds
  reds.forEach(function(r, i) {
    if (r.level === level) {
      r.active = true;
    }
    if (r.level < level) {
      r.die();
      delete reds[i];
    }
  });
});

// fly!
//require('voxel-fly')(game)(game.controls.target());

// markers
var markers = require('./lib/markers')(game);
var markerCount = document.getElementById('markers');
markerCount.innerHTML = 'x' + markers.max;

// explode voxel on click
game.on('fire', _.debounce(function() {
  var pos = game.raycast(game.cameraPosition(), game.cameraVector(), 10).voxel;
  if (!pos) return;

  // place markers
  markerCount.innerHTML = 'x' + markers.place(pos);

  reds.forEach(function(r) {
    r.navigate(pos);
  });
}, 200));

// main tick
game.on('tick', function(dt) {
  tic.tick(dt);
  player.tick(dt);
  if (Object.keys(maze.spawn).length > 0) {
    Object.keys(maze.spawn).forEach(function(pos) {
      var npc = maze.spawn[pos];
      if (npc.type === 'red') {
        var red = createRed(game, pos.split('|'), grids[npc.level]);
        if (npc.level === 1) { red.active = true; }
        red.on('kill', function() { player.kill(markers); });
        reds.push(red);
      }
      delete maze.spawn[pos];
    });
  }

  // fade effects
  game.composer.passes[1].uniforms.distortion.value *= 0.99;
  game.composer.passes[1].uniforms.distortion2.value *= 0.99;
  game.composer.passes[2].uniforms.amount.value *= 0.5;
  
});
