var initialCameraX = 0;
var initialCameraY = 0;

// set the scene size
var WIDTH = 640 + 300;
var HEIGHT = 360 + 0;

//modes
var is3D = false;
var multiPlay = false;
var hazardMode = false;

//0 - easiest, 1 - hardest
var difficulty = 0.2;

//Scores
var score1 = 0,
    score2 = 0,
    maxScore = 7;

// create a WebGL renderer, camera and a scene
var renderer = new THREE.WebGLRenderer();

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element (the gameCanvas)


var camera1 = new THREE.PerspectiveCamera(
    45, // VIEW_ANGLE
    WIDTH / HEIGHT, // ASPECT
    0.1, // NEAR
    10000 // FAR
);

var camera2 = new THREE.PerspectiveCamera(
    45, // VIEW_ANGLE
    WIDTH / HEIGHT, // ASPECT
    0.1, // NEAR
    10000 // FAR
)

var scene = new THREE.Scene();

// set a default position for the cameras
camera1.position.x = initialCameraX;
camera1.position.y = initialCameraY;
camera1.position.z = 500;

camera2.position.x = initialCameraX;
camera2.position.y = initialCameraY;
camera2.position.z = 500;

// sphere
var radius = 10,
    segments = 6,
    rings = 6;

var sphereMaterial = new THREE.MeshLambertMaterial({
    color: 0xF1FFF5,
    wireframe: false
});

var ball = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, rings),
    sphereMaterial
);

scene.add(ball);

var ballDirX = 1,
    ballDirY = 1,
    ballSpeed = 4;

// POINT OF LIGHT
var pointLight = new THREE.PointLight(0xF8D898);

pointLight.position.x = -1000;
pointLight.position.y = 0;
pointLight.position.z = 1000;
pointLight.intensity = 2.9;
pointLight.distance = 10000;

scene.add(pointLight);

// PLANE
var planeWidth = 640,
    planeHeight = 360,
    planeQuality = 15;

var planeMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('src/assets/fields/basicField.jpg'), 
    side: THREE.DoubleSide
});

var plane = new THREE.Mesh(
    new THREE.PlaneGeometry(
        planeWidth * 0.95,
        planeHeight,
        planeQuality,
        planeQuality
    ),
    planeMaterial
);

plane.position.z = -10;

scene.add(plane);

// PADDLES
var paddleWidth = 20,
    paddleHeight = 60,
    paddleDepth = 10,
    paddleQuality = 1;

var paddle1Material = new THREE.MeshLambertMaterial({
    color: 0xD43001,
    wireframe: false
});

var paddle2Material = new THREE.MeshLambertMaterial({
    color: 0x33A0FF,
    wireframe: false
});

var paddle1 = new THREE.Mesh(
    new THREE.BoxGeometry(
        paddleWidth,
        paddleHeight,
        paddleDepth,
        paddleQuality,
        paddleQuality,
        paddleQuality
    ),
    paddle1Material
);

scene.add(paddle1);

var paddle2 = new THREE.Mesh(
    new THREE.BoxGeometry(
        paddleWidth,
        paddleHeight,
        paddleDepth,
        paddleQuality,
        paddleQuality,
        paddleQuality
    ),
    paddle2Material
);

scene.add(paddle2);

// PADDLES POSITION
paddle1.position.x = -planeWidth / 2 + paddleWidth;
paddle2.position.x = planeWidth / 2 - paddleWidth;

paddle1.position.z = paddleDepth / 2;
paddle2.position.z = paddleDepth / 2;

var paddle1DirY = 0,
    paddle2DirY = 0,
    paddleSpeed = 6;

//HAZARD
var hazardWidth = 20,
    hazardHeight = 150,
    hazardDepth = 100,
    hazardQuality = 1;

var hazardMaterial = new THREE.MeshLambertMaterial({
    color: 0xF333FF,
    wireframe: false
});

var hazardBlock = new THREE.Mesh(
    new THREE.BoxGeometry(
        hazardWidth,
        hazardHeight,
        hazardDepth,
        hazardQuality,
        hazardQuality,
        hazardQuality
    ),
    hazardMaterial
);

//scene.add(hazardBlock);

hazardBlock.position.y = planeHeight/2;

var hazardSpeed = 3,
    hazardDir = 1;

function setup() {
}

var keyPressed = false;
var multiPressed = false;
var hazardPressed = false;

function switchMode() {
    if (Key.isDown(Key.SPACE) && !keyPressed) {
        is3D = !is3D;
        keyPressed = true;
    } else if (!Key.isDown(Key.SPACE))
        keyPressed = false;

    if (Key.isDown(Key.M) && !multiPressed) {
        multiPlay = !multiPlay;
        multiPressed = true;
    } else if (!Key.isDown(Key.M))
        multiPressed = false;

    if (Key.isDown(Key.H) && !hazardPressed) {
        hazardMode = !hazardMode;
        hazardPressed = true;
    } else if (!Key.isDown(Key.H))
        hazardPressed = false;
}

var SHIFTPressed = false;
var fieldOp = 0;

function changeField() {
    if (Key.isDown(Key.SHIFT) && !SHIFTPressed) {
        fieldOp++;
        SHIFTPressed = true;
    } else if (!Key.isDown(Key.SHIFT)) {
        SHIFTPressed = false;
    }

    if (fieldOp < 0 || fieldOp > 3)
        fieldOp = 0;
    
    var loader = new THREE.TextureLoader();
    switch (fieldOp) {
        case 0:
            var newMaterial = new THREE.MeshLambertMaterial({
                color: 0x4BD121,
                wireframe: false
            });
            plane.material = newMaterial;
            break;
        case 1:
            loader.load('src/assets/fields/basicField.jpg', function(texture) {
                var newMaterial = new THREE.MeshBasicMaterial({
                    map: texture, 
                    side: THREE.DoubleSide
                });
                plane.material = newMaterial;
            }, undefined, function(err) {
                console.error('Error loding texture basicField.jpg', err);
            });
            break;
        case 2:
            loader.load('src/assets/fields/comunCourse.jpg', function(texture) {
                var newMaterial = new THREE.MeshBasicMaterial({
                    map: texture, 
                    side: THREE.DoubleSide
                });
                plane.material = newMaterial;
            }, undefined, function(err) {
                console.error('Error loding texture comunCourse.jpg', err);
            });
            break;
        case 3:
            loader.load('src/assets/fields/pong42.jpg', function(texture) {
                var newMaterial = new THREE.MeshBasicMaterial({
                    map: texture, 
                    side: THREE.DoubleSide
                });
                plane.material = newMaterial;
            }, undefined, function(err) {
                console.error('Error loding texture pong42.jpg', err);
            });
            break;
    }
}

function startGame() {

	var c = document.getElementById("gameCanvas");
	var canvas = renderer.domElement;
	canvas.style.width = '100%';
	canvas.style.height = 'auto';
	c.appendChild(canvas);
    //checkbox values
    is3D = document.getElementById("3DMode").checked;
    multiPlay = document.getElementById("multiPlayMode").checked;
    hazardMode = document.getElementById("hazardMode").checked;

    // hides menus
    document.getElementById('menu').style.display = 'none';
	document.getElementById('game-menu-column').classList.add('d-none')
	document.getElementById('game-column').classList.remove('d-none');
	const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.classList.remove('d-none');
	gameCanvas.style.mixBlendMode = 'lighten'; 
    document.getElementById('scoreboard').style.display = 'block';

    // start game
    draw();
}

function draw() {
    //switchMode();
    changeField();

    // double view
    if (is3D && multiPlay) {
        // left player 1
        renderer.setViewport(0, 0, WIDTH / 2, HEIGHT);
        renderer.setScissor(0, 0, WIDTH / 2, HEIGHT);
        renderer.setScissorTest(true);
        renderer.render(scene, camera1);

        // right player 2
        renderer.setViewport(WIDTH / 2, 0, WIDTH / 2, HEIGHT);
        renderer.setScissor(WIDTH / 2, 0, WIDTH / 2, HEIGHT);
        renderer.setScissorTest(true);
        renderer.render(scene, camera2);
    } else {
        renderer.setViewport(0, 0, WIDTH, HEIGHT);
        renderer.setScissor(0, 0, WIDTH, HEIGHT);
        renderer.setScissorTest(true);
        renderer.render(scene, camera1);
    }

    // loop the draw() function
    requestAnimationFrame(draw);

    ballPhysics();
    paddlePlay1();
    if (multiPlay)
        paddlePlay2();
    else
        botPlay();

    if (is3D && multiPlay)
        doubleCameraWork3D();
    else if (is3D && !multiPlay)
        cameraWork3D();
    else
        cameraWork2D();

    paddlesColision();
    if (hazardMode)
        hazardStart();
    else
        scene.remove(hazardBlock);
}

function hazardStart()
{
        if ((score1 >= 4 || score2 >= 4) && hazardMode)
        {
            scene.add(hazardBlock);
            hazardColision();
        }
        checkScoreForHazard();
        hazardMove();
}

function ballPhysics() {
    //BALL BOUNCING
    if (ball.position.y <= -planeHeight / 2) //Top side of tablele
        ballDirY = -ballDirY;
    if (ball.position.y >= planeHeight / 2) //bottom side of tablele
        ballDirY = -ballDirY;

    //Player 2 scores
    if (ball.position.x <= -planeWidth / 2) {
        //Player 2 scores a point
        score2++;
        //update scoreboard
        document.getElementById("scores").innerHTML = score1 + "-" + score2;
        //reset ball
        resetBall(1);
        //check if match is over
        matchScoreCheck();
    }
    //Player 1 scores
    if (ball.position.x >= planeWidth / 2) {
        //Player 1 scores a point
        score1++;
        //update scoreboard
        document.getElementById("scores").innerHTML = score1 + "-" + score2;
        //reset ball
        resetBall(2);
        //check if match is over
        matchScoreCheck();
    }
    ball.position.x += ballDirX * ballSpeed;
    ball.position.y += ballDirY * ballSpeed;

    //BALL LIMITS
    if (ballDirY > ballSpeed * 2)
        ballDirY = ballSpeed * 2;
    else if (ballDirY < -ballSpeed * 2)
        ballDirY = -ballSpeed * 2;
} 
 
function doubleCameraWork3D() { 
        camera2.position.x = paddle2.position.x + 100;
        camera2.position.z = paddle2.position.z + 100;
        camera2.rotation.z = 90 * Math.PI / 180;
        camera2.rotation.y = 60 * Math.PI / 180;

        camera1.position.x = paddle1.position.x - 100;
        camera1.position.z = paddle1.position.z + 100;
        camera1.rotation.z = -90 * Math.PI / 180;
        camera1.rotation.y = -60 * Math.PI / 180;
}
function cameraWork3D() { 
    camera1.position.x = paddle1.position.x - 100;
    camera1.position.z = paddle1.position.z + 100;
    camera1.rotation.z = -90 * Math.PI / 180;
    camera1.rotation.y = -60 * Math.PI / 180;
}


function cameraWork2D() {
    camera1.position.x = 0;
    camera1.position.z = 500;
    camera1.rotation.z = 0;
    camera1.rotation.y = 0;
}

function paddlePlay1() {
    //left
    if (Key.isDown(Key.A)) {
        if (paddle1.position.y < planeHeight * 0.45) //not touching the side of the SHIFTle
            paddle1DirY = paddleSpeed * 0.5;
        else {
            paddle1DirY = 0;
            paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
        }
    }
    //right
    else if (Key.isDown(Key.D)) {
        if (paddle1.position.y > -planeHeight * 0.45)
            paddle1DirY = -paddleSpeed * 0.5;
        else {
            paddle1DirY = 0;
            paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
        }
    } else
        paddle1DirY = 0;

    paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;
    paddle1.scale.z += (1 - paddle1.scale.z) * 0.2;
    paddle1.position.y += paddle1DirY;
}

function paddlePlay2() {
    //left
    if (Key.isDown(Key.RIGHT)) {
        if (paddle2.position.y < planeHeight * 0.45) //not touching the side of the SHIFTle
            paddle2DirY = paddleSpeed * 0.5;
        else {
            paddle2DirY = 0;
            paddle2.scale.z += (10 - paddle2.scale.z) * 0.2;
        }
    }
    //right
    else if (Key.isDown(Key.LEFT)) {
        if (paddle2.position.y > -planeHeight * 0.45)
            paddle2DirY = -paddleSpeed * 0.5;
        else {
            paddle2DirY = 0;
            paddle2.scale.z += (10 - paddle2.scale.z) * 0.2;
        }
    } else
        paddle2DirY = 0;

    paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;
    paddle2.scale.z += (1 - paddle2.scale.z) * 0.2;
    paddle2.position.y += paddle2DirY;
}

function botPlay() {
    paddle2DirY = (ball.position.y - paddle2.position.y) * difficulty;
    //speed limit
    if (Math.abs(paddle2DirY) <= paddleSpeed)
        paddle2.position.y += paddle2DirY;
    else {
        if (paddle2DirY > paddleSpeed)
            paddle2.position.y += paddleSpeed;
        else if (paddle2DirY < -paddleSpeed)
            paddle2.position.y -= paddleSpeed;
    }
    //strech paddle when hits the end of the SHIFTle
    paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;
}

function resetBall(loser) {
    //ball in center
    ball.position.x = 0;
    ball.position.y = 0;

    //player 1 lost point, ball goes to 2
    if (loser == 1)
        ballDirX = -1;
    else //player 2 lost point, ball goes to 1
        ballDirX = 1;

    ballDirY = 1;
}

function paddlesColision() {
    //verification if the ball colides with de dimesions of the paddle1
    if (ball.position.x <= paddle1.position.x + paddleWidth &&
        ball.position.x >= paddle1.position.x) {
        if (ball.position.y <= paddle1.position.y + paddleHeight / 2 &&
            ball.position.y >= paddle1.position.y - paddleHeight / 2) {
            if (ballDirX < 0) {
                //strech paddle when hits
                paddle1.scale.y = 3;
                //bounce the ball
                ballDirX = -ballDirX;
                //adding angle to the bouncing
                ballDirY -= paddle1DirY * 0.7;
                lastHitByPlayer1 = true;
            }
        }
    }
    //verification if the ball colides with de dimesions of the paddle2
    if (ball.position.x <= paddle2.position.x + paddleWidth &&
        ball.position.x >= paddle2.position.x) {
        if (ball.position.y <= paddle2.position.y + paddleHeight / 2 &&
            ball.position.y >= paddle2.position.y - paddleHeight / 2) {
            if (ballDirX > 0) {
                //strech paddle when hits
                paddle2.scale.y = 3;
                //bounce the ball
                ballDirX = -ballDirX;
                //adding angle to the bouncing
                ballDirY -= paddle2DirY * 0.7;
                lastHitByPlayer1 = false;
            }
        }
    }
}

function matchScoreCheck()
{
    if (score1 >= maxScore)
    {
        //stop ball
        ballSpeed = 0;
        //write to banner
        document.getElementById("scores").innerHTML = "Player 1 wins!";
        document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
    }
    else if (score2 >= maxScore)
    {
        //stop ball
        ballSpeed = 0;
        //write to banner
        document.getElementById("scores").innerHTML = "Player 2 wins!";
        document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
    }
}

function hazardColision() {
    // Verify colision
    if (ball.position.x <= hazardBlock.position.x + hazardWidth / 2 &&
        ball.position.x >= hazardBlock.position.x - hazardWidth / 2) {
        if (ball.position.y <= hazardBlock.position.y + hazardHeight / 2 &&
            ball.position.y >= hazardBlock.position.y - hazardHeight / 2) {
            // bounce the ball;
            ballDirX = -ballDirX;
        }
    }
}

function hazard2Colision() {
    // Verify colision
    if (ball.position.x <= hazard2.position.x + hazard2Width / 2 &&
        ball.position.x >= hazard2.position.x - hazard2Width / 2) {
        if (ball.position.y <= hazard2.position.y + hazard2Height / 2 &&
            ball.position.y >= hazard2.position.y - hazard2Height / 2) {
            // bounce the ball;
            ballDirX = -ballDirX;
        }
    }
}

function hazardMove()
{
    if (hazardBlock.position.y >= planeWidth / 2 - hazardWidth / 2) {
        hazardDir = -1;
    } else if (hazardBlock.position.y <= -planeWidth / 2 + hazardWidth / 2) {
        hazardDir = 1;
    }
    hazardBlock.position.y += hazardSpeed * hazardDir;
}

function checkScoreForHazard() {

    if (score1 >= 5 || score2 >= 5) {
        hazardSpeed = 5;
    }
}
