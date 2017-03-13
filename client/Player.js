function Player(){
	this.spr = new PIXI.Container();

	this.hit = [-4,-14,3,-2];

	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
	
	this.grounded = false;
	this.walled = false;
	this.flipped = false;

	var g = new PIXI.Graphics();
	g.beginFill(0);
	g.drawRect(this.hit[0],this.hit[1],this.hit[2]-this.hit[0],this.hit[3]-this.hit[1]);
	g.endFill();

	this.spr.addChild(g);
}

Player.prototype.left = function(){
	return this.x + this.hit[0];
};
Player.prototype.right = function(){
	return this.x + this.hit[2];
};
Player.prototype.top = function(){
	return this.y + this.hit[1];
};
Player.prototype.bottom = function(){
	return this.y + this.hit[3];
};

Player.prototype.update = function(){
	this.spr.x = this.x;
	this.spr.y = this.y;

	// TODO:
	// update animation state
	if(this.walled && !this.grounded){
		// holding wall
	}else{
		// other
	}

	// flip sprite
	this.spr.scale.x = this.flipped ? -1 : 1;

	// stop from sliding at very slow speeds
	if(Math.abs(this.vx) < 0.01){
		this.vx = 0;
	}if(Math.abs(this.vy) < 0.01){
		this.vy = 0;
	}
};

Player.prototype.canJump = function(){
	return this.grounded || this.walled;
};
Player.prototype.canWalljump = function(){
	return !this.grounded && this.walled;
};