var app = app || { };

var scene, camera, renderer, lights = [], skull; 
var distanceBeingMoved = 3, distanceBeingMovedDelta = 0.4
var timeToMoveThroughEye = 1, timeToMoveToBunch = 0.5, timeToMoveBackToOriginalPosition = 8;
var particleStartingColor = new THREE.Color(0xffff00), particleEndingColor = new THREE.Color(0xffa500);

var positionOfEye1 = new THREE.Vector3(0.5, 0.4, 0.5);
var positionOfEye2 = new THREE.Vector3(-0.5, 0.4, 0.5);
var positionToBunchAt = new THREE.Vector3(0, 0.5, 2.0);

var initialParticleModelMat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeRotationY(-0.3), new THREE.Matrix4().makeScale(0.5, 0.5, 0.5));

var particles = [];

var isAllBunched;

var States = {
    ORIGINAL_POSITION: 0, 
    MOVING_TO_EYE: 1, 
    MOVING_TO_BUNCH: 2, 
    WAITING_AT_BUNCH: 3,
    MOVING_BACK_TO_ORIGINAL_POSITION: 4,
    DO_NOTHING: 5
};

var initRenderer = function() {
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
};

var initCamera = function() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
};

var initSkull = function() {
    var skullPointsGeometry = new THREE.Geometry();
    for (var i = 0; i < skullGeometry.vertices.length / 3; i++) {
        var vector3 = new THREE.Vector3(skullGeometry.vertices[i*3], skullGeometry.vertices[i*3+1] - 3, skullGeometry.vertices[i*3+2]);
        vector3.applyMatrix4(initialParticleModelMat);

        skullPointsGeometry.vertices.push(vector3.clone());
        skullPointsGeometry.colors[i] = particleStartingColor.clone();

        particles[i] = new app.Particle(skullPointsGeometry.vertices[i], skullPointsGeometry.colors[i]);
    }

    skull = new THREE.Points(skullPointsGeometry, new THREE.PointsMaterial({size: 0.015, vertexColors: true}));
    skull.userData.theta = 0;
};

var initLights = function() {
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    lights.push(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x404040);
    lights.push(ambientLight);
};

var initScene = function() {
    scene = new THREE.Scene();

    for (var i = 0; i < lights.length; i++) {
        scene.add(lights[i]);
    }

    scene.add(skull);
};

var init = function() {
    initRenderer();
    initCamera();
    initLights();
    initSkull();
    initScene();
};

var isEveryParticleBunched = function() {
    for (var i = 0; i < skull.geometry.vertices.length; i++) {
        if (positionToBunchAt.distanceTo(skull.geometry.vertices[i]) > 0.1) {
            return false;;
        }
    }
    return true;
};

var updateSkull = function(dt) {
    isAllBunched = isEveryParticleBunched();

    for (var i = 0; i < particles.length; i++) {
        particles[i].update(dt);
    }

    skull.geometry.colorsNeedUpdate = true;
    skull.geometry.verticesNeedUpdate = true;

    skull.rotation.y = skull.userData.theta;
    skull.userData.theta += dt * 0.5;
    distanceBeingMoved -= distanceBeingMovedDelta * dt; 
};

var update = function(dt) {
    updateSkull(dt);
};

var render = function () {
    requestAnimationFrame(render);
    update(1/60);
    renderer.render(scene, camera);
};

init();
render();
