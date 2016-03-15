var app = app || { };

var scene, camera, renderer, lights = [], skull; 
var particles = [];
var animation = new app.Animation1(particles);

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

var updateSkull = function(dt) {
    animation.update(dt);

    skull.geometry.colorsNeedUpdate = true;
    skull.geometry.verticesNeedUpdate = true;

    skull.rotation.y = skull.userData.theta;
    skull.userData.theta += dt * 0.5;
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
