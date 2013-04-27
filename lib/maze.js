var high = 3; // how high the walls are

var floor = 1;
var walls = 2;

module.exports = function(x, y, z, map) {
  if (y < 0 || y > high) return 0;

  // floor
  if (y === 0) return floor;

  // figure type
  var inbounds = false;
  if (map[x] && map[x][z]) {
    inbounds = true;
    switch (map[x][z]) {
      case '#':
        return walls;
      case '$':
        return 3;
    }
  }

  return (!inbounds) ? floor : 0;
};