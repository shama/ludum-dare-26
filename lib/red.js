var high = 5;
var PF = require('pathfinding');
var finder = new PF.JumpPointFinder();
var audio = require('voxel-audio');
var _ = require('lodash');
var EE = require('events').EventEmitter;
var util = require('util');

function Red(game, pos, grid) {
  if (!(this instanceof Red)) return new Red(game, pos, grid);
  EE.call(this);
  this.game = game;
  this.grid = grid;
  this.active = false;
  this.aggression = 0;
  this.speed = 0.1;
  this.level = Math.ceil(Math.abs(pos[1]) / high);
  this.timers = [];
  this.path = [];

  // initialize sound
  //audio.initGameAudio(game);
  /*game.once('tick', function() {
    this.sound = new audio.PositionAudio({
      url: './audio/BIGHORN.mp3',
      startingPosition: pos,
      coneOuterAngle: 360,
      coneInnerAngle: 360,
      refDistance: 1,
      loop: true  
    });
    this.sound.load(function(err) {
      this.sound.play();
    }.bind(this));
  }.bind(this));*/

  this.item = new game.THREE.Object3D();
  var cube = new game.THREE.Mesh(
    new game.THREE.CubeGeometry(1, 1, 1),
    game.materials.material
  );
  cube.translateY(0.5);
  this.item.add(cube);
  this.item.position.set(Number(pos[0]), Number(pos[1]), Number(pos[2]));

  game.materials.paint(cube, ['red', 'redfacemouth', 'red', 'red', 'red', 'red']);
  cube.geometry.uvsNeedUpdate = true;

  game.scene.add(this.item);

  this.timer = game.tic.interval(function() {
    if (this.active === false) return;

    this.move();

    var p = game.raycast(game.cameraPosition(), game.cameraVector(), 50);
    if (!p) return;
    var i = [this.item.position.x, this.item.position.y, this.item.position.z];
    var d = distanceTo(i, p.position);
    if (d > 10) return;
    this.aggression += 1;
  }.bind(this), 100);
}
module.exports = Red;
util.inherits(Red, EE);

Red.prototype.die = function() {
  this.active = false;
  //this.sound.source.loop = false;
  this.game.scene.remove(this.item);
  this.item = null;
  //this.timer();
};

Red.prototype.move = function() {
  // sittin mindin my own bizness
  if (this.aggression < 1) return;

  var player = this.game.controls.target().avatar.position;
  player = [player.x, player.y, player.z];
  var current = [this.item.position.x, this.item.position.y, this.item.position.z];

  var dist = distanceTo(current, player);

  if (this.path.length > 0) {
    var pos = this.path.shift();
    if (pos && pos.length == 2) {
      var d = [
        clamp(pos[0] - current[0], -1, 1) * this.speed * (this.aggression / 10),
        clamp(pos[1] - current[2], -1, 1) * this.speed * (this.aggression / 10)
      ];
      this.item.position.x += d[0];
      this.item.position.z += d[1];
      if (distanceTo(current, [pos[0], current[1], pos[1]]) > 1) {
        this.path.unshift(pos);
      }
    }
  }

  // always looking o.o
  this.item.lookAt(this.game.controls.target().avatar.position);

  // move sound with red
  //this.sound.position.x = this.item.position.x;
  //this.sound.position.y = this.item.position.y;
  //this.sound.position.z = this.item.position.z;

  dist = distanceTo(current, player);

  if (this.path.length < 1 && dist < 20) {
    //var player = game.controls.target().avatar.position;
    this.navigate(player);
  }

  // grow bigger
  if (dist < 10) {
    this.game.composer.passes[1].uniforms.distortion.value = clamp(Math.abs(dist - 10), 0, 10);
    this.game.composer.passes[1].uniforms.distortion2.value = clamp(Math.abs(dist - 10), 0, 10);
    this.game.composer.passes[2].uniforms.amount.value = clamp(Math.abs(dist - 10) / 2, 0, 0.5);
    this.item.scale.x = this.item.scale.y = this.item.scale.z = clamp(Math.abs(dist - 10) / 2, 1, 2);
  } else {
    this.item.scale.x = this.item.scale.y = this.item.scale.z = 1;
  }

  // kill the player
  if (dist < 2) this.emit('kill');
};

Red.prototype.navigate = function(pos) {
  var start = this.item.position;
  try {
    this.path = finder.findPath(
      Math.ceil(start.x), Math.ceil(start.z),
      Math.ceil(pos[0]), Math.ceil(pos[2]),
      this.grid.clone()
    );
  } catch (err) {}
  return this.path;
};

function clamp(x, min, max) {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}
function distanceTo(a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}


/* A* in 3d is too slow
Red.prototype.navigate = function(start, end) {
  var self = this, isEnd;
  var game = this.game;
  if (distanceTo(start, end) > 100) {
    // if the distance is too far
    isEnd = function(at) { return distanceTo(start, at) >= 100; };
  } else {
    isEnd = function(at) { return distanceTo(at, end) <= 0.1; };
  }
  return astar({
    start: start,
    isEnd: isEnd,
    neighbor: function(at) {
      var result = [];
      [
        [-1, 0, 0], [1, 0, 0],
        [0, 0, -1], [0, 0, 1],
        [0, -1, 0], [0, 1, 0],
      ].forEach(function(vec) {
        var spot = add(at, vec);
        var block = game.getBlock(spot);
        if (block === 0) result.push(spot);
      });
      return result;
    },
    distance: distanceTo,
    heuristic: function(at) {
      return distanceTo(at, end) + 5;
    },
    timeout: 3000,
  });
};
*/