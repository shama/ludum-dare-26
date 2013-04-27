function Light(game) {
  if (!(this instanceof Light)) return new Light(game);
  this.game = game;
  var ambientLight = new game.THREE.AmbientLight(0xffffff);
  game.scene.add(ambientLight);
}
module.exports = Light;
