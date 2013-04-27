function Marker(game) {
  if (!(this instanceof Marker)) return new Marker(game);
  this.game = game;
  this.placed = Object.create(null);
  this.max = 5;
  this.material = 4;
  this.wall = 2;
}
module.exports = Marker;

Marker.prototype.place = function(pos) {
  var game = this.game;
  var p = pos.join('|');
  var len = Object.keys(this.placed).length;
  if (this.placed[p] === true) {
    game.setBlock(pos, this.wall);
    delete this.placed[p];
    len--;
  } else {
    if (len < this.max) {
      game.setBlock(pos, this.material);
      this.placed[p] = true;
      len++;
    }
  }
  return this.max - len;
};