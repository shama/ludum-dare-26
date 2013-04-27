function Marker(game) {
  if (!(this instanceof Marker)) return new Marker(game);
  this.game = game;
  this.placed = Object.create(null);
  this.max = 5;
  this.material = 4;
}
module.exports = Marker;

Marker.prototype.place = function(pos) {
  var game = this.game;
  var p = pos.join('|');
  var len = Object.keys(this.placed).length;
  if (this.placed[p] > 0) {
    game.setBlock(pos, this.placed[p]);
    delete this.placed[p];
    len--;
  } else {
    if (len < this.max) {
      this.placed[p] = game.getBlock(pos);
      game.setBlock(pos, this.material);
      len++;
    }
  }
  return this.max - len;
};