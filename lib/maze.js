var high = 3; // how high the walls are

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
  if (!map[x] || !map[x][z]) return 0;
  var c = map[x][z];

  // goal = $
  // todo: fall through floor to next level
  if (y < 0 || y > high || c === '$') return 0;

  // floor
  if (y === 0) return floor;

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
      maze.spawn[[x, 2, z].join('|')] = 'red';
      return 0;
  }

  return 0;
};