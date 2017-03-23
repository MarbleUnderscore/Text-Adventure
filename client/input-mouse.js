var mouse = {
	LEFT: 0,
	RIGHT: 2,
	MIDDLE: 1,

	relativeTo: null,

	pos: {
		x: 0,
		y: 0
	},

	down: [],
	justDown: [],
	justUp: [],

	init: function(_selector){
		this.relativeTo = document.querySelector(_selector);
		document.addEventListener('mouseup', this.on_up.bind(this));
		document.addEventListener('mousedown', this.on_down.bind(this));
		document.addEventListener('mousemove', this.on_move.bind(this));
	},

	update: function(){
		this.justDown=[];
		this.justUp=[];
	},

	// event handlers
	on_down:function(event){
		if(this.down[event.button]!==true){
			this.down[event.button]=true;
			this.justDown[event.button]=true;
		}
	},
	on_up:function(event){
		this.down[event.button]=false;
		this.justDown[event.button]=false;
		this.justUp[event.button]=true;
	},
	on_move:function(event){
		this.pos.x = event.pageX - this.relativeTo.offsetLeft;
		this.pos.y = event.pageY - this.relativeTo.offsetTop;
	},

	// api
	isDown: function(_button){
		return this.down[_button] === true;
	},
	isJustDown: function(_button){
		return this.justDown[_button] === true;
	},
	isUp: function(_button){
		return !this.isDown(_button);
	},
	isJustUp: function(_button){
		return this.justUp[_button] === true;
	}
};