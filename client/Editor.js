function Editor(){
	// where to put the current charater
	this.caret = {
		x: 0,
		y: 0
	};

	// where the current snippet of text originates from
	this.paragraph = {
		x: 0,
		y: 0
	};
}

Editor.prototype.type = function(_keyStr){
	var _keyCode = parseInt(_keyStr, 10);
	if(!keys.isDown(keys.SHIFT)){
		_keyCode = String.fromCharCode(_keyCode).toLowerCase().codePointAt(0);
	}
	switch(_keyCode){
		// ignore
		case keys.SHIFT:
		case keys.CTRL:
		case keys.ALT:
			break;
		// special keys
		case keys.ENTER:
			this.caret.y += 1;
			this.caret.x = this.paragraph.x;
			break;
		case keys.BACKSPACE:
			this.caret.x -= 1;
			this.set(32);
			break;

		// navigation
		case keys.LEFT:
			this.caret.x -= 1;
			this.paragraph.x = this.caret.x;
			break;
		case keys.RIGHT:
			this.caret.x += 1;
			this.paragraph.x = this.caret.x;
			break;
		case keys.DOWN:
			this.caret.y += 1;
			this.paragraph.y = this.caret.y;
			break;
		case keys.UP:
			this.caret.y -= 1;
			this.paragraph.y = this.caret.y;
			break;

		// everything else
		default:
			this.set(_keyCode);
			this.caret.x += 1;
			break;
	}	
};

Editor.prototype.set = function(_charCode){
	if(world.rows[this.caret.y]){
		if(world.rows[this.caret.y].cols[this.caret.x]){
			var char = world.rows[this.caret.y].cols[this.caret.x];
			var charString = _charCode.toString(10);
			char.texture = PIXI.TextureCache[charString];
			char.solid = !!(String.fromCharCode(_charCode).trim() != '');
			char.visible = char.solid;
			char.scale.x += 1;
			char.scale.y += 1;
		}
	}
};