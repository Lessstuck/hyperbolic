// geometries, bodies, and mousepicker

import * as CANNON from "./cannon-es.js";
import * as THREE from "https://unpkg.com/three@0.122.0/build/three.module.js";
import Stats from "https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js";

var fullScreenMode = 0;
var sceneWidth = window.innerWidth;
var sceneHeight = window.innerHeight;
let dragPositions = {};

// three.js variables
let camera, scene, renderer, stats;
let movementPlane;
let clickMarker;
let raycaster;
let cubeMesh;
let ballMesh;
let octaMesh;
// var ballMaterial;
var impulse;
var velocity;

// cannon.js variables
let world;
let jointBody;
let jointConstraint;
let cubeBody;
let ballBody;
let octaBody;
let octaLight;
let ballLight;
let cubeLight;

let isDragging = false;
let hitIndex = 0;

// To be synced
const meshes = [];
const bodies = [];

initThree();
initCannon();
animate();

function initThree() {
  // Camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.5,
    1000
  );
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  $("#front").click(function () {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  });
  $("#top").click(function () {
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
  });
  $("#fullscreen").click(function () {
    openFullscreen();
  });

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 500, 1000);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneWidth, sceneHeight);
  renderer.setClearColor(scene.fog.color);

  renderer.outputEncoding = THREE.sRGBEncoding;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.getElementById("webgl").appendChild(renderer.domElement);

  // Stats.js
  stats = new Stats();
  // document.body.appendChild(stats.dom)

  // Lights
  const ambientLight = new THREE.AmbientLight(0x111111);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  const distance = 5;
  directionalLight.position.set(-distance, distance, distance);

  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;

  directionalLight.shadow.camera.left = -distance;
  directionalLight.shadow.camera.right = distance;
  directionalLight.shadow.camera.top = distance;
  directionalLight.shadow.camera.bottom = -distance;

  directionalLight.shadow.camera.far = 3 * distance;
  directionalLight.shadow.camera.near = distance;

  scene.add(directionalLight);

  // Raycaster for mouse interaction
  raycaster = new THREE.Raycaster();

  /////////////////////////////////////////////////////////////////////////////
  //  geometries
  /////////////////////////////////////////////////////////////////////////////

  // Floor
  const floorGeometry = new THREE.PlaneBufferGeometry(10, 10, 1, 1);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
  floorMaterial.side = THREE.DoubleSide;
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.receiveShadow = true;
  floor.position.y = -5;
  scene.add(floor);

  // Walls
  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x050505 });
  wallMaterial.side = THREE.DoubleSide;

  // Plane -x
  const planeXminGeometry = new THREE.PlaneBufferGeometry(10, 10, 1, 1);
  planeXminGeometry.rotateY(-Math.PI / 2);
  const planeXmin = new THREE.Mesh(planeXminGeometry, wallMaterial);
  planeXmin.receiveShadow = true;
  planeXmin.position.x = -5;
  scene.add(planeXmin);

  // Plane +x
  const planeXmaxGeometry = new THREE.PlaneBufferGeometry(10, 10, 1, 1);
  planeXmaxGeometry.rotateY(-Math.PI / 2);
  const planeXmax = new THREE.Mesh(planeXmaxGeometry, wallMaterial);
  planeXmax.receiveShadow = true;
  planeXmax.position.x = 5;
  scene.add(planeXmax);

  // Plane +z
  const planeZmaxGeometry = new THREE.PlaneBufferGeometry(10, 10, 1, 1);
  const planeZmax = new THREE.Mesh(planeZmaxGeometry, wallMaterial);
  planeZmax.receiveShadow = true;
  planeZmax.position.z = -5;
  scene.add(planeZmax);

  // Click marker to be shown on interaction
  const markerGeometry = new THREE.SphereBufferGeometry(0.2, 8, 8);
  const markerMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
  clickMarker = new THREE.Mesh(markerGeometry, markerMaterial);
  clickMarker.visible = false; // Hide it..
  scene.add(clickMarker);

  let octaMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
  let ballMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
  let cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });

  // Octahedron
  const octaGeometry = new THREE.OctahedronBufferGeometry(0.65);
  octaMesh = new THREE.Mesh(octaGeometry, octaMaterial);
  octaMesh.castShadow = true;
  meshes.push(octaMesh);
  dragPositions[2] = [0, 2.5, 0];
  scene.add(octaMesh);
  octaLight = new THREE.PointLight(0xf2b705, 1, 100);
  octaLight.position.set(0, 2.5, 0);
  octaLight.castShadow = true;
  scene.add(octaLight);

  // Ball
  const ballGeometry = new THREE.SphereBufferGeometry(0.5, 30, 30);
  ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
  ballMesh.castShadow = true;
  meshes.push(ballMesh);
  dragPositions[1] = [0, 0, 0];
  scene.add(ballMesh);
  ballLight = new THREE.PointLight(0xbf1304, 1, 100);
  ballLight.position.set(0, 0, 0);
  ballLight.castShadow = true;
  scene.add(ballLight);
  // Cube
  const cubeGeometry = new THREE.BoxBufferGeometry(0.8, 0.8, 0.8);
  cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cubeMesh.castShadow = true;
  meshes.push(cubeMesh);
  dragPositions[0] = [0, -2.5, 0];
  scene.add(cubeMesh);
  cubeLight = new THREE.PointLight(0x048abf, 1, 100);
  cubeLight.position.set(0, -2.5, 0);
  cubeLight.castShadow = true;
  scene.add(cubeLight);

  // Movement plane when dragging
  const planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
  movementPlane = new THREE.Mesh(planeGeometry, floorMaterial);
  movementPlane.visible = false; // Hide it..
  scene.add(movementPlane);

  //////////  Fullscreen or FullScreen   /////////////////////

  // Disable fullscreen button on iPhones
  let iPhoneDetected = /iPhone/.test(navigator.userAgent) && !window.MSStream;
  let fullscreenButton = document.getElementById("fullscreen");
  let fullscreenSeperator = document.getElementById("fullscreen_seperator");
  if (iPhoneDetected) {
    fullscreenButton.style.display = "none";
    fullscreenSeperator.style.display = "none";
  }

  // from https://stackoverflow.com/questions/50568474/how-to-enter-fullscreen-in-three-js
  // reply by pera

  function openFullscreen() {
    var elem = document.getElementById("webgl-and-controls");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  ////  get full screen state
  if (document.addEventListener) {
    document.addEventListener("webkitfullscreenchange", fsChangeHandler, false);
    document.addEventListener("mozfullscreenchange", fsChangeHandler, false);
    document.addEventListener("fullscreenchange", fsChangeHandler, false);
    document.addEventListener("MSFullscreenChange", fsChangeHandler, false);
  }

  function fsChangeHandler() {
    if (
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      document.msFullscreenElement !== undefined
    ) {
      fullScreenMode = 1;
    } else {
      /* Run code when going back from fs mode */
      fullScreenMode = 0;
    }
  }
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  if (fullScreenMode) {
    var elem = document.getElementById("webgl-and-controls");
    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneWidth, sceneHeight);
  } else {
    var elem = document.getElementById("webgl-and-controls");
    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneWidth, sceneHeight);
  }
}

/////////////////////////////////////////////////////////////////////////////
//  physics
/////////////////////////////////////////////////////////////////////////////

function initCannon() {
  // Setup world
  world = new CANNON.World();
  world.gravity.set(0, 0, 0);
  const worldBoxMaterial = new CANNON.Material("worldBox");

  // Floor
  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({ mass: 0, material: worldBoxMaterial });
  floorBody.addShape(floorShape);
  // floorBody.position.set(0, -(window.innerHeight * .005), 0)
  floorBody.position.set(0, -5, 0);
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // rotation affects collision!!!
  world.addBody(floorBody);

  // Ceiling
  const ceilingShape = new CANNON.Plane();
  const ceilingBody = new CANNON.Body({ mass: 0, material: worldBoxMaterial });
  ceilingBody.addShape(ceilingShape);
  ceilingBody.quaternion.setFromEuler(Math.PI / 2, 0, 0);
  // ceilingBody.position.set(0, (window.innerHeight * .005), 0)
  ceilingBody.position.set(0, 5, 0);
  world.addBody(ceilingBody);

  // Plane -x
  const planeShapeXmin = new CANNON.Plane();
  const planeXmin = new CANNON.Body({ mass: 0, material: worldBoxMaterial });
  planeXmin.addShape(planeShapeXmin);
  planeXmin.quaternion.setFromEuler(0, Math.PI / 2, 0);
  planeXmin.position.set(-5, 0, 0);
  world.addBody(planeXmin);

  // Plane +x
  const planeShapeXmax = new CANNON.Plane();
  const planeXmax = new CANNON.Body({ mass: 0, material: worldBoxMaterial });
  planeXmax.addShape(planeShapeXmax);
  planeXmax.quaternion.setFromEuler(0, -Math.PI / 2, 0);
  planeXmax.position.set(5, 0, 0);
  world.addBody(planeXmax);

  // Plane -z
  const planeShapeZmin = new CANNON.Plane();
  const planeZmin = new CANNON.Body({ mass: 0, material: worldBoxMaterial });
  planeZmin.addShape(planeShapeZmin);
  planeZmin.quaternion.setFromEuler(0, 0, 0);
  planeZmin.position.set(0, 0, -5);
  world.addBody(planeZmin);

  // Plane +z
  const planeShapeZmax = new CANNON.Plane();
  const planeZmax = new CANNON.Body({ mass: 0, material: worldBoxMaterial });
  planeZmax.addShape(planeShapeZmax);
  planeZmax.quaternion.setFromEuler(0, Math.PI, 0);
  planeZmax.position.set(0, 0, 5);
  world.addBody(planeZmax);

  // Balls
  const ballCannonMaterial = new CANNON.Material();

  // Octahedron body
  const octaShape = new CANNON.Sphere(0.65); // no octahedron in CANNON
  octaBody = new CANNON.Body({
    mass: 5,
    material: ballCannonMaterial,
  });
  octaBody.addShape(octaShape);
  octaBody.position.set(0, 2.5, 0);
  octaBody.angularDamping = 0.4;
  bodies.push(octaBody);
  world.addBody(octaBody);

  // Sphere body
  const ballShape = new CANNON.Sphere(0.5, 12, 12);
  ballBody = new CANNON.Body({ mass: 5, material: ballCannonMaterial });
  ballBody.addShape(ballShape);
  ballBody.position.set(0, 0, 0);
  bodies.push(ballBody);
  world.addBody(ballBody);

  // Cube body
  const cubeHalfExtents = new CANNON.Vec3(1, 1, 1);
  const cubeShape = new CANNON.Box(cubeHalfExtents);
  cubeBody = new CANNON.Body({ mass: 5, material: ballCannonMaterial });
  cubeBody.addShape(cubeShape);
  cubeBody.position.set(0, -2.5, 0);
  cubeBody.angularDamping = 0.6;
  bodies.push(cubeBody);
  world.addBody(cubeBody);

  // Create contact material behaviour
  const worldBox_ball = new CANNON.ContactMaterial(
    worldBoxMaterial,
    ballCannonMaterial,
    { friction: 0.0, restitution: 0.8 }
  );
  world.addContactMaterial(worldBox_ball);

  // Joint body, to later constraint the ball
  const jointShape = new CANNON.Sphere(0.1);
  jointBody = new CANNON.Body({ mass: 0 });
  jointBody.addShape(jointShape);
  jointBody.collisionFilterGroup = 0;
  jointBody.collisionFilterMask = 0;
  world.addBody(jointBody);
}

/////////////////////////////////////////////////////////////////////////////
//  listener
/////////////////////////////////////////////////////////////////////////////

window.addEventListener("pointerdown", (event) => {
  event.preventDefault();

  // Cast a ray from where the mouse is pointing and
  // see if we hit something
  let hitPoint;
  let hitBody;
  const cubeHitPoint = getHitPoint(
    event.clientX,
    event.clientY,
    cubeMesh,
    camera
  );
  const ballHitPoint = getHitPoint(
    event.clientX,
    event.clientY,
    ballMesh,
    camera
  );
  const octaHitPoint = getHitPoint(
    event.clientX,
    event.clientY,
    octaMesh,
    camera
  );

  // All 3 HitPoints are evaluated, but the if-else below will prioritize, for example, octa if both octa and ball are hit
  // Return if one wasn't hit

  if (octaHitPoint) {
    hitPoint = octaHitPoint;
    hitBody = octaBody;
    hitIndex = 0;
  } else if (ballHitPoint) {
    hitPoint = ballHitPoint;
    hitBody = ballBody;
    hitIndex = 1;
  } else if (cubeHitPoint) {
    hitPoint = cubeHitPoint;
    hitBody = cubeBody;
    hitIndex = 2;
  } else {
    // removeJointConstraint(); // causes move.joint serror on iPad
    world.removeBody(jointBody);

    return;
  }

  // Move marker mesh on contact point
  showClickMarker();
  moveClickMarker(hitPoint);

  // Move the movement plane on the z-plane of the hit
  moveMovementPlane(hitPoint, camera);

  // Create the constraint between the body that was hit and the joint body
  addJointConstraint(hitPoint, hitBody);

  // Set the flag to trigger pointermove on next frame so the
  // movementPlane has had time to move
  requestAnimationFrame(() => {
    isDragging = true;
  });
});

window.addEventListener("pointermove", (event) => {
  if (!isDragging) {
    return;
  }

  // Project the mouse onto the movement plane
  const hitPoint = getHitPoint(
    event.clientX,
    event.clientY,
    movementPlane,
    camera
  );

  if (hitPoint) {
    // Move marker mesh on the contact point
    moveClickMarker(hitPoint);
    // Move the cannon constraint on the contact point
    moveJoint(hitPoint);
  }
});

window.addEventListener("pointerup", () => {
  // event.preventDefault();
  isDragging = false;

  // Hide the marker mesh
  hideClickMarker();

  // Remove the mouse constraint from the world
  removeJointConstraint();
});

function showClickMarker() {
  clickMarker.visible = true;
}

function moveClickMarker(position) {
  clickMarker.position.copy(position);
}

function hideClickMarker() {
  clickMarker.visible = false;
}

// This function moves the virtual movement plane for the mouseJoint to move in
function moveMovementPlane(point, camera) {
  // Center at mouse position
  movementPlane.position.copy(point);

  // Make it face toward the camera
  movementPlane.quaternion.copy(camera.quaternion);
}

// Returns a hit point if there's a hit with the mesh,
// otherwise returns undefined
function getHitPoint(clientX, clientY, mesh, camera) {
  // Get 3D point from the client x y
  const mouse = new THREE.Vector2();
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -((clientY / window.innerHeight) * 2 - 1);

  // Get the picking ray from the point
  raycaster.setFromCamera(mouse, camera);

  // Find out if there's a hit
  const hits = raycaster.intersectObject(mesh);
  return hits.length > 0 ? hits[0].point : undefined; //        <---- filter .point (x, y, z) for hit outside of worldbox here!!
}

///////////////////////////////////////////////////////////s//////////////////
//  interaction constraint
/////////////////////////////////////////////////////////////////////////////

// Add a constraint between the object and the jointBody
// in the interaction position
function addJointConstraint(position, constrainedBody) {
  removeJointConstraint();
  // Vector that goes from the body to the clicked point
  const vector = new CANNON.Vec3()
    .copy(position)
    .vsub(constrainedBody.position);

  // Apply anti-quaternion to vector to tranform it into the local body coordinate system
  const antiRotation = constrainedBody.quaternion.inverse();
  const pivot = antiRotation.vmult(vector); // pivot is not in local body coordinates

  // Move the cannon click marker body to the click position
  jointBody.position.copy(position);

  // Create a new constraint
  // The pivot for the jointBody is zero
  jointConstraint = new CANNON.PointToPointConstraint(
    constrainedBody,
    pivot,
    jointBody,
    new CANNON.Vec3(0, 0, 0)
  );
  // Add the constraint to world
  world.addConstraint(jointConstraint);
}

// This functions moves the joint body to a new postion in space
// and updates the constraint
function moveJoint(position) {
  jointBody.position.copy(position);
  jointConstraint.update();
}

// Remove constraint from world
function removeJointConstraint() {
  if (jointConstraint) {
    world.removeConstraint(jointConstraint);
    jointConstraint = undefined;
  }
}
/////////////////////////////////////////////////////////////////////////////
//  step animation and render
/////////////////////////////////////////////////////////////////////////////

// export THREE objects before animation
export { dragPositions, octaMesh, ballMesh, cubeMesh, hitIndex, isDragging };

function animate() {
  requestAnimationFrame(animate);

  // Step the physics world
  world.fixedStep();

  // Sync the three.js meshes with the bodies
  meshes.forEach(function (member, i) {
    meshes[i].position.copy(bodies[i].position);
    dragPositions[i][0] = meshes[i].position.x;
    dragPositions[i][1] = meshes[i].position.y;
    dragPositions[i][2] = meshes[i].position.z;

    meshes[i].quaternion.copy(bodies[i].quaternion);
  });

  octaLight.position.x = meshes[0].position.x;
  octaLight.position.y = meshes[0].position.y;
  octaLight.position.z = meshes[0].position.z;

  ballLight.position.x = meshes[1].position.x;
  ballLight.position.y = meshes[1].position.y;
  ballLight.position.z = meshes[1].position.z;

  cubeLight.position.x = meshes[2].position.x;
  cubeLight.position.y = meshes[2].position.y;
  cubeLight.position.z = meshes[2].position.z;

  // Render three.js
  renderer.render(scene, camera);

  stats.update();
}

////////////////////////////////////////////// Push objects to go, reset to beginning position to stop

function startImpulse() {
  impulse = new CANNON.Vec3(100, 0, 0);
  octaBody.applyImpulse(impulse);
  impulse = new CANNON.Vec3(0, 0, -30);
  ballBody.applyImpulse(impulse);
  impulse = new CANNON.Vec3(0, -50, 0);
  cubeBody.applyImpulse(impulse);
}

function stopReset() {
  velocity = new CANNON.Vec3(0, 0, 0);
  octaBody.velocity = velocity;
  octaBody.position.set(0, 2.5, 0);
  velocity = new CANNON.Vec3(0, 0, 0);
  ballBody.velocity = velocity;
  ballBody.position.set(0, 0, 0);
  velocity = new CANNON.Vec3(0, 0, 0);
  cubeBody.velocity = velocity;
  cubeBody.position.set(0, -2.5, 0);
  octaMesh.material.emissive.set(0x000000);
  ballMesh.material.emissive.set(0x000000);
  cubeMesh.material.emissive.set(0x000000);
}

export { startImpulse, stopReset, octaLight, ballLight, cubeLight };
