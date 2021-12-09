//global variables which can be changed


//player
const tolerance = 5;	//the enemy must come close to player-radius - tolerance
const player_min_speed = 0.2; 	//min speed when moving, not when stationary
const player_max_speed = 6;
const player_speed_acceleration = 1.1;
const player_active_decelleration = 0.9;
const player_passive_decelleration = 0.97;
const new_score_to_life_param = 2;
const volume_inc_player = 314;	//10*pi, change in volume when player gets hit

const player_projectile_speed = 5;
var default_shoot_frequency = 300;	//all x miliseconds one shot
var score_to_new_life = 250;

//powerups
const powerup_spawnrate = 10000; //in ms
const powerup_duration = 4500;	//in ms



//enemies
const volume_inc = 3*314;		//30*pi, change in volume when enemy gets hit
var spawninterval = 1000;	//time in ms until next enemy spawns
const difficulty_increase = 5; //value which gets substracted from spawninterval each second
const max_radius = 50;	//max-radius of enemies
const min_radius = 5;		//min radius of enemies
const game_speed = 0.5;	//determines how fast the enemies move



//performance
const friction = 0.985;	//determines how fast the particles fade out and decellerate

const number_of_past_frames = 10;	//for motion blur
const max_particle_lifetime = 5;

//sounds
var playsounds = true;	//only controls background sound
