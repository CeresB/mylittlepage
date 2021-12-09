//fetch elemts from HTML
const canvas = document.getElementById('mainCanvas');			//the one which should be invisible
const scoreEl = document.getElementById('scoreEl');
const bigScoreEl = document.getElementById('bigScoreEl');
const startGameBtn = document.getElementById('startGameBtn');
const muteMusicBtn = document.getElementById('muteMusicBtn');
const highscoreEl = document.getElementById('highscoreEl');

//not necessary, jQuery deals with these two
// const showHighscoreBtn = document.getElementById('showHighscoreBtn');
// const returnBtn = document.getElementById('returnBtn');

//const forceMobileBtn = document.getElementById('forceMobileBtn');
const modelEl = document.getElementById('modelEl');
const joyContainer = document.getElementById('joystickContainer');

//make buffer-canvas
var bufferCanvas = document.createElement('canvas');	//the one we actually use in the end
bufferCanvas.width = innerWidth;
bufferCanvas.height = innerHeight;

//get contexts
const c = canvas.getContext('2d'); //API von dem canvas, genannt context
var bufferC = bufferCanvas.getContext('2d');


//images
var player_img = document.createElement('img');
player_img.src = 'images/player img.png';
var instructions = new Image();
instructions.src = 'images/instructions.jpg';
var scale_factor = 1;	//scales all the objects and the introduction picture, will be set later


//sounds
const background_sound = new Audio("sounds/background_music.mp3"); // buffers automatically when created
background_sound.loop = true;
background_sound.volume = 0.5;
const hit_sound_src = "sounds/hit_sound.mp3";
const shot_sound_src = "sounds/shot_sound.mp3";
const enemy_death_sound_src = "sounds/enemy_death.wav";
const player_hit_sound_src = "sounds/player_hit.wav";
const player_death_sound_src = "sounds/player_death.mp3";
const start_sound_src = "sounds/start_sound.wav";
const freeze_src = "sounds/freeze.wav";
const explosion_src = "sounds/explosion.wav";
const invincible_src = "sounds/invincible.wav";
const machine_gun_src = "sounds/machine-gun.wav";

var hit_sound, shot_sound, enemy_death_sound, player_hit_sound, player_death_sound, invincible_sound, freeze_sound, explosion_sound, machine_gun_sound;

//load music pieces from memory or storage?
//uncomment the following lines for local use and commend the 4 lines below in
 var fileBlob_hit_sound;
fetch(hit_sound_src)
    .then(function(response) {return response.blob()})
    .then(function(blob) {
        fileBlob_hit_sound=URL.createObjectURL(blob);
        new Audio(fileBlob_hit_sound); // forces a request for the blob
 });
 var fileBlob_shot_sound;
 fetch(shot_sound_src)
	 .then(function(response) {return response.blob()})
	 .then(function(blob) {
		fileBlob_shot_sound=URL.createObjectURL(blob);
		 new Audio(fileBlob_shot_sound); // forces a request for the blob
  });
  var fileBlob_enemy_death_sound;
  fetch(enemy_death_sound_src)
	  .then(function(response) {return response.blob()})
	  .then(function(blob) {
		fileBlob_enemy_death_sound=URL.createObjectURL(blob);
		  new Audio(fileBlob_enemy_death_sound); // forces a request for the blob
   });
   var fileBlob_player_hit_sound;
   fetch(player_hit_sound_src)
	   .then(function(response) {return response.blob()})
	   .then(function(blob) {
		fileBlob_player_hit_sound=URL.createObjectURL(blob);
		   new Audio(fileBlob_player_hit_sound); // forces a request for the blob
		});
   var fileBlob_freeze_sound;
   fetch(player_hit_sound_src)
	   .then(function(response) {return response.blob()})
	   .then(function(blob) {
		fileBlob_freeze_sound=URL.createObjectURL(blob);
		   new Audio(fileBlob_freeze_sound); // forces a request for the blob
		});
   var fileBlob_explosion_sound;
   fetch(player_hit_sound_src)
	   .then(function(response) {return response.blob()})
	   .then(function(blob) {
		fileBlob_explosion_sound=URL.createObjectURL(blob);
		   new Audio(fileBlob_explosion_sound); // forces a request for the blob
		});
   var fileBlob_invincible_sound;
   fetch(player_hit_sound_src)
	   .then(function(response) {return response.blob()})
	   .then(function(blob) {
		fileBlob_invincible_sound=URL.createObjectURL(blob);
		   new Audio(fileBlob_invincible_sound); // forces a request for the blob
		});
	  var fileBlob_machine_gun_sound;
   fetch(player_hit_sound_src)
	   .then(function(response) {return response.blob()})
	   .then(function(blob) {
		fileBlob_machine_gun_sound=URL.createObjectURL(blob);
		   new Audio(fileBlob_machine_gun_sound); // forces a request for the blob
	});

// var fileBlob_hit_sound = hit_sound_src;
// var fileBlob_shot_sound = shot_sound_src;
// var fileBlob_enemy_death_sound = enemy_death_sound_src;
// var fileBlob_player_hit_sound = player_hit_sound_src;
// var fileBlob_freeze_sound = freeze_src;
// var fileBlob_explosion_sound = explosion_src;
// var fileBlob_invincible_sound = invincible_src;
// var fileBlob_machine_gun_sound = machine_gun_src;

//global variables which should not be messed with
var player, projectiles, enemies, particles, powerups; //array which keeps track of all the objects
var spawnloop, shoot_loop;
var animationId;
var pointerX = 0;
var pointerY = 0;
var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;
var framewindow = 0;	//distance in time to the last frame
var time_last_frame = 0;
var time_this_frame = 0;
var game_mode = 1; 	//0 = stop, 1 = waiting for start, 2 = running


//extras for playing on mobile
var touchDevice = ('ontouchstart' in document.documentElement);	//detects if player is on mobile
var joyX, joyY;
var joyWASD = new JoyStick('joy1Div');
var joyPointer = new JoyStick('joy2Div');
joyContainer.style.display = 'none';

//transfer joystick inputs to WASD
touch_check = setInterval(function(){
	joyX=joyWASD.GetX();
	joyY=joyWASD.GetY();
	//console.log(joyX, joyY);
	
	//middle: 0|0. Values go from 100 to -100. See here: http://bobboteck.github.io/joy/joy.html
	if(joyX < -50){
		keyA = true;
		keyD = false;
	}
	else if(joyX > 50){
		keyA = false;
		keyD = true;
	}
	else{
		keyA = false;
		keyD = false;		
	}

	if(joyY > 50){
		keyW = true;
		keyS = false;
	}
	else if(joyY < -50){
		keyW = false;
		keyS = true;
	}
	else{
		keyW = false;
		keyS = false;		
	}

}, 25); //25ms



class Projectile {	//base-model for all the other classes

	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius*scale_factor;
		this.color = color;
		this.velocity = velocity;
		this.lives = Math.round((radius*scale_factor*radius*scale_factor*3.14)/(volume_inc*scale_factor));
		
		this.positionArray = [];
		this.createPosArray();

		//will not be inherited:
		this.max_pos = {x: innerWidth+radius*2, y: innerHeight+radius*2};
		this.min_pos = {x: 0 - radius*2, y: 0 - radius*2};
	};

	createPosArray(){	//save last X-positions so they can be displayed
		for(let i=0; i<number_of_past_frames; i++){
			this.positionArray.push({x: this.x, y: this.y});
		}
	}

	drawpos(pos, opague){
		bufferC.beginPath();
		bufferC.arc(pos.x, pos.y, this.radius, 0, Math.PI*2, false);	//Position des Stifts, dreht von 0 bis 360 grad, dreht nicht gegen den Uhrzeigersinn
		bufferC.fillStyle = this.color;

		//we don't want globalalpha to change forever, so we need to restore it
		bufferC.globalAlpha = opague;
		bufferC.fill();	//so that we don't just have an infinitely thin line
		bufferC.globalAlpha = 1;
	};

	draw(opague){
		//delete oldest element in array
		this.positionArray.shift();

		//add current pos to array
		this.positionArray.push({x: this.x, y: this.y});

		for(let i=1; i<number_of_past_frames; i++){
			this.drawpos(this.positionArray[i], opague*i*1/number_of_past_frames*framewindow);
		}
	};

	update(projectile_index){
		this.draw(1);
		//update position only if it stays within the borders
		if (this.x + this.velocity.x - this.radius > this.min_pos.x && this.x + this.velocity.x + this.radius < this.max_pos.x ){
			this.x += this.velocity.x*framewindow;
		}
		else {	//e.g. we hit the x-border
			this.border_violation(1, projectile_index);
		}

		if (this.y + this.velocity.y - this.radius > this.min_pos.y && this.y + this.velocity.y + this.radius < this.max_pos.y ){
			this.y += this.velocity.y*framewindow;
		}
		else {	//e.g. we hit the y-border
			this.border_violation(0, projectile_index);
		}
	}

	border_violation(x, projectile_index){	//x or y border? x == 1 -->x, x==0 -->y
		//it hit the border, now want to the projectile to kill itself
		this.death(projectile_index);
	}

	death(projectile_index){
		//remove this projectile from the projectiles array
		projectiles.splice(projectile_index, 1);		
	}
}


class Particle extends Projectile{
	constructor(x, y, radius, color, velocity, velocity_modifier){
		super(x, y, radius, color, velocity);	//call parent constructor

		this.velocity_modifier = velocity_modifier;
		this.lifetime = Math.random()*max_particle_lifetime;
		this.friction = 0.985;
		//old_draw = Projectile.draw();
	}


	update(particle_index){

		if (this.lifetime > 0){
			//particles are so small we do not need to draw the past X-positions, the current is enough
			this.drawpos({x: this.x, y: this.y}, this.lifetime)
			//let them decellerate
			this.velocity.x *= this.friction;
			this.velocity.y *= this.friction;
			//update position
			this.x += this.velocity.x*framewindow;
			this.y += this.velocity.y*framewindow;
			//decrease lifetime
			this.lifetime -= 0.01*framewindow;
			//decrease the radius as well. Avoid negative value!
			this.radius *= this.friction;
		}
		else{
			this.death(particle_index);
		}		
	}

	death(particle_index){
		particles.splice(particle_index, 1);
	}
}


class Player extends Projectile {
	constructor(x, y, radius, color, velocity, lives) {
		super(x, y, radius, color, velocity)
		//overwrite lives
		this.lives = lives;

		//overwrite allowed position space
		this.max_pos = {x: innerWidth, y: innerHeight};
		this.min_pos = {x: 0, y: 0};
		this.moveallow = 1;
		this.invincibility = false;
		this.shoot_frequency = default_shoot_frequency;
	};

	powerupHandler(powerup_type){
		clearTimeout(powerup_timeout);

		switch (powerup_type){
			case 0: //invincibility
				this.invincibility = true;
				player_img.src = 'images/player img invincible.png';

				invincible_sound = new Audio(fileBlob_invincible_sound);
				invincible_sound.volume = 1;
				invincible_sound.play();
				break;
			case 1: //2x shooting speed
				//this.shoot_frequency /= 2;
				//this.change_shooting(this.shoot_frequency);
				this.change_shooting(default_shoot_frequency/2);
				player_img.src = 'images/player img double dmg.png';

				machine_gun_sound = new Audio(fileBlob_machine_gun_sound);
				machine_gun_sound.volume = 1;
				machine_gun_sound.play();
				break;
			case 2: //freeze enemies
				enemies.forEach((enemy, enemy_index) => {
					enemy.frozen = true;
				});
				player_img.src = 'images/player img freeze.png';

				freeze_sound = new Audio(fileBlob_freeze_sound);
				freeze_sound.volume = 1;
				freeze_sound.play();
				break;
		}		

		powerup_timeout=setTimeout(function() {
			//this.sth does not work here, because some time passed the pc looses reference

			// switch (powerup_type){
			// 	case 0: //vincibility
			// 		player.invincibility = false;
			// 		//invincible_sound.pause();
			// 		break;
			// 	case 1: //1x shooting speed
			// 		player.change_shooting(default_shoot_frequency);
			// 		break;
			// 	case 2:	//defreeze enemies
			// 		enemies.forEach((enemy, enemy_index) => {
			// 			enemy.frozen = false;
			// 		});
			// 		break;
			// }

			player.invincibility = false;
			player.change_shooting(default_shoot_frequency);
			enemies.forEach((enemy, enemy_index) => {
				enemy.frozen = false;
			});

			player_img.src = 'images/player img.png';
		}, powerup_duration);
	}

	drawpos(pos, opague){
		bufferC.beginPath();
		bufferC.arc(pos.x, pos.y, this.radius, 0, Math.PI*2, false);	//Position des Stifts, dreht von 0 bis 360 grad, dreht nicht gegen den Uhrzeigersinn
		//bufferC.fillStyle = this.color;
		//we don't want globalalpha to change forever, so we need to restore it
		bufferC.globalAlpha = opague;
		//bufferC.fill();	//so that we don't just have an infinitely thin line
		bufferC.globalAlpha = 1;
		
		//these lines are special for player
		bufferC.drawImage(player_img, this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2);
	};

	player_update(){
		if(this.moveallow == 1){
			this.update(1);	//update position
			this.update_velocity();	//update player velocities because of keyinputs
		}
	};

	shoot(){
		//find angle to know where its heading
		
		var angle = Math.atan2(pointerY - player.y, pointerX - player.x);

		if(touchDevice){
			//overwrite angle calculated with mouse with angle calculated with joystick-Pointer
			angle = -Math.atan2(joyPointer.GetY(), joyPointer.GetX());
		}

		projectiles.push(new Projectile(player.x, player.y, 5, 'white', {x: Math.cos(angle)*player_projectile_speed, y: Math.sin(angle)*player_projectile_speed}, 1));
				
		shot_sound = new Audio(fileBlob_shot_sound);
		shot_sound.volume = 0.1;
		shot_sound.play();
	}

	auto_shooting(shoot_frequency){
		console.log(shoot_frequency);
		shoot_loop = setInterval(() =>{
			if(document.visibilityState == 'visible'){			
				this.shoot();
			}		
		}, shoot_frequency);
	}

	change_shooting(new_frequency){
		clearInterval(shoot_loop);
		this.auto_shooting(new_frequency);
	}

	update_velocity(){	//update player velocity
		if (keyD == true) {
			//when very little speed, get speed to minimal speed
			if (this.velocity.x < player_min_speed && this.velocity.x > -player_min_speed){
				this.velocity.x = player_min_speed;
			}	//we want to go in a different direction then we are moving to --> decelleration
			else if (this.velocity.x < 0){
				this.velocity.x *= player_active_decelleration;
			}	//acceleration
			else if (this.velocity.x < player_max_speed){
				this.velocity.x *= player_speed_acceleration;
			}
		}
		  
		if (keyS == true) {
	
			if (this.velocity.y < player_min_speed && this.velocity.y > -player_min_speed){
				this.velocity.y = player_min_speed;
			}
			else if (this.velocity.y < 0){
				this.velocity.y *= player_active_decelleration;
			}
			else if (this.velocity.y < player_max_speed){
				this.velocity.y *= player_speed_acceleration;
			}
		}
	
		if (keyA == true) {
	
			if (this.velocity.x < player_min_speed && this.velocity.x > -player_min_speed){
				this.velocity.x = -player_min_speed;
			}
			else if (this.velocity.x > 0){
				this.velocity.x *= player_active_decelleration;
			}
			else if (this.velocity.x > -player_max_speed){
				this.velocity.x *= player_speed_acceleration;
			}
		}
	
		if (keyW == true) {
	
			//are we fast enough?
			if (this.velocity.y < player_min_speed && this.velocity.y > -player_min_speed){
				this.velocity.y = -player_min_speed;
			}
			else if (this.velocity.y > 0){
				this.velocity.y *= player_active_decelleration;
			}
			else if (this.velocity.y > -player_max_speed){
				this.velocity.y *= player_speed_acceleration;
			}
		}
	
		//passive decelleration
		if (keyW == false && keyS == false){
			this.velocity.y *= player_passive_decelleration;
		}
		if (keyA == false && keyD == false){
			this.velocity.x *= player_passive_decelleration;
		}	
	
		//console.log('current velocity: ' + player.velocity.x + '  ' + player.velocity.y);	
	};

	got_hit(){
		//console.log(this);
		if (this.invincibility == true){
			//do nothing
		}
		else if(this.lives > 1){
			//play sound
			player_hit_sound = new Audio(fileBlob_player_hit_sound);
			player_hit_sound.volume = 0.6;
			player_hit_sound.play();

			//create particle effect and substract a life
			particle_explosion(this.x, this.y, this.radius*2, this.color, 3);
			this.lives--;
	
			//shrink player radius --> negative sign for volume_inc
			var new_radius = Math.sqrt(this.radius*this.radius - volume_inc_player*scale_factor/3.14)
			if (new_radius < 8*scale_factor || isNaN(new_radius)){
				new_radius = 8*scale_factor;
			}
			gsap.to(this, {radius: new_radius});
			this.radius = new_radius;
		}
		else{
			this.death();
		}
	};

	death(){			
		//play sound
		player_death_sound = new Audio(player_death_sound_src);
		player_death_sound.volume = 0.6;
		player_death_sound.play();
		
		//cancel game
		this.radius = 1;
		end_game(this);
	};

	border_violation(x, projectile_index){	//x or y border? x == 1 -->x, x==0 -->y
		//we hit the border, want to bounce back with 0.5 times the speed
		if(x==1){
			this.velocity.x = -this.velocity.x/Math.abs(this.velocity.x) *0.8*Math.abs(this.velocity.x);
		}
		else{
			this.velocity.y = -this.velocity.y/Math.abs(this.velocity.y) *0.8*Math.abs(this.velocity.y);
		}
	}
}


class Enemy extends Projectile {
	constructor(x, y, radius, color, velocity, velocity_modifier){
		super(x, y, radius, color, velocity);	//call parent constructor

		//small enemies fast, bigger ones slower:
		this.velocity_modifier = velocity_modifier;
		this.original_radius = radius;
		this.frozen = false;
	};

	update(){
		//it makes no sense to draw the old position of the slow moving enemies
		if (this.velocity_modifier >= 1 || this.frozen == true){	//since enemies spawn with 0 velocity their total speed depends just on this modifier
			if(this.frozen == true){
				this.draw(0.1);
			}
			else {				
				this.draw(1);
			}
		}
		else{
			this.drawpos({x: this.x, y: this.y}, 1);
		}

		if(this.frozen == false){
			//update velocity since player can move
			var angle_enemy = Math.atan2(player.y - this.y, player.x - this.x);
			this.velocity = {
				x: Math.cos(angle_enemy)*this.velocity_modifier,
				y: Math.sin(angle_enemy)*this.velocity_modifier
			}
			//update position
			this.x += this.velocity.x*framewindow;
			this.y += this.velocity.y*framewindow;	
		}				
	};

	got_hit(enemy_index){
		//particle explosion in animation-func so that it explodes where the projectile hit
		//console.log('enemy hit');
		
		//shrink enemy or remove him
		if (this.lives > 1){
			this.lives--;
			//gsap for smooth shrinking animation:
			var new_radius = Math.sqrt(this.radius*this.radius - (volume_inc*scale_factor)/3.14);
			if(new_radius < 10*scale_factor || isNaN(new_radius)){
				new_radius = 9*scale_factor;
			}
			gsap.to(this, {radius: new_radius});	//gsap does not update the radius-value, so we do it manually
			this.radius = new_radius;

			inc_score(5);
			
			hit_sound = new Audio(fileBlob_hit_sound);
			hit_sound.volume = 0.3;
			hit_sound.play();
			//console.log(this.lives, this.radius);
		}
		else {
			//remove enemy from the screen
			this.death(enemy_index);
			//increase score
			inc_score(10);
		}
	}

	death(enemy_index){
		//play sound
		if(game_mode == 2){	//no sounds if game is not running, which means the player died and all the enemies are killed at once
			enemy_death_sound = new Audio(fileBlob_enemy_death_sound);
			enemy_death_sound.volume = 0.3;
			enemy_death_sound.play();
		}

		particle_explosion(this.x, this.y, this.radius*2, this.color, 3);
		//projectile explosion needed as well

		setTimeout(() => {		//withpot this timeout, projectiles will be added immetiately and mess up animation-function which is in the process of looping through each projectile	
			projectile_explosion(this.x, this.y, (this.original_radius*this.original_radius)/500 - 1, player.color, 2);	//-1 so that the little ones do not have this feature
		}, 0)

		//remove this enemy from the enemies array
		enemies.splice(enemy_index, 1);
		//console.log('enemy destroyed');
	}
}

class Powerup{
	constructor(){
		this.x = Math.random()*canvas.width;
		this.y = Math.random()*canvas.height;
		this.radius = 20;
		this.color = 'white';
		this.type = Math.round(Math.random()*3);
	}

	update(){
		this.drawpos();
	}

	drawpos(){
		bufferC.beginPath();
		bufferC.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);	//Position des Stifts, dreht von 0 bis 360 grad, dreht nicht gegen den Uhrzeigersinn
		bufferC.fillStyle = this.color;
		bufferC.fill();	//so that we don't just have an infinitely thin line
	};

	got_hit(powerup_index){
		
		console.log(this.type);

		if (this.type == 3){
			projectile_explosion(this.x, this.y, 10, this.color, 3);

			explosion_sound = new Audio(fileBlob_explosion_sound);
			explosion_sound.volume = 1;
			explosion_sound.play();
		}
		else{
			player.powerupHandler(this.type);
		}

		this.death(powerup_index);
	}

	death(powerup_index){
		powerups.splice(powerup_index, 1);
	}
}


var spawninterval_bak = spawninterval;
var powerup_timeout;

function init(){	//resets everything so that the game can start
	//maybe window got resized --> get the parameters anew!
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	scale_factor = (canvas.width/4)/instructions.width;	//instructions soll 1/4 der screenbreite einnehmen

	player = new Player(canvas.width/2, canvas.height/2, 20, 'white', {x: 0, y: 0}, 3);	//3 lives

	//reset changeables to default values
	projectiles = [];
	particles = [];
	enemies = [];
	powerups = [];
	spawninterval = spawninterval_bak;
	score = 0;
	shadow_score = 0;
	scoreEl.innerHTML = score;

	game_mode = 1;	//equals waiting for start

	if (playsounds){
		background_sound.currentTime = 0;	//reset to start
		background_sound.play();
	}

	animate();		//animate loops trough itself and draws the screen
	//console.log(scale_factor);

	setTimeout(function() {		
		game_mode = 2;	//game is running
		spawnEnemies();
		//enemies.push(new Enemy(100, 100, 30, `hsl(${Math.random()*360}, 50%, 50%)`, {x:0,y:0}, (max_radius/30)*game_speed));	//test-enemy
		player.change_shooting(default_shoot_frequency);
		spawnPowerups();		
	}, 3000);
}

var loop;
var spawnPowerupsInterval;

function spawnPowerups(){
	spawnPowerupsLoop=setInterval(() => {
		powerups.push(new Powerup());
	}, powerup_spawnrate);
}

function spawnEnemies() {
	
	spawnloop = setInterval(() =>{
		clearInterval(loop);
		spawnInTime(spawninterval);
		
		//protection against negative value
		if (spawninterval - difficulty_increase > 1){			
			spawninterval -= difficulty_increase;
		}
		else{
			spawninterval = 1;
		}
		//console.log(spawninterval);
	}, 1000);
}

function spawnInTime(interval){
	loop = setInterval(() => {
	if(document.visibilityState == 'visible'){
		spawn_enemy();
	}
	}, interval);
}

function spawn_enemy(){
	const radius_enemy = Math.random()*(max_radius - min_radius) + min_radius;	//random value from 5 to 30
		
		var x_enemy = 0;
		var y_enemy = 0;
		if (Math.random() < 0.5){
			x_enemy = Math.random() < 0.5 ? 0 - radius_enemy : canvas.width + radius_enemy;
			y_enemy = Math.random()*canvas.height;
		}
		else {
			x_enemy = Math.random()*canvas.width;
			y_enemy = Math.random() < 0.5 ? canvas.height + radius_enemy : 0 - radius_enemy;
		}
		
		//const color_enemy = 'green';
		const color_enemy = `hsl(${Math.random()*360}, 50%, 50%)`;	//huge saturation light, value goes from 0 to 360. $-sign so that there is computation before string
		
		enemies.push(new Enemy(x_enemy, y_enemy, radius_enemy, color_enemy, {x:0,y:0}, (max_radius/radius_enemy)*game_speed));	//last argument is velocity_modifier
		//console.log(enemies);
}

function end_game(player){
	clearInterval(spawnloop);
	clearInterval(loop);
	clearInterval(shoot_loop);
	clearInterval(spawnPowerupsLoop);

	//reset game mode
	game_mode = 0;

	//disable player movement
	player.moveallow = 0;
	
	//spectacular explosion
	particle_explosion(player.x, player.y, 25, player.color, 1);
	
	//kill all enemies
	enemies.forEach((enemy, enemy_index) => {
		enemy.death(enemy_index);
	});
	enemies = [];
	//kill all player projectiles
	setTimeout(() => {	
		projectiles = [];
	}, 10)
	

	//stop music
	background_sound.pause();
	
	setTimeout(function() {
		cancelAnimationFrame(animationId);		
	  }, 3000);

	//update big score
	modelEl.style.display = 'block';	//re-activate overlay
	bigScoreEl.innerHTML = score;
	console.log('game ended');
}

function particle_explosion(posx, posy, amount, color, max_size){
	for (let i = 0; i < amount; i++){
		particles.push(new Particle(
			posx, 
			posy, 
			Math.random()*max_size, //radius
			color, 
			{x: (Math.random() -0.5)*Math.random()*5, y: (Math.random() - 0.5)*Math.random()*5}));
	}
}

function projectile_explosion(posx, posy, amount, color, max_size){
	for (let i = 0; i < amount; i++){
		//want same speed, but still random directions		
		let speed = Math.random();

		let signx = (Math.random() - 0.5);
		signx = signx/Math.abs(signx);

		let signy = (Math.random() - 0.5);
		signy = signy/Math.abs(signy);

		//split speed-budget on x and y axis
		let speedx = Math.random()/speed;
		let speedy = Math.sqrt(Math.abs(speed*speed-speedx*speedx));

		//Math.random()*(max_radius - min_radius) + min_radius;

		projectiles.push(new Projectile(
			posx, 
			posy, 
			max_size, //radius
			color, 
			{x: signx*speedx*3, y: signy*speedy*3}));
	}
}

function inc_score(value){
	score += value;
	scoreEl.innerHTML = score;
}

function frame_timer(){
	time_last_frame = time_this_frame;
	time_this_frame = performance.now();	//in ms
	framewindow = (time_this_frame - time_last_frame)/16;	//the value of 16 is so that on developers computer framewindow is roughly one	
	//console.log(framewindow);
}

function animate(){

	animationId = requestAnimationFrame(animate);	//create frame and then call this function again	

	if(document.visibilityState != 'visible'){		
		//do not update anything
	}
	else{
		//update frame-timer		
		frame_timer();

			//do all the drawing
			bufferC.fillStyle = 'rgba(0, 0, 0)';	//draw black rectangle to erase whole screen
			bufferC.fillRect(0, 0, canvas.width, canvas.height);
	
			if(game_mode == 1){	//-->draw instructions-image only on start
				bufferC.drawImage(instructions, canvas.width/2-(instructions.width*scale_factor)/2, canvas.height/2-(instructions.height*scale_factor), instructions.width*scale_factor, instructions.height*scale_factor);
			}
			
			//all the updates include drawing so do them first
			powerups.forEach((powerup, powerup_index) => {
				powerup.update();

				//collision with projectiles detection
				projectiles.forEach((projectile, projectile_index) =>{
					const distance = Math.hypot(projectile.x - powerup.x, projectile.y - powerup.y);
			
					if (distance <= (powerup.radius + projectile.radius)){ //then its a hit!
						//remove projectile
						projectile.death(projectile_index);
						//deal with enemy & score
						powerup.got_hit(powerup_index);	
						//create particle effects
						particle_explosion(projectile.x, projectile.y, powerup.radius*2, powerup.color, 5);						
					}
				});
			});

			player.player_update();
	
			particles.forEach((particle, particle_index) => {		//in {} is the function which aplies
				particle.update();
			});
	
			projectiles.forEach((projectile, projectile_index) => {		//in {} is the function which aplies
				projectile.update(projectile_index);
			});	
	
			enemies.forEach((enemy, enemy_index) => {	
				enemy.update();
			
				//collision with projectiles detection
				projectiles.forEach((projectile, projectile_index) =>{
					const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
			
					if (distance <= (enemy.radius + projectile.radius)){ //then its a hit!
						//remove projectile
						projectile.death(projectile_index);
						//deal with enemy & score
						enemy.got_hit(enemy_index);	
						//create particle effects
						particle_explosion(projectile.x, projectile.y, enemy.radius*2, enemy.color, 3);						
					}
				});
			
				//collision with player detection
				if(Math.hypot(enemy.x - player.x, enemy.y - player.y) < (enemy.radius + player.radius - tolerance)){
					player.got_hit();
					//kill the enemy on hit if player has enough lives
					if (player.lives > 0){	//player has already lost a life in player.got_hit() so he has at least 1 life now
						enemy.death(enemy_index);
					}
				}
			
			});
	
			
	
			c.drawImage(bufferCanvas, 0, 0);
			
			//if score reaches a certain value, add a life (-> increase player radius!). Gets more difficult over time
			if (score-shadow_score > score_to_new_life){
				player.lives++;
				shadow_score += score_to_new_life;
				score_to_new_life *= new_score_to_life_param;
				//want volumen increase by a certain amount --> V_new = V_old + volume_inc --> pi*r_new^2 = pi*r_old^2 + volume_inc
				player.radius = Math.sqrt(player.radius*player.radius + volume_inc_player/3.14);
			}
			
		

	}
	
}



//determine users mouse-position
document.onmousemove = function(event){
	pointerX = event.pageX;
	pointerY = event.pageY;
}

//move player with WASD
addEventListener("keydown", onKeyDown, false);
addEventListener("keyup", onKeyUp, false);	//need to see when key is no longer pressed as well

function onKeyDown(event) {
  var keyCode = event.keyCode;
  switch (keyCode) {
    case 68: //d
      keyD = true;
      break;
    case 83: //s
      keyS = true;
      break;
    case 65: //a
      keyA = true;
      break;
    case 87: //w
      keyW = true;
      break;
  }
}

function onKeyUp(event) {
  var keyCode = event.keyCode;

  switch (keyCode) {
    case 68: //d
      keyD = false;
      break;
    case 83: //s
      keyS = false;
      break;
    case 65: //a
      keyA = false;
      break;
    case 87: //w
      keyW = false;
      break;
  }
}

startGameBtn.addEventListener('click', (event) =>{
	start_sound = new Audio(start_sound_src);
	//start_sound.volume = 1;
	start_sound.play();

	console.log('game started');

	if(touchDevice){
		joyContainer.style.display = 'flex';
		instructions.src = "images/instructions_mobile.jpg";
	}
	else{
		clearInterval(touch_check);
	}
	
	modelEl.style.display = 'none';

	/* if(touchDevice == true){
		document.documentElement.requestFullScreen;	//needed for landscape
		screen.orientation.lock("landscape");			//want game to run in landscape mode because we need space for the controllers
	} */
	
	init();	//to reset and start everything	
});

muteMusicBtn.addEventListener('click', (event) =>{
	if(playsounds == false){
		playsounds = true;
		muteMusicBtn.style.background = 'gray';
	}
	else{
		playsounds = false;
		muteMusicBtn.style.background = 'red';
	}
})

// forceMobileBtn.addEventListener('click', (event) =>{

// 	if(touchDevice == false){
// 		touchDevice = true;
// 		forceMobileBtn.style.background = 'red';
// 	}
// 	else{
// 		touchDevice = false;
// 		forceMobileBtn.style.background = 'gray';
// 	}
// })

//just to give jQuery a chance and use it to read JSON. Inspired by: https://w3schools.com/jquery/ajax_getjson.asp
$("#showHighscoreBtn").click(
	function(){
		$('#highscoreEl').show();
		$('#modelEl').hide();

		$("#highscoreList").empty();

	$.getJSON("highscore_list.json", function(result){
		$("#highscoreList").append("<table>");

			$.each(result, function(i, field){
				$("#highscoreList").append("<tr><td>" + field.name + "</td>" + "<td>" + field.score + "</td></tr>");
			});
			
		$("#highscoreList").append("</table>");
		});
	}
);

$("#returnBtn").click(
	function(){
		$('#highscoreEl').hide();
		$('#modelEl').show();
	}
);