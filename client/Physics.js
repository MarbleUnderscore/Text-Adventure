function Physics(){
	// eyyy
};

Physics.collisionUpdate = function(__entity){
	var collisionResponses = [];

	// assume player isn't touching anything until proven otherwise
	__entity.grounded = false;
	__entity.walled = false;

	// get direction unit vector
	var _length = Math.sqrt(__entity.vx*__entity.vx+__entity.vy*__entity.vy);
	var _d = {
		x: __entity.vx / _length,
		y: __entity.vy / _length
	};

	var _iterations = 0;
	var _maxIterations = Math.ceil(_length);
	while(_iterations < _maxIterations){
		// if both collided, we can quit early
		if(Math.abs(_d.x) + Math.abs(_d.y) <= 0.0001){
			break;
		}
		
		// x
		__entity.x += _d.x;
		if(this.leftOfWorld(__entity) || this.rightOfWorld(__entity) || this.collide(__entity)){
			// hit wall
			
			if(this.leftOfWorld(__entity)){
				// out-of-bounds left wall
				collisionResponses.push({
					type: 'entity->outOfBounds',
					direction: 'left'
				});
			}else if(this.rightOfWorld(__entity)){
				// out-of-bounds right wall
				collisionResponses.push({
					type: 'entity->outOfBounds',
					direction: 'right'
				});
			}else{
				// hit a normal wall
				
				if(!__entity.walled && Math.abs(__entity.vx) > 1){
					// just hit the wall
					collisionResponses.push({
						type: 'entity->wall',
						direction: _d.x,
						speed: __entity.vx
					});
				}

				// stop entity from moving
				__entity.vx = 0;
			}

			__entity.x -= _d.x; // move x back 1 iteration to push entity out of wall
			_d.x = 0; // we collided, so don't try to move x anymore
			__entity.walled = true;
		}

		// y
		__entity.y += _d.y;
		if(this.aboveWorld(__entity) || this.belowWorld(__entity) || this.collide(__entity)){
			// hit roof/ceiling

			if(this.aboveWorld(__entity)){
				// out-of-bounds ceiling
				collisionResponses.push({
					type: 'entity->outOfBounds',
					direction: 'up'
				});
			}else if(this.belowWorld(__entity)){
				// out-of-bounds ground
				collisionResponses.push({
					type: 'entity->outOfBounds',
					direction: 'down'
				});
				__entity.grounded = true;
			}else{
				// hit a normal roof/ceiling
				
				if(_d.y > 0){
					__entity.grounded = true;

					if(__entity.vy > 1){
						// land
						collisionResponses.push({
							type: 'entity->ground',
							direction: _d.y,
							speed: __entity.vy
						});
					}else if(__entity.vy < -1){
						// bump head
						collisionResponses.push({
							type: 'entity->ground',
							direction: _d.y,
							speed: __entity.vy
						});
					}
				}

				// stop entity from moving
				__entity.vy = 0;
			}

			__entity.y -= _d.y; // move y back 1 iteration to push entity out of ground/ceiling
			_d.y = 0; // we collided, so don't try to move y anymore
		}
		
		_iterations += 1;
	}


	return collisionResponses;
};


Physics.getTileFromMap = function(x,y){
	var r = world.rows[y];
	if (r) {
		return r.cols[x];
	}
	return null;
};

Physics.getTileFromWorld = function(x,y){
	var p = this.worldToMap(x,y);
	return this.getTileFromMap(p.x,p.y);
};

Physics.worldToMap = function(x,y){
	return {x:Math.floor(x/CHARACTER_WIDTH), y:Math.floor(y/CHARACTER_HEIGHT)};
};

Physics.collide = function(__entity){
	var tl = this.getTileFromWorld(__entity.left(), __entity.top());
	var tr = this.getTileFromWorld(__entity.right(), __entity.top());
	var bl = this.getTileFromWorld(__entity.right(), __entity.bottom());
	var br = this.getTileFromWorld(__entity.left(), __entity.bottom());
	var res =
		(tl && tl.solid) ||
		(tr && tr.solid) ||
		(bl && bl.solid) ||
		(br && br.solid);
	return res;
};

Physics.leftOfWorld = function(__entity){
	return __entity.left() < 0;
};
Physics.rightOfWorld = function(__entity){
	return __entity.right() > size.x;//world.getWidthInPixels();
};
Physics.aboveWorld = function(__entity){
	return __entity.top() < 0;
};
Physics.belowWorld = function(__entity){
	return __entity.bottom() > size.y;//world.getHeightInPixels();
};