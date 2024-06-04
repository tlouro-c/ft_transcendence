import { gameDict, getUserObj, sockets } from "../utils.js";
import { Key } from "./keyboard.js"
import { InputHandler } from "./input.js"
import { gameDictRemote } from "../utils.js"


const PLANEWIDTH = 640, PLANEHEIGHT = 360, PLANEQUALITY = 15;
const WIDTH = 640 + 300;
const HEIGHT = 360 + 0;
const PADDLEWIDTH = 20, PADDLEHEIGHT = 60, PADDLEDEPTH = 10, PADDLEQUALITY = 1;
const HAZARDWIDTH = 20, HAZARDHEIGHT = 150, HAZARDDEPTH = 100, HAZARDQUALITY = 1;

export class RemoteGame{
	constructor(ballOwner){
		this.initialCameraX = 0;
		this.initialCameraY = 0;
		this.is3D = false;
		this.multiPlay = false;
		this.hazardMode = false;
		this.difficulty = 0.2;
		this.score1 = 0;
		this.score2 = 0; 
		this.maxScore = 7;
		this.hazardSpeed = 3;
		this.hazardDir = 1;
		this.keyPressed = false;
		this.multiPressed = false;
		this.hazardPressed = false;
		this.running = false
		this.fieldop = 0;
		this.Stop = function() { this.running = false }

		this.playerInput = new InputHandler("a", "d");

		this.init();

		// Binding the Draw function to ensure it maintains the correct context
		this.Draw = this.Draw.bind(this);
		this.CheckKeyInputs = this.CheckKeyInputs.bind(this);
		this.ChangeField = this.ChangeField.bind(this);
		// this.handleKeyDown = this.handleKeyDown.bind(this);  // Add this line
		// this.handleKeyUp = this.handleKeyUp.bind(this); 
		// window.addEventListener('keydown', this.handleKeyDown, false);
		// window.addEventListener('keyup', this.handleKeyUp, false);
	}

	
	
	init(){
		// create a WebGL renderer, camera and a scene
		this.renderer = new THREE.WebGLRenderer();
		
		// start the renderer
		this.renderer.setSize(WIDTH, HEIGHT);
		
		this.camera1 = new THREE.PerspectiveCamera(
			45, // VIEW_ANGLE
			WIDTH / HEIGHT, // ASPECT
			0.1, // NEAR
			10000 // FAR
		);
		this.camera2 = new THREE.PerspectiveCamera(
			45, // VIEW_ANGLE
			WIDTH / HEIGHT, // ASPECT
			0.1, // NEAR
			10000 // FAR
		)

		// set a default position for the cameras
		this.camera1.position.x = this.initialCameraX;
		this.camera1.position.y = this.initialCameraY;
		this.camera1.position.z = 500;
		
		this.camera2.position.x = this.initialCameraX;
		this.camera2.position.y = this.initialCameraY;
		this.camera2.position.z = 500;
		
		this.scene = new THREE.Scene();

		this.CreateBall();
		this.CreatePaddles();
		this.CreatePlane();
		this.CreateLight();
		this.CreateHazard();

		this.AttachCanvas();
	}

	CreateBall(){
		// sphere
		const radius = 10, segments = 6, rings = 6;
			
		const sphereMaterial = new THREE.MeshLambertMaterial({
			color: 0xF1FFF5,
			wireframe: false
		});
		
		this.ball = new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, rings),
			sphereMaterial
		);
		this.ball.position.x = 0;
		this.ball.position.y = -175;
		this.scene.add(this.ball);
	}

	CreatePaddles(){
		const paddle1Material = new THREE.MeshLambertMaterial({
			color: 0xD43001,
			wireframe: false
		});
		const paddle2Material = new THREE.MeshLambertMaterial({
			color: 0x33A0FF,
			wireframe: false
		});
		
		this.paddle1 = new THREE.Mesh(
			new THREE.BoxGeometry(
				PADDLEWIDTH,
				PADDLEHEIGHT,
				PADDLEDEPTH,
				PADDLEQUALITY,
				PADDLEQUALITY,
				PADDLEQUALITY
			),
			paddle1Material
		);
		this.paddle2 = new THREE.Mesh(
			new THREE.BoxGeometry(
				PADDLEWIDTH,
				PADDLEHEIGHT,
				PADDLEDEPTH,
				PADDLEQUALITY,
				PADDLEQUALITY,
				PADDLEQUALITY
			),
			paddle2Material
		);

		this.paddle1.position.x = -PLANEWIDTH / 2 + PADDLEWIDTH;
		this.paddle2.position.x = PLANEWIDTH / 2 - PADDLEWIDTH;
		this.paddle1.position.z = PADDLEDEPTH / 2;
		this.paddle2.position.z = PADDLEDEPTH / 2;
		
		this.scene.add(this.paddle1);
		this.scene.add(this.paddle2);
		this.paddle1DirY = 0;
		this.paddle2DirY = 0;
	}

	CreatePlane(){
		const planeMaterial = new THREE.MeshLambertMaterial({
			color: 0x237A3C,
			wireframe: false
		});

		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(
				PLANEWIDTH * 0.95,
				PLANEHEIGHT,
				PLANEQUALITY,
				PLANEQUALITY
			),
			planeMaterial
		);
		this.plane.position.z = -10;

		this.scene.add(this.plane);
	}

	CreateLight(){
		const pointLight = new THREE.PointLight(0xF8D898);

		pointLight.position.x = -1000;
		pointLight.position.y = 0;
		pointLight.position.z = 1000;
		pointLight.intensity = 2.9;
		pointLight.distance = 10000;

		this.scene.add(pointLight)
	}

	CreateHazard(){
		const hazardMaterial = new THREE.MeshLambertMaterial({
			color: 0xF333FF,
			wireframe: false
		});
		this.hazardBlock = new THREE.Mesh(
			new THREE.BoxGeometry(
				HAZARDWIDTH,
				HAZARDHEIGHT,
				HAZARDDEPTH,
				HAZARDQUALITY,
				HAZARDQUALITY,
				HAZARDQUALITY
			),
			hazardMaterial
		);
		this.hazardBlock.position.y = HEIGHT/2;
	}

	
	AttachCanvas(){
		document.querySelectorAll(".old-canvas").forEach(element => element.remove())
		const c = document.getElementById("gameCanvasRemote");
		const canvas = this.renderer.domElement;
		canvas.style.width = '100%';
		canvas.style.height = 'auto';
		canvas.classList.add('old-canvas')
		c.appendChild(canvas);
	}

	StartGame() {
		this.running = true
		this.score1 = 0
		this.score2 = 0
		self.game_started = false

		const gameCanvas = document.getElementById('gameCanvasRemote');
		gameCanvas.classList.remove('d-none');
		gameCanvas.style.mixBlendMode = 'lighten'; 
		//document.getElementById('scoreboard').style.display = 'block';
		
		this.multiPlay = true;
		this.Draw();
	}

	Draw() {

		if (this.running == false) {
			return
		}

		if (this.playerInput.field != this.fieldop)
		{
			this.ChangeField();
			this.fieldop = this.playerInput.field;
		}
	
		

		this.renderer.setViewport(0, 0, WIDTH, HEIGHT);
		this.renderer.setScissor(0, 0, WIDTH, HEIGHT);
		this.renderer.setScissorTest(true);
		this.renderer.render(this.scene, this.camera1);
		
		if (this.playerInput.is3d)
			this.CameraWork3D();
		else
			this.CameraWork2D();

		this.CheckHit();
	
		// if (this.hazardMode)
		// 	this.HazardStart();
		// else
		// 	this.scene.remove(this.hazardBlock);
	}

	CheckHit() {
		//verification if the ball colides with de dimesions of the paddle1
		if (this.ball.position.x <= this.paddle1.position.x + PADDLEWIDTH &&
			this.ball.position.x >= this.paddle1.position.x) {
				
				if (this.ball.position.y <= this.paddle1.position.y + PADDLEHEIGHT / 2 &&
				this.ball.position.y >= this.paddle1.position.y - PADDLEHEIGHT / 2) {
				if (this.ballDirX < 0) {
					//strech paddle when hits
					this.paddle1.scale.y = 3;
				}
			}
		}
		//verification if the ball colides with de dimesions of the paddle2
		if (this.ball.position.x <= this.paddle2.position.x + PADDLEWIDTH &&
			this.ball.position.x >= this.paddle2.position.x) {

				if (this.ball.position.y <= this.paddle2.position.y + PADDLEHEIGHT / 2 &&
				this.ball.position.y >= this.paddle2.position.y - PADDLEHEIGHT / 2) {
				if (this.ballDirX > 0) {
					//strech paddle when hits
					this.paddle2.scale.y = 3;
				}
			}
		}
	}
	
	GameUpdate(moveUp, moveDown) {
		if (sockets.gameSocket == null || sockets.gameSocket.readyState !== WebSocket.OPEN || !self.game_started || !this.running) {
			return
		}
		const toSend = {
			"type": "ball",
			"moveUp": moveUp,
			"moveDown": moveDown,
			"user_id": getUserObj().id
		}
		sockets.gameSocket.send(JSON.stringify(toSend))
	}

	CheckKeyInputs() {
		let moveDown = false;
		let moveUp = false;

		if (this.playerInput.keys.length > 0 )
		{
			if (this.playerInput.keys[0] == 'a')
				moveUp = true;
			if (this.playerInput.keys[0] == 'd')
				moveDown = true
		}
		this.GameUpdate(moveUp,moveDown)
	}


	// Rest of the class implementation

// HazardStart()
// {
// 	// if ((this.score1 >= 4 || this.score2 >= 4) && this.hazardMode)
// 		// 	{
// 		// 		this.scene.add(this.hazardBlock);
// 		// 	this.HazardColision();
// 		// }
// 		// this.CheckScoreForHazard();
// 		this.HazardMove();
// 	}
	
// 	// HazardColision() {
// 		// 	// Verify colision
// 		// 	if (this.ball.position.x <= this.hazardBlock.position.x + HAZARDWIDTH / 2 &&
// 		// 		this.ball.position.x >= this.hazardBlock.position.x - HAZARDWIDTH / 2) {
// 			// 			if (this.ball.position.y <= this.hazardBlock.position.y + HAZARDHEIGHT / 2 &&
// 	// 			this.ball.position.y >= this.hazardBlock.position.y - HAZARDHEIGHT / 2) {
// 		// 				// bounce the ball;
// 	// 			this.ballDirX = -this.ballDirX;
// 	// 		}
// 	// 	}
// 	// }
	
// 	HazardMove()
// 	{
// 		// if (this.hazardBlock.position.y >= PLANEWIDTH / 2 - HAZARDWIDTH / 2) {
// 			// 	this.hazardDir = -1;
// 			// } else if (this.hazardBlock.position.y <= -PLANEWIDTH / 2 + HAZARDWIDTH / 2) {
// 				// 	this.hazardDir = 1;
// 		// }
// 		// this.hazardBlock.position.y += this.hazardSpeed * this.hazardDir;
// 		this.hazardBlock.position.y = hazard_y;
// 	}
	
	// CheckScoreForHazard() {
		// 	if (this.score1 >= 5 || this.score2 >= 5) {
			// 		this.hazardSpeed = 5;
	// 	}
	// }

	DoubleCameraWork3D() { 
		this.camera2.position.x = this.paddle2.position.x + 100;
		this.camera2.position.z = this.paddle2.position.z + 100;
		this.camera2.rotation.z = 90 * Math.PI / 180;
		this.camera2.rotation.y = 60 * Math.PI / 180;
		
		this.camera1.position.x = this.paddle1.position.x - 100;
		this.camera1.position.z = this.paddle1.position.z + 100;
		this.camera1.rotation.z = -90 * Math.PI / 180;
		this.camera1.rotation.y = -60 * Math.PI / 180;
	}
	
	CameraWork3D() { 
		this.camera1.position.x = this.paddle1.position.x - 100;
		this.camera1.position.z = this.paddle1.position.z + 100;
		this.camera1.rotation.z = -90 * Math.PI / 180;
		this.camera1.rotation.y = -60 * Math.PI / 180;
	}
	
	CameraWork2D() {
		this.camera1.position.x = 0;
		this.camera1.position.z = 500;
		this.camera1.rotation.z = 0;
		this.camera1.rotation.y = 0;
	}

	ChangeField() {

		var loader = new THREE.TextureLoader();
		switch (this.playerInput.field) {
			case 0:
				var newMaterial = new THREE.MeshLambertMaterial({
					color: 0x237A3C,
					wireframe: false
				});
				this.plane.material = newMaterial;
				break;
			case 1:
				var newMaterial = new THREE.MeshLambertMaterial({
					color: 0x4BD121,
					wireframe: true
				});
				this.plane.material = newMaterial;
				break;
			case 2:
				loader.load('src/assets/fields/basicField.jpg', (texture) => {
				var newMaterial = new THREE.MeshBasicMaterial({
					map: texture, 
					side: THREE.DoubleSide
				});
				this.plane.material = newMaterial;
				}, undefined, (err) => {
					console.error('Error loading texture basicField.jpg', err);
				});
				break;
			case 3:
				loader.load('src/assets/fields/RetroField.jpg', (texture) => {
					var newMaterial = new THREE.MeshBasicMaterial({
						map: texture, 
						side: THREE.DoubleSide
					});
					this.plane.material = newMaterial;
				}, undefined, (err) => {
					console.error('Error loading texture RetroField.jpg', err);
				});
				break;
			case 4:
				loader.load('src/assets/fields/42Field.jpg', (texture) => {
					var newMaterial = new THREE.MeshBasicMaterial({
						map: texture, 
						side: THREE.DoubleSide
					});
					this.plane.material = newMaterial;
				}, undefined, (err) => {
					console.error('Error loading texture 42Field.jpg', err);
				});
				break;
			case 5:
				loader.load('src/assets/fields/PacManField.jpg', (texture) => {
					var newMaterial = new THREE.MeshBasicMaterial({
						map: texture, 
						side: THREE.DoubleSide
					});
					this.plane.material = newMaterial;
				}, undefined, (err) => {
					console.error('Error loading texture PacManField.jpg', err);
				});
				break;
		}
  }	


	update_game_data(data)
	{
		if (data)
		{
			if (data["player1_id"] == getUserObj().id){
				this.paddle1.position.y = data["player1_paddle"];
				this.ball.position.x = data["ball_x"];
				this.paddle2.position.y = data["player2_paddle"];
				this.score1 = data["player1_score"];
				this.score2 = data["player2_score"];
			}
			else if (data["player2_id"] == getUserObj().id){
				this.paddle2.position.y = data["player1_paddle"];
				this.ball.position.x = data["ball_x"] * -1;
				this.paddle1.position.y = data["player2_paddle"];
				this.score2 = data["player1_score"];
				this.score1 = data["player2_score"];
			}
			this.hazardBlock.position.y = data["hazard_y"]
			console.log(this.hazardMode, this.hazardBlock.position.y)
			if (!this.hazardMode && this.hazardBlock.position.y != -500)
			{
				this.scene.add(this.hazardBlock);
				this.hazardMode = true;
			}
			this.ball.position.y = data["ball_y"];
			document.getElementById("scoreLeftRemote").textContent = this.score1
			document.getElementById("scoreRightRemote").textContent = this.score2
		}
	}

	StartOnBG()
	{
		const toSend = {
			"type": "StartGame",
		}
		self.game_started = true
		sockets.gameSocket.send(JSON.stringify(toSend))
	}
}

var game;

export function startRemoteGame(ballOwner){
	game = new RemoteGame();

	//console.log(game)
	
	game.StartGame();
	game.StartOnBG();
	animate()
	
	
	function animate()
	{
		if (!game.running) {
			return
		}
		requestAnimationFrame(animate)
		game.Draw();
		game.CheckKeyInputs();
		// game.GameUpdate();
	}
	return game
};

