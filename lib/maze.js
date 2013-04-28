var high = 5; // how high the walls are

var floor = 1;
var walls = 2;

var PF = require('pathfinding');

var maze = module.exports = {};

maze.createGrid = function(map) {
  var matrix = [];
  for (var y = 0; y < map.length; y++) {
    for (var x = 0; x < map[y].length; x++) {
      // x,y may need to be switched
      var p = map[y][x];
      if (!Array.isArray(matrix[x])) matrix[x] = [];
      matrix[x][y] = (p === '#') ? 1 : 0;
    }
  }
  var w = matrix[0].length;
  var h = matrix.length;
  return new PF.Grid(w, h, matrix);
};

maze.spawn = Object.create(null);

maze.generate = function(x, y, z, map) {
  // nothing above 0
  if (y > 0) return 0;

  // get map level
  var level = Math.ceil(Math.abs(y) / high);

  // if not within bounds of the map
  if (!map[level] || !map[level][x] || !map[level][x][z]) return 0;

  // get square piece
  var c = map[level][x][z];

  // goal = $
  // todo: fall through floor to next level
  //if (y < 0 || y > high || c === '$') return 0;

  // floor
  if (y === -(level * high)) {
    // unless its a goal square
    if (c === '0') return 0;
    return floor;
  }

  // figure type
  switch (c) {
    // walls
    case '#':
      return walls;

    // more markers
    case '@':
      return 3;

    // the red
    case '*':
      maze.spawn[[x, -(level * high) + 2, z].join('|')] = {
        type: 'red',
        level: level
      };
      return 0;
  }

  return 0;
};

// y = 0  - 10 : 0
// y = 10 - 20 : 1

/*
var map = require('./map');
for (var x = 0; x < 10; x++) {
  for (var y = -100; y < 10; y++) {
    for (var z = 0; z < 10; z++) {
      maze.generate(x, y, z, map);
    }
  }
}
*/