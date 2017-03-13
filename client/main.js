function main(){
	// step
	curTime = Date.now()-startTime;
	deltaTime = curTime-lastTime;

	update();
	render();

	lastTime = curTime;

	// request another frame to keeps the loop going
	requestAnimationFrame(main);
}

function init(){
	// initialize input managers
	keys.init();
	keys.capture = [keys.LEFT,keys.RIGHT,keys.UP,keys.DOWN,keys.SPACE,keys.ENTER,keys.BACKSPACE,keys.ESCAPE,keys.W,keys.A,keys.S,keys.D,keys.P,keys.M];
	gamepads.init();

	window.onresize = onResize;
	onResize();


	worldData = PIXI.loader.resources.world.data;
	fontData = PIXI.loader.resources.font.data;

	// retrieve the character dimensions from the first entry in the font file
	// since it's monospace
	CHARACTER_WIDTH = fontData.frames[Object.keys(fontData.frames)[0]].frame.w;
	CHARACTER_HEIGHT = fontData.frames[Object.keys(fontData.frames)[0]].frame.h;

	// construct the world
	world = new PIXI.Container();
	world.rows = [];

	var rows=worldData.split('\n');
	for(var _y=0, _l=rows.length; _y < _l; ++_y){
		var row = new PIXI.Container();
		row.x = 0;
		row.y = _y * CHARACTER_HEIGHT;
		row.cols=[];

		var cols=rows[_y].split('');
		for(var _x=0, _k=cols.length; _x < _k; ++_x){
			var charString = cols[_x];
			var charCode = charString.codePointAt(0).toString(10);
			var char;
			if(!fontData.frames.hasOwnProperty(charCode)){
				// skip characters we don't have textures for
				char = {};
			}else{
				char = new PIXI.Sprite(PIXI.TextureCache[charCode]);
				row.addChild(char);
			}

			char.charCode = charCode;
			char.charString = charString;
			char.x = _x * CHARACTER_WIDTH;
			char.y = 0;
			char.solid = !!(charString.trim() != '');

			row.cols.push(char);
		}

		world.rows.push(row);
		world.addChild(row);
	}

	game.addChild(world);

	// start the main loop
	main();
}

function onResize() {
	_resize();
	console.log('Resized',size,scaleMultiplier,[size.x*scaleMultiplier,size.y*scaleMultiplier]);
}

function update(){
	// game update

	for(var _y=0, _l=world.rows.length; _y < _l; ++_y){
		var row = world.rows[_y];
		for(var _x=0, _k=row.cols.length; _x < _k; ++_x){
			var char = row.cols[_x];
			if(!char){
				// skip empty characters
				continue;
			}
			
			// wave
			char.y = Math.sin(curTime/100+_y+_x)*5;

			// assign random number textures
			//char.texture = PIXI.TextureCache[(Math.floor(curTime/16+_x+_y)%10).toString().codePointAt(0).toString(10)]
		}
	}

	// update input managers
	keys.update();
	gamepads.update();
}


function render(){
	renderer.render(game,null,true,false);
}



function getInput(){
	var res = {
		move:{
			x: gamepads.getAxis(gamepads.LSTICK_H),
			y: gamepads.getAxis(gamepads.LSTICK_V)
		},
		aim:{
			x: gamepads.getAxis(gamepads.RSTICK_H),
			y: gamepads.getAxis(gamepads.RSTICK_V)
		},
		jump: gamepads.isJustDown(gamepads.A) || keys.isJustDown(keys.SPACE),
		jumpExtend: gamepads.isDown(gamepads.A) || keys.isDown(keys.SPACE),
	};

	if(keys.isDown(keys.A) || keys.isDown(keys.LEFT)){
		res.move.x -= 1;
	}if(keys.isDown(keys.D) || keys.isDown(keys.RIGHT)){
		res.move.x += 1;
	}if(keys.isDown(keys.W) || keys.isDown(keys.UP)){
		res.move.y -= 1;
	}if(keys.isDown(keys.S) || keys.isDown(keys.DOWN)){
		res.move.y += 1;
	}

	res.move.x = clamp(-1.0, res.move.x, 1.0);
	res.move.y = clamp(-1.0, res.move.y, 1.0);

	return res;
}