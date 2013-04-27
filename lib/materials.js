function Material(game) {
  if (!(this instanceof Material)) return new Material(game);
  this.game = game;
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.canvas.width = this.canvas.height = 512;

  // change the sky
  game.view.renderer.setClearColorHex(0x000000, 1.0);
}
module.exports = Material;

Material.prototype.image = function(done) {
  var img = new Image();
};
