window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

var Key = {
  _pressed: {},

  A: 65,
  W: 87,
  D: 68,
  S: 83,
  SPACE: 32,
  M: 77,
  RIGHT: 39,
  LEFT: 37,
  SHIFT: 16,
  H: 72,

  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
    console.log("Key pressed: " + event.key + ", Keycode: " + event.keyCode);
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};


