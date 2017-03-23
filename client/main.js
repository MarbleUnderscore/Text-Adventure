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
	mouse.init('canvas');

	// setup screen filter
	screen_filter = new CustomFilter(PIXI.loader.resources.screen_shader_v.data, PIXI.loader.resources.screen_shader_f.data);
	screen_filter.padding = 0;
	

	setPalette(0xFFFFFF, 0x000000);
	//setPalette(Math.random()*0xFFFFFF,Math.random()*0xFFFFFF);
	
	renderSprite.filterArea = new PIXI.Rectangle(0,0,size.x,size.y);

	renderSprite.filters = [screen_filter];

	window.onresize = onResize;
	onResize();

	scene = new PIXI.Container();
	game.addChild(scene);

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
				// characters we don't have textures for become spaces
				char.originalCharCode = charCode;
				charCode = '32';
			}
			char = new PIXI.Sprite(PIXI.TextureCache[charCode]);
			row.addChild(char);

			char.charCode = charCode;
			char.charString = charString;
			char.x = _x * CHARACTER_WIDTH + CHARACTER_WIDTH/2;
			char.y = CHARACTER_HEIGHT/2;
			char.anchor.x = 0.5;
			char.anchor.y = 0.5;
			char.solid = !!(charString.trim() != '');
			char.visible = char.solid;

			row.cols.push(char);
		}

		world.rows.push(row);
		world.addChild(row);
	}

	scene.addChild(world);



	player = new Player();
	player.x = 20;
	player.y = 20;
	scene.addChild(player.spr);

	// start the main loop
	main();
}

function onResize() {
	_resize();
	screen_filter.uniforms["uScreenSize"] = [size.x,size.y];
	screen_filter.uniforms["uBufferSize"] = [nextPowerOfTwo(size.x),nextPowerOfTwo(size.y)];
	console.log('Resized',size,scaleMultiplier,[size.x*scaleMultiplier,size.y*scaleMultiplier]);
}

function update(){
	// game update


	var input = getInput();

	// acceleration
	player.vx += input.move.x;
	//player.vy += input.move.x;

	// flip based on movement
	if(Math.abs(input.move.x) > 0.01){
		player.flipped = input.move.x < 0;
	}
	// damping
	player.vx *= 0.75;
	if(player.walled){
		// increased damping when sliding down walls
		player.vy *= 0.5;
	}else if(player.vy < 0 && input.jumpExtend){
		player.vy *= 0.99;
	}else{
		player.vy *= 0.8;
	}

	if(player.walled && !player.grounded){
		// wall climb
		player.vy += Math.sign(input.move.y)*0.5;
	}else{
		// fall
		player.vy += 1;
	}

	// jump
	// can only jump when touching ground/wall
	if(input.jump && player.canJump()){
		player.vy = -10;

		// if wall-jumping, push away from wall
		if(player.canWalljump()){
			player.vx = -5;
			if(player.flipped){
				player.vx *= -1;
			}
		}

		// if just jumped, can't be touching ground or walls anymore
		player.grounded = false;
		player.walled = false;
	}


	// update physics
	var _responses = Physics.collisionUpdate(player);
	for (var _i = 0, _l = _responses.length; _i < _l; ++_i) {
		console.log(_responses[_i]);
	}

	player.update();

	// camera
	var p = scene.toLocal(PIXI.zero, player.camPoint);
	scene.scale.x = scene.scale.y = lerp(scene.scale.x, 1 - Math.abs(player.vy+player.vx)/32, 0.1);
	scene.pivot.x = lerp(scene.pivot.x, p.x, 0.03);
	scene.pivot.y = lerp(scene.pivot.y, p.y, 0.03);
	scene.position.x = size.x/2;
	scene.position.y = size.y/2;

	for(var _y=0, _l=world.rows.length; _y < _l; ++_y){
		var row = world.rows[_y];
		for(var _x=0, _k=row.cols.length; _x < _k; ++_x){
			var char = row.cols[_x];
			char.scale.x = char.scale.y = lerp(char.scale.x, 1, .1);
		}
	}


	var p = screenToCell(mouse.pos);

	var c = world.rows[p.y];
	if(c){
		c = c.cols[p.x];
		if(c){
			c.scale.x += 0.1;
			c.scale.y += 0.1;

			if(mouse.isJustDown(mouse.LEFT)){
				c.scale.x += 1;
				c.scale.y += 1;
			}
		}
	}


	// update input managers
	keys.update();
	gamepads.update();
	mouse.update();
}


function setPalette(_colorBg, _colorFg){
	// if a texture already exists, get rid of it
	if(screen_filter.uniforms["uPalette"].destroy){
		screen_filter.uniforms["uPalette"].destroy();
		screen_filter.uniforms["uPalette"]=null;
	}

	// make a new 2x2 texture
	// left side is background colour,
	// right side is foreground colour
	var g=new PIXI.Graphics();
	g.beginFill(_colorBg, 1.0);
	g.drawRect(0,0,1,2);
	g.endFill();
	g.beginFill(_colorFg, 1.0);
	g.drawRect(1,1,1,2);
	g.endFill();

	// assign the texture to the shader uniform
	screen_filter.uniforms["uPalette"] = renderer.generateTexture(g);
}

function render(){
	renderer.render(scene,renderTexture,true,false);
	renderer.render(renderSprite,null,true,false);
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
		jumpExtend: gamepads.isDown(gamepads.A) || keys.isDown(keys.SPACE)
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



function screenToWorld(_p){
	return scene.toLocal(new PIXI.Point(_p.x, _p.y), game);
}

function worldToCell(_p){
	return {
		x: Math.round((_p.x-CHARACTER_WIDTH/2)/CHARACTER_WIDTH),
		y: Math.round((_p.y-CHARACTER_HEIGHT/2)/CHARACTER_HEIGHT)
	};
}

function screenToCell(_p){
	return worldToCell(screenToWorld(_p));
}