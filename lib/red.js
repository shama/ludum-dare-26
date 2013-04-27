var PF = require('pathfinding');
var finder = new PF.JumpPointFinder();

function Red(game, pos, grid) {
  if (!(this instanceof Red)) return new Red(game, pos, grid);
  this.game = game;
  this.grid = grid;
  this.aggression = 0;
  this.speed = 1000;

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

  var player = game.controls.target().avatar.position;
  this.navigate([player.x, 1, player.z]);

  // move
  this.timer = game.tic.interval(function() {
    this.move();
  }.bind(this), this.speed);
}
module.exports = Red;

Red.prototype.antagonize = function(pos) {
  if (this.aggression > 0) return;
  var c = [this.item.position.x, this.item.position.y, this.item.position.z];
  var d = distanceTo(c, [pos[0], c[1], pos[2]]);
  if (d <  3) {
    this.aggression++;
  }
};

Red.prototype.move = function() {
  // sittin mindin my own bizness
  if (this.aggression === 0) return;

  var pos = this.path.shift();
  if (pos && pos.length == 2) {
    var c = [this.item.position.x, this.item.position.y, this.item.position.z];
    var d = [
      clamp(pos[0] - c[0], -1, 1),
      clamp(pos[1] - c[2], -1, 1)
    ];
    this.item.position.x += d[0];
    this.item.position.z += d[1];
    if (distanceTo(c, [pos[0], c[1], pos[1]]) > 1) {
      this.path.unshift(pos);
    }
  }
  // always looking o.o
  this.item.lookAt(this.game.controls.target().avatar.position);

  // todo: check if near player, grow bigger and kill if near
  // agg > 2 = follow player
};

Red.prototype.navigate = function(pos) {
  var start = this.item.position;
  this.path = finder.findPath(start.x, start.z, pos[0], pos[2], this.grid.clone());
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