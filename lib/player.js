var high = 5;  // how high the walls are for level counting
var win = -100; // level deep to win

module.exports = function(game) {
  var EE = require('events').EventEmitter;
  var util = require('util');

  function Player() {
    EE.call(this);
    this.level = 1;
    this.time = {1: Date.now()};
    this.alive = true;
  }
  util.inherits(Player, EE);

  var player = new Player();

  var info = document.getElementById('info');

  var createPlayer = require('voxel-player')(game);
  var mal = createPlayer('textures/black.png');
  mal.yaw.position.set(3, 0, 3);
  mal.yaw.rotation.set(0, Math.PI / 180 * 210, 0);
  mal.possess();

  function restart() {
    mal.avatar.position.set(3, 0, 3);
    game.tic.timeout(function() {
      player.alive = true;
      info.innerHTML = '';
    }, 5000);
    game.composer.passes[1].uniforms.distortion.value = 3;
    game.composer.passes[1].uniforms.distortion2.value = 5;
    game.composer.passes[2].uniforms.amount.value = 0.5;
  }

  player.tick = function(dt) {
    var y = mal.avatar.position.y;

    // winrar?
    if (y < win) {
      game.tic.timeout(function() { info.innerHTML = 'Error... system rebooted.'; }, 1000);
      restart();
      player.emit('win');
      return;
    }

    var level = Math.ceil(Math.abs(y) / high);
    if (level !== player.level && player.alive) {
      // todo: reset these when you die
      player.time[player.level] = (Date.now() - player.time[player.level]);
      var time = Number(player.time[player.level] / 1000).toFixed(2);
      info.innerHTML = 'Level ' + level + ' in ' + time + 's';

      // increase level
      player.level = level;
      player.time[player.level] = Date.now();

      player.emit('level', player.level);
    }    
  };

  player.kill = function(markers) {
    var closest = 99999;
    var gohere = false;
    player.alive = false;
    Object.keys(markers.placed).forEach(function(pos) {
      pos = pos.split('|').map(function(n) { return Number(n); });
      var ppos = [mal.avatar.position.x, mal.avatar.position.y, mal.avatar.position.z];
      var dist = distanceTo(ppos, pos);
      if (dist < closest) {
        closest = dist;
        gohere = pos;
      }
    });
    if (gohere === false) {
      info.innerHTML = 'No markers found, rebooting...';
      restart();
      return;
    }
    info.innerHTML = 'Segmentation fault. Attempting recovery at nearest marker...';
    mal.avatar.position.set(gohere[0], gohere[1], gohere[2]);
    game.tic.timeout(function() {
      info.innerHTML = '';
      player.allive = true;
    }, 4000);
  };

  return player;
};

function distanceTo(a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
