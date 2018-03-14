var renderer;
var camera;
var scene;
var canvasWidth;
var canvasHeight;
var viewLength;
var aspRat;
var vectorArray;
var faceArray;
var colorArray = [/**dark green**/new THREE.Color(0x009933), /**soft purple**/new THREE.Color(0x9966ff),
				  /**dark blue**/new THREE.Color(0x0000ff), /**mint green**/new THREE.Color(0x66ff99),
				  /**aqua blue**/new THREE.Color(0x009999), /**light blue**/new THREE.Color(0x00ffff)];
var blockWidth = 40;
var wallObj = new THREE.Mesh();
var doorObj = new THREE.Mesh();

init();
draw();
renderScene();

/*
 *init function
 *
 *Initializes the renderer, an orthographic camera, and the scene. Also adds a
 *"keydown" event listener.
 */
function init(){
	//Initializes the renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0xffffff, 1);
	
	//Sets the canvas width to (.innerWidth)
	canvasWidth = window.innerWidth;
	
	//Sets the canvas height to (.innerHeight)
	canvasHeight = window.innerHeight;
	
	//Creates the canvas
	renderer.setSize(canvasWidth, canvasHeight);
	var canvas = document.getElementById("WebGLCanvas");
	canvas.appendChild(renderer.domElement);
	
	//Creates the scene
	scene = new THREE.Scene();
	
	//Initializes the event listener
	document.addEventListener("keydown", onKeyDown);
	
	//Creates the orthographic camera
	viewLength = 500;
	aspRat = canvasWidth/canvasHeight;
	camera = new THREE.OrthographicCamera(-aspRat*viewLength/2,
											  aspRat*viewLength/2,
											  viewLength/2, -viewLength/2,
											  -1000, 1000);
	
	//Sets camera postition
	camera.position.set(300, 300, 300);
	camera.lookAt(scene.position);
	
	//Adds camera to scene
	scene.add(camera);
}

/*
 *draw function
 *
 *Calls the various functions that draw the turnstile and walls.
 */
function draw(){
	//Builds the ground
	buildGround();
	
	//Builds the walls
	buildWalls();
	
	//Builds the turnstiles
	buildTurnStile();
}

/*
 *initGeom function
 *
 *Initializes the arrays for the vertices, faces, and color of the
 *original cube.
 */
function initGeom(){
	var cubeGeom = new THREE.Geometry();
	
	//Array of the vectors of the cube
	vectorArray = [/**0**/new THREE.Vector3(-blockWidth/2, blockWidth/2, blockWidth/2),
				   /**1**/new THREE.Vector3(-blockWidth/2, -blockWidth/2, blockWidth/2),
				   /**2**/new THREE.Vector3(blockWidth/2, -blockWidth/2, blockWidth/2),
				   /**3**/new THREE.Vector3(blockWidth/2, blockWidth/2, blockWidth/2),
				    /**4**/new THREE.Vector3(blockWidth/2, blockWidth/2, -blockWidth/2),
					/**5**/new THREE.Vector3(blockWidth/2, -blockWidth/2, -blockWidth/2),
				   /**6**/new THREE.Vector3(-blockWidth/2, -blockWidth/2, -blockWidth/2),
				   /**7**/new THREE.Vector3(-blockWidth/2, blockWidth/2, -blockWidth/2)];
	
	//Array of the faces of the cube, 2 for each side
	faceArray = [/**front**/new THREE.Face3(0, 1, 2), new THREE.Face3(2, 3, 0),
				 /**right**/new THREE.Face3(3, 2, 5), new THREE.Face3(5, 4, 3),
				 /**back**/new THREE.Face3(4, 5, 6), new THREE.Face3(6, 7, 4),
				 /**left**/new THREE.Face3(7, 6, 1), new THREE.Face3(1, 0, 7),
				 /**top**/new THREE.Face3(7, 0, 3), new THREE.Face3(3, 4, 7),
				 /**bottom**/new THREE.Face3(1, 6, 5), new THREE.Face3(5, 2, 1)];
	
	//Sets these arrays to the cube's vertices and faces
	cubeGeom.vertices = vectorArray;
	cubeGeom.faces = faceArray;
	
	return cubeGeom;
}

/*
 *buildGround function	
 *
 *Builds the ground for the walls and turnstiles to stand on.
 */
function buildGround(){
	//Creates the ground using PlaneGeometry
	var groundGeom = new THREE.PlaneGeometry(600, 600);
	var groundMat = new THREE.MeshBasicMaterial({color: 0x33cc33, side:THREE.DoubleSide});
	var groundMesh = new THREE.Mesh(groundGeom, groundMat);
	
	//Rotates the ground so that it is horizontal
	groundMesh.rotation.x = Math.PI / 2;
	
	//Adds ground to the scene
	scene.add(groundMesh);
}

/*
 *buildFirstCube
 *
 *Uses the structures initialized in initGeom to create the first
 *cube of the wall.
 */
function buildFirstCube(){
	var colorCounter = 0;
	var firstCubeGeom = initGeom();
	
	//Loops through the faceArray, assigning a color for each 2 faces
	for(var i = 0; i < firstCubeGeom.faces.length; i += 2){
		var face = firstCubeGeom.faces[i];
		face.color.setRGB(colorArray[colorCounter].r, colorArray[colorCounter].g, colorArray[colorCounter].b);
		face = firstCubeGeom.faces[i+1];
		face.color = firstCubeGeom.faces[i].color;
		colorCounter++;
	}
	
	var cubeMesh = new THREE.Mesh(firstCubeGeom, new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors}));

	cubeMesh.position.y = 20;
	
	return cubeMesh;
}

/*
 *buildWall function
 *
 *Builds the wall (either left or right depending on the value of side) by using
 *clones of the first cube.
 */
function buildWall(side){
	//Creates first cube
	var cube1 = buildFirstCube();
	var direction;
	
	var wall = [];
	
	//Checks which direction it will build in
	if(side == "left"){
		direction = -1;
		cube1.position.x = -20;
	}else if(side == "right"){
		direction = 1;
		cube1.position.x = 20;
	}
	
	//Makes the wall by cloning the original cube and rotating it
	for(var y = 0; y < 4; y++){
		for(var x = 0; x < 5; x++){
			var newCube = cube1.clone();
			wall.push(newCube);
			newCube.rotation.x += Math.PI;
			newCube.position.x += (blockWidth*x)*direction;
			if((wall.length) % 2 === 0){
				newCube.rotation.x += Math.PI / 2;
			}
		}
		cube1.position.y += blockWidth;
		cube1.position.x = 20*direction;
	}
	
	var wallMesh = new THREE.Mesh();
	for(var i = 0; i < wall.length; i += 1){
		wallMesh.add(wall[i]);
	}
	
	if(side === "right"){
		wallMesh.position.x += blockWidth;
	}else if(side === "left"){
		wallMesh.position.x -= blockWidth;
	}
	
	return wallMesh;
}

/*
 *buildWalls function
 *
 *Helper function that calls buildWall for the right and left side,
 *then adds the walls to the scene.
 */
function buildWalls(){
	wallObj.add(buildWall("left"));
	wallObj.add(buildWall("right"));
	
	scene.add(wallObj);
}

/*
 *buildTurnStile function
 *
 *Builds and configures the turnstile doors and pole.
 */
function buildTurnStile(){
	//Builds the pole in the middle of the turnstile
	var poleGeom = new THREE.CylinderGeometry(5, 5, 180, 16);
	var poleMat = new THREE.MeshBasicMaterial({color: 0x1a1a1a});
	var pole = new THREE.Mesh(poleGeom, poleMat);
	pole.position.y = 80;

	//Builds the turnstile doors
	var doorGeom = new THREE.Geometry();
	var doorVerts = [new THREE.Vector3(-40, 160, 5),//0
					 new THREE.Vector3(-40, 0, 5),//1
					 new THREE.Vector3(40, 0, 5),//2
					 new THREE.Vector3(40, 160, 5),//3
					 new THREE.Vector3(40, 160, -5),//4
					new THREE.Vector3(40, 0, -5),//5
					new THREE.Vector3(-40, 0, -5),//6
					new THREE.Vector3(-40, 160, -5)];//7

	var doorFaces = [//front 2 faces
					 new THREE.Face3(0, 1, 2),
					 new THREE.Face3(2, 3, 0),
					 //right 2 faces
					 new THREE.Face3(3, 2, 5),
					 new THREE.Face3(5, 4, 3),
					 //back 2 faces
					 new THREE.Face3(4, 5, 6),
					 new THREE.Face3(6, 7, 4),
					 //left 2 faces
					 new THREE.Face3(7, 6, 1),
					 new THREE.Face3(1, 0, 7),
					 //top 2 faces
					 new THREE.Face3(7, 0, 3),
					 new THREE.Face3(3, 4, 7),
					 //bottom 2 faces
					 new THREE.Face3(1, 6, 5),
					 new THREE.Face3(5, 2, 1)];
	
	doorGeom.vertices = doorVerts;
	doorGeom.faces = doorFaces;
	
	var doorMat = new THREE.MeshBasicMaterial({color: 0x686868});
	var doorMesh = new THREE.Mesh(doorGeom, doorMat);
	
	var door2 = doorMesh.clone();
	door2.rotation.y = Math.PI / 2;
	
	doorObj.add(pole);
	doorObj.add(doorMesh);
	doorObj.add(door2);
	scene.add(doorObj);
}

/*
 *renderScene function
 *
 *Renders the scene.
 */
function renderScene(){
	renderer.render(scene, camera);
}

/*
 *onKeyDown function 
 *
 *Handles the interaction strategies.
 *
 *Pressing the q key turns the turnstile doors
 *Pressing the p key turns the walls around the turnstiles
 *Pressing the r key resets the walls and turnstile to their original position
 *Pressing the 1 key moves the camera to the right corner
 *Pressing the 2 key moves the camera to the front center
 *Pressing the 0 key moves the camera back to its original position
 */
function onKeyDown(keydown){
	keydown = keydown || window.event;
	
	if(keydown.keyCode == '81'){//q; turns the doors
		doorObj.rotation.y += Math.PI / 10;
		renderScene();
	}
	if(keydown.keyCode == '80'){//p; turns the walls
		wallObj.rotation.y += Math.PI / 10;
		renderScene();
	}
	if(keydown.keyCode == '82'){//r; resets the wall and turnstile
		wallObj.rotation.y = 0;
		doorObj.rotation.y = 0;
		renderScene();
	}
	if(keydown.keyCode == '96'){//0; resets the camera
		newCamera = new THREE.OrthographicCamera(-aspRat*viewLength/2,
											  aspRat*viewLength/2,
											  viewLength/2, -viewLength/2,
											  -1000, 1000);
		camera = newCamera;
		camera.position.set(300, 300, 300);
		camera.lookAt(scene.position);
		renderScene();
	}
	if(keydown.keyCode == '97'){//1; moves the camera to the upper right corner
		newCamera = new THREE.OrthographicCamera(-aspRat*viewLength/2,
											  aspRat*viewLength/2,
											  viewLength/2, -viewLength/2,
											  -1000, 1000);
		camera = newCamera;
		camera.position.set(300, 300, -300);
		camera.lookAt(scene.position);
		renderScene();

	}
	if(keydown.keyCode == '98'){//2; moves the camera front and center
		newCamera = new THREE.OrthographicCamera(-aspRat*viewLength/2,
											  aspRat*viewLength/2,
											  viewLength/2, -viewLength/2,
											  -1000, 1000);
		camera = newCamera;
		camera.position.set(0, 0, 300);
		camera.lookAt(scene.position);
		renderScene();
	}
}