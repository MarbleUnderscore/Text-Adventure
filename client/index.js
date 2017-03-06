var startTime = 0;
var lastTime = 0;
var curTime = 0;

var game;
try{
	game = new PIXI.Container();
}catch(e){
	document.body.innerHTML="<p>Unsupported Browser. Sorry :(</p>";
}
var resizeTimeout=null;

var size={x:1280,y:720};

var sounds=[];

var scaleMode = 2;
var scaleMultiplier = 1;

$(document).ready(function(){

	// try to auto-focus and make sure the game can be focused with a click if run from an iframe
	window.focus();
	$(document).on("mousedown",function(event){
		window.focus();
	});

	// setup game
	startTime=Date.now();


	// create renderer
	renderer = new PIXI.autoDetectRenderer(size.x, size.y, {
		antiAlias:false,
		transparent:false,
		resolution:1,
		roundPixels:true,
		clearBeforeRender:true,
		autoResize:false,
	});
	
	renderer.backgroundColor = 0xFFFFFF;

	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	PIXI.WRAP_MODES.DEFAULT = PIXI.WRAP_MODES.MIRRORED_REPEAT;

	// add the canvas to the html document
	$("#display").prepend(renderer.view);


	/*sounds["bgm"]=new Howl({
		urls:["assets/audio/flatgame recording.ogg"],
		autoplay:true,
		loop:true,
		volume:0
	});
	sounds["bgm"].fadeIn(1,2000);*/

	/*PIXI.loader
		.add("mouse_up","assets/img/mouse_up.png")
		.add("mouse_over","assets/img/mouse_over.png")
		.add("mouse_down","assets/img/mouse_down.png");*/

	/*for(var i = 0; i < stuff.length; ++i){
		PIXI.loader.add(stuff[i].spr, "assets/img/"+stuff[i].spr+".png");
	}*/

	PIXI.loader
		.add("world", "assets/world.txt")
		.add("font", "assets/img/font/textures.json");

	PIXI.loader
		.on("progress", loadProgressHandler)
		.load(init);
});


function loadProgressHandler(loader, resource){
	// called during loading
	console.log("loading: " + resource.url);
	console.log("progress: " + loader.progress+"%");
}


function _resize(){
	var w=$("#display").innerWidth();
	var h=$("#display").innerHeight();
	var ratio=size.x/size.y;

	
	if(w/h < ratio){
		h = Math.round(w/ratio);
	}else{
		w = Math.round(h*ratio);
	}
	
	var aw,ah;

	if(scaleMode==0){
		// largest multiple
		scaleMultiplier = 1;
		aw=size.x;
		ah=size.y;

		do{
			aw+=size.x;
			ah+=size.y;
			scaleMultiplier += 1;
		}while(aw <= w || ah <= h);

		scaleMultiplier -= 1;
		aw-=size.x;
		ah-=size.y;
	}else if(scaleMode==1){
		// stretch to fit
		aw=w;
		ah=h;
		scaleMultiplier = w/size.x;
	}else{
		// 1:1
		scaleMultiplier = 1;
		aw=size.x;
		ah=size.y;
	}

	renderer.view.style.width=aw+"px";
	renderer.view.style.height=ah+"px";
}

PIXI.zero=new PIXI.Point(0,0);