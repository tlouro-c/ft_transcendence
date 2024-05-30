import { gameDict, getUserObj, sockets } from "../utils.js";
import { Key } from "./keyboard.js"

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
		this.ballSpeed = 4;
		this.paddleSpeed = 6;
		this.hazardSpeed = 3;
		this.hazardDir = 1;
		this.keyPressed = false;
		this.multiPressed = false;
		this.hazardPressed = false;
		this.SHIFTPressed = false;
		this.fieldOp = 0;
		this.lastHitByPlayer1 = false;
		this.running = false
		this.Stop = function() { this.running = false }
		this.moveLeftPaddleUp = false
		this.moveLeftPaddleDown = false
		this.moveRightPaddleUp = false
		this.moveRightPaddleDown = false
		this.ballDirX = 0
		this.ballDirY = 0
		
		
		this.init();

		// Binding the Draw function to ensure it maintains the correct context
		this.Draw = this.Draw.bind(this);
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

	SwitchMode() {
		if (Key.isDown(Key.SPACE) && !this.keyPressed) {
			this.is3D = !this.is3D;
			this.keyPressed = true;
		} else if (!Key.isDown(Key.SPACE))
			this.keyPressed = false;
	
		if (Key.isDown(Key.M) && !this.multiPressed) {
			this.multiPlay = !this.multiPlay;
			this.multiPressed = true;
		} else if (!Key.isDown(Key.M))
			this.multiPressed = false;
	
		if (Key.isDown(Key.H) && !this.hazardPressed) {
			this.hazardMode = !this.hazardMode;
			this.hazardPressed = true;
		} else if (!Key.isDown(Key.H))
			this.hazardPressed = false;
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

	StartGame(ballOwner) {
		this.running = true
		this.score1 = 0
		this.score2 = 0

		if (ballOwner == getUserObj().id) {
			this.ballDirX = -1
		} else {
			this.ballDirX = 1
		}
		this.ballDirY = 1


		//checkbox values
		//this.is3D = document.getElementById("3DMode").checked;
		//this.multiPlay = document.getElementById("multiPlayMode").checked;
		//this.hazardMode = document.getElementById("hazardMode").checked;
		//console.log("3D", this.is3D, "multiplayer", this.multiPlay, "hazard", this.hazardMode)
		let keyPressed = false

		window.addEventListener('keyup', function(event) {
			keyPressed = false
			const toSend = {
				'type': 'action',
				'action': event.key + " released", 
			}

			sockets.gameSocket.send(JSON.stringify(toSend))
		 }, false);

		window.addEventListener('keydown', function(event) { 
			if (!keyPressed) {
				keyPressed = true
				const toSend = {
					'type': 'action',
					'action': event.key + " pressed", 
				}
				sockets.gameSocket.send(JSON.stringify(toSend))
			}
			
		 }, false);

		
		const gameCanvas = document.getElementById('gameCanvasRemote');
		gameCanvas.classList.remove('d-none');
		gameCanvas.style.mixBlendMode = 'lighten'; 
		//document.getElementById('scoreboard').style.display = 'block';
		
		// start game
		console.log(this.ballDirX)
		this.multiPlay = true;
		this.Draw();
	}

	Draw() {
		if (this.running == false) {
			return
		}
		this.SwitchMode();
		this.ChangeField();
	
		// double view
		if (this.is3D) {
			// left player 1
			this.renderer.setViewport(0, 0, WIDTH / 2, HEIGHT);
			this.renderer.setScissor(0, 0, WIDTH / 2, HEIGHT);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.camera1);
			
			// right player 2
			this.renderer.setViewport(WIDTH / 2, 0, WIDTH / 2, HEIGHT);
			this.renderer.setScissor(WIDTH / 2, 0, WIDTH / 2, HEIGHT);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.camera2);
		} else {
			this.renderer.setViewport(0, 0, WIDTH, HEIGHT);
			this.renderer.setScissor(0, 0, WIDTH, HEIGHT);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.camera1);
		}
	
		// loop the Draw() function
		requestAnimationFrame(this.Draw);
	
		this.BallPhysics();
		this.PaddlePlay1();
		if (this.multiPlay)
			this.PaddlePlay2();

	
		if (this.is3D && this.multiPlay)
			this.DoubleCameraWork3D();
		else if (this.is3D && !this.multiPlay)
			this.CameraWork3D();
		else
			this.CameraWork2D();
	
		this.PaddlesColision();
		if (this.hazardMode)
			this.HazardStart();
		else
			this.scene.remove(this.hazardBlock);
	}
	
	BallPhysics() {
		//BALL BOUNCING
		if (this.ball.position.y <= -PLANEHEIGHT / 2){ //bottom side of tablele
			this.ballDirY = -this.ballDirY;
			this.ball.position.y = (-PLANEHEIGHT / 2) //+ 20 crank up this value if no fix
		}
		if (this.ball.position.y >= PLANEHEIGHT / 2){ //top side of tablele
			this.ballDirY = -this.ballDirY;
			this.ball.position.y = (PLANEHEIGHT / 2) //- 20 crank up this value if no fix
		}
			
			//Player 2 scores
		if (this.ball.position.x <= -PLANEWIDTH / 2) {
			//Player 2 scores a point
				this.score2++;
				//update scoreboard
				//reset ball
				this.ResetBall("me");
				//check if match is over
			}
			//Player 1 scores
		if (this.ball.position.x >= PLANEWIDTH / 2) {
			//Player 1 scores a point
			this.score1++;
			//update scoreboard
			sockets.gameSocket.send(JSON.stringify({'type': 'point', 'point_winner': getUserObj().id}))
			//reset ball
			this.ResetBall("opponent");
			//check if match is over
		}
		this.ball.position.x += this.ballDirX * this.ballSpeed;
		this.ball.position.y += this.ballDirY * this.ballSpeed;
	
		//BALL LIMITS
		if (this.ballDirY > this.ballSpeed * 2)
			this.ballDirY = this.ballSpeed * 2;
		else if (this.ballDirY < -this.ballSpeed * 2)
			this.ballDirY = -this.ballSpeed * 2;
	}

	PaddlesColision() {
		//verification if the ball colides with de dimesions of the paddle1
		if (this.ball.position.x <= this.paddle1.position.x + PADDLEWIDTH &&
			this.ball.position.x >= this.paddle1.position.x) {
				
				if (this.ball.position.y <= this.paddle1.position.y + PADDLEHEIGHT / 2 &&
				this.ball.position.y >= this.paddle1.position.y - PADDLEHEIGHT / 2) {
				if (this.ballDirX < 0) {
					//strech paddle when hits
					this.paddle1.scale.y = 3;
					//bounce the ball
					this.ballDirX = -this.ballDirX;
					//adding angle to the bouncing
					this.ballDirY -= this.paddle1DirY * 0.7;
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
					//bounce the ball
					this.ballDirX = -this.ballDirX;
					//adding angle to the bouncing
					this.ballDirY -= this.paddle2DirY * 0.7;
				}
			}
		}
	}
	
	ChangeField() {
		if (Key.isDown(Key.SHIFT) && !this.SHIFTPressed) {
			this.fieldOp++;
			this.SHIFTPressed = true;
		} else if (!Key.isDown(Key.SHIFT)) {
			this.SHIFTPressed = false;
		}
		
		if (this.fieldOp < 0 || this.fieldOp > 5)
			this.fieldOp = 0;
		
		var loader = new THREE.TextureLoader();
		switch (this.fieldOp) {
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

	PaddlePlay1() {
		//left
		//if (Key.)
		if (this.moveLeftPaddleUp) {
			if (this.paddle1.position.y < PLANEHEIGHT * 0.45) //not touching the side of the SHIFTle
			this.paddle1DirY = this.paddleSpeed * 0.5;
			else {
				this.paddle1DirY = 0;
				this.paddle1.scale.z += (10 - this.paddle1.scale.z) * 0.2;
			}
		}
		//right
		else if (this.moveLeftPaddleDown) {
			if (this.paddle1.position.y > -PLANEHEIGHT * 0.45)
				this.paddle1DirY = -this.paddleSpeed * 0.5;
			else {
				this.paddle1DirY = 0;
				this.paddle1.scale.z += (10 - this.paddle1.scale.z) * 0.2;
			}
		}
		else
		this.paddle1DirY = 0;
	
	this.paddle1.scale.y += (1 - this.paddle1.scale.y) * 0.2;
	this.paddle1.scale.z += (1 - this.paddle1.scale.z) * 0.2;
		this.paddle1.position.y += this.paddle1DirY;
	}
	
	PaddlePlay2() {
		//left
		if (this.moveRightPaddleUp) {
			if (this.paddle2.position.y < PLANEHEIGHT * 0.45) //not touching the side of the SHIFTle
			this.paddle2DirY = this.paddleSpeed * 0.5;
			else {
				this.paddle2DirY = 0;
				this.paddle2.scale.z += (10 - this.paddle2.scale.z) * 0.2;
			}
		}
		//right
		else if (this.moveRightPaddleDown) {
			if (this.paddle2.position.y > -PLANEHEIGHT * 0.45)
				this.paddle2DirY = -this.paddleSpeed * 0.5;
			else {
				this.paddle2DirY = 0;
				this.paddle2.scale.z += (10 - this.paddle2.scale.z) * 0.2;
			}
		} 
		else
			this.paddle2DirY = 0;
	
		this.paddle2.scale.y += (1 - this.paddle2.scale.y) * 0.2;
		this.paddle2.scale.z += (1 - this.paddle2.scale.z) * 0.2;
		this.paddle2.position.y += this.paddle2DirY;
	}

	ResetBall(loser) {

		//ball in center
		this.ball.position.x = 0;
		this.ball.position.y = 0;

		if (loser == "me") {
			this.ballDirX = -1
		} else {
			this.ballDirX = 1
		}

		this.ballDirY = 1
	}
	
	HazardStart()
	{
		if ((this.score1 >= 4 || this.score2 >= 4) && this.hazardMode)
		{
			this.scene.add(this.hazardBlock);
			this.HazardColision();
		}
		this.CheckScoreForHazard();
		this.HazardMove();
	}

	HazardColision() {
		// Verify colision
		if (this.ball.position.x <= this.hazardBlock.position.x + HAZARDWIDTH / 2 &&
			this.ball.position.x >= this.hazardBlock.position.x - HAZARDWIDTH / 2) {
			if (this.ball.position.y <= this.hazardBlock.position.y + HAZARDHEIGHT / 2 &&
			this.ball.position.y >= this.hazardBlock.position.y - HAZARDHEIGHT / 2) {
				// bounce the ball;
				this.ballDirX = -this.ballDirX;
			}
		}
	}
	
	HazardMove()
	{
		if (this.hazardBlock.position.y >= PLANEWIDTH / 2 - HAZARDWIDTH / 2) {
			this.hazardDir = -1;
		} else if (this.hazardBlock.position.y <= -PLANEWIDTH / 2 + HAZARDWIDTH / 2) {
			this.hazardDir = 1;
		}
		this.hazardBlock.position.y += this.hazardSpeed * this.hazardDir;
	}

	CheckScoreForHazard() {
		if (this.score1 >= 5 || this.score2 >= 5) {
			this.hazardSpeed = 5;
		}
	}
}

function RandomDir(){
	let random1 = Math.random();
	if (random1 > 0.5)
			return Math.random();
	else
		return (Math.random() * -1);
}

export function startRemoteGame(ballOwner){
	const game = new RemoteGame();

	game.StartGame(ballOwner);
	return game
};
