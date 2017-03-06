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
	// TODO

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
			var charCode = cols[_x].codePointAt(0).toString(10);
			if(!fontData.frames.hasOwnProperty(charCode)){
				// skip characters we don't have textures for
				row.cols.push(null);
				continue;
			}
			var char = new PIXI.Sprite(PIXI.TextureCache[charCode]);
			char.x = _x * CHARACTER_WIDTH;
			char.y = 0;
			row.cols.push(char);
			row.addChild(char);
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
	console.log("Resized",size,scaleMultiplier,[size.x*scaleMultiplier,size.y*scaleMultiplier]);
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
	// TODO
}


function render(){
	renderer.render(game,null,true,false);
}