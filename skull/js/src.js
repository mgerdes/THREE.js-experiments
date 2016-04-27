var app = app || { };

var camera, renderer, lights = [], skull; 
var particles = [];
var animationRunner;
var currentTime = 0;

var initRenderer = function() {
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
};

var initCamera = function() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1;
};

var initSkull = function() {
    var initRotationMat = new THREE.Matrix4().makeRotationY(-0.3);
    var initScaleMat = new THREE.Matrix4().makeScale(0.5, 0.5, 0.5);
    var initTranslationMat = new THREE.Matrix4().makeTranslation(0, -3, 0);

    var initialParticleModelMat = new THREE.Matrix4().multiplyMatrices(initRotationMat,
                                                                       new THREE.Matrix4().multiplyMatrices(initScaleMat,
                                                                                                            initTranslationMat));
    var skullPointsGeometry = new THREE.Geometry();
    for (var i = 0; i < skullGeometry.vertices.length / 3; i++) {
        var vector3 = new THREE.Vector3(skullGeometry.vertices[i*3], skullGeometry.vertices[i*3+1], skullGeometry.vertices[i*3+2]);
        vector3.applyMatrix4(initialParticleModelMat);

        skullPointsGeometry.vertices.push(vector3.clone());
        skullPointsGeometry.colors[i] = new THREE.Color(0xffff00);

        particles[i] = new app.Particle(skullPointsGeometry.vertices[i], skullPointsGeometry.colors[i], i);
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
    app.scene = new THREE.Scene();

    for (var i = 0; i < lights.length; i++) {
        app.scene.add(lights[i]);
    }

    app.scene.add(skull);
};

var initAnimationRunner = function() {
    animationRunner = new app.AnimationRunner(particles);
};

var init = function() {
    initRenderer();
    initCamera();
    initLights();
    initSkull();
    initScene();
    initAnimationRunner();
};

var updateSkull = function(dt) {
    animationRunner.update(dt);

    skull.geometry.colorsNeedUpdate = true;
    skull.geometry.verticesNeedUpdate = true;

    skull.rotation.y = skull.userData.theta;
};

var update = function(dt) {
    currentTime += dt;
    updateSkull(dt);

    camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    camera.position.x = 5 * Math.cos(0.5 * currentTime);
    camera.position.z = 5 * Math.sin(0.5 * currentTime);
};

var render = function () {
    requestAnimationFrame(render);
    update(1/60);
    renderer.render(app.scene, camera);
};

init();
render();
