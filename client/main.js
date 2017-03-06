function main(){
	curTime = Date.now()-startTime;
	deltaTime = curTime-lastTime;

	update();
	render();

	lastTime = curTime;

	// request another frame to keeps the loop going
	requestAnimationFrame(main);
}

function init(){

	window.onresize = onResize;
	onResize();


	worldData = PIXI.loader.resources.world.data;

	world = new PIXI.Container();

	world.rows = [];


	CHARACTER_WIDTH = 19;
	CHARACTER_HEIGHT = 43;

	var rows=worldData.split('\n');
	for(var _y=0, _l=rows.length; _y < _l; ++_y){
		var row = new PIXI.Container();
		row.x = 0;
		row.y = _y * CHARACTER_HEIGHT;
		row.cols=[];

		var cols=rows[_y].split('');
		for(var _x=0, _k=cols.length; _x < _k; ++_x){
			var charCode = cols[_x].codePointAt(0).toString(10);
			if(!PIXI.loader.resources.font.data.frames.hasOwnProperty(charCode)){
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

	//var text = new PIXI.Text(world);
	//game.addChild(text);

	console.log(world);

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

			char.y = Math.sin(curTime/100+_y+_x)*5;

			char.texture = PIXI.TextureCache[(Math.floor(curTime/16+_x+_y)%10).toString().codePointAt(0).toString(10)]
		}
	}

	// update input managers
}


function render(){
	renderer.render(game,null,true,false);
}