var scene, camera, renderer, lights = [], skull; 
var distanceBeingMoved = 3, distanceBeingMovedDelta = 0.4
var timeToMoveThroughEye = 1, timeToMoveToBunch = 0.5, timeToMoveBackToOriginalPosition = 8;
var particleStartingColor = new THREE.Color(0xffff00), particleEndingColor = new THREE.Color(0xffa500);

var positionOfEye1 = new THREE.Vector3(0.5, 0.4, 0.5);
var positionOfEye2 = new THREE.Vector3(-0.5, 0.4, 0.5);
var positionToBunchAt = new THREE.Vector3(0, 0.5, 2.0);

var initialParticleModelMat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeRotationY(-0.3), new THREE.Matrix4().makeScale(0.5, 0.5, 0.5));

var particleData = [];

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

        particleData[i] = {
            p : vector3.clone() ,
            v : new THREE.Vector3(0, 0, 0),
            a : new THREE.Vector3(0, 0, 0),
            t : 0,
            state : States.ORIGINAL_POSITION,
            originalPosition : vector3.clone()
        }; 
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
    var isAllBunched = isEveryParticleBunched();

    for (var i = 0; i < skull.geometry.vertices.length; i++) {
        if (particleData[i].state === States.ORIGINAL_POSITION) {

            var distanceToEye1 = particleData[i].originalPosition.distanceTo(positionOfEye1);
            var distanceToEye2 = particleData[i].originalPosition.distanceTo(positionOfEye2);
            var positionOfCloserEye, distanceToCloserEye;

            if (distanceToEye1 < distanceToEye2) {
                distanceToCloserEye = distanceToEye1;
                positionOfCloserEye = positionOfEye1;
            } else {
                distanceToCloserEye = distanceToEye2;
                positionOfCloserEye = positionOfEye2;
            }

            if (distanceToCloserEye > distanceBeingMoved) {
                particleData[i].state = States.MOVING_TO_EYE;

                var a = new THREE.Vector3(0, 0, 1);
                var p = particleData[i].originalPosition;
                var dest = positionOfCloserEye;
                var t = timeToMoveThroughEye;

                particleData[i].v.x = (dest.x - p.x - (1/2) * a.x * t * t) / t;
                particleData[i].v.y = (dest.y - p.y - (1/2) * a.y * t * t) / t;
                particleData[i].v.z = (dest.z - p.z - (1/2) * a.z * t * t) / t;

                particleData[i].a.x = a.x;
                particleData[i].a.y = a.y;
                particleData[i].a.z = a.z;

                particleData[i].t = 0;
            }
            
        } else if (particleData[i].state === States.MOVING_TO_EYE) {
            
            var a = particleData[i].a;
            var v = particleData[i].v;
            var p = particleData[i].p;
            var t = particleData[i].t;

            skull.geometry.vertices[i].x = (1/2) * a.x * t * t + v.x * t + p.x;
            skull.geometry.vertices[i].y = (1/2) * a.y * t * t + v.y * t + p.y;
            skull.geometry.vertices[i].z = (1/2) * a.z * t * t + v.z * t + p.z;

            particleData[i].t += dt;

            skull.geometry.colors[i] = particleStartingColor.clone().lerp(particleEndingColor, t / timeToMoveThroughEye);

            if (t > timeToMoveThroughEye) {
                particleData[i].state = States.MOVING_TO_BUNCH;

                var p = skull.geometry.vertices[i];
                var v = particleData[i].a.multiplyScalar(t).add(particleData[i].v);
                var dest = positionToBunchAt;
                var t = timeToMoveToBunch;

                particleData[i].p.x = p.x;
                particleData[i].p.y = p.y;
                particleData[i].p.z = p.z;

                particleData[i].v.x = v.x;
                particleData[i].v.y = v.y;
                particleData[i].v.z = v.z;

                particleData[i].a.x = (dest.x - p.x - v.x * t) / (1/2 * t * t);
                particleData[i].a.y = (dest.y - p.y - v.y * t) / (1/2 * t * t);
                particleData[i].a.z = (dest.z - p.z - v.z * t) / (1/2 * t * t);

                particleData[i].t = 0;
            }

        } else if (particleData[i].state === States.MOVING_TO_BUNCH) {

            var a = particleData[i].a;
            var v = particleData[i].v;
            var p = particleData[i].p;
            var t = particleData[i].t;

            skull.geometry.vertices[i].x = (1/2) * a.x * t * t + v.x * t + p.x;
            skull.geometry.vertices[i].y = (1/2) * a.y * t * t + v.y * t + p.y;
            skull.geometry.vertices[i].z = (1/2) * a.z * t * t + v.z * t + p.z;

            particleData[i].t += dt;

            skull.geometry.colors[i] = particleStartingColor.clone().lerp(particleEndingColor, (t + timeToMoveThroughEye) / timeToMoveThroughEye);

            if (t > timeToMoveToBunch - 0.01) {
                particleData[i].state = States.WAITING_AT_BUNCH;
            }

        } else if (particleData[i].state === States.WAITING_AT_BUNCH) {

            if (isAllBunched) {
                particleData[i].state = States.MOVING_BACK_TO_ORIGINAL_POSITION;

                var p = skull.geometry.vertices[i];
                var v = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                var dest = particleData[i].originalPosition;
                var t = timeToMoveBackToOriginalPosition;

                particleData[i].p.x = p.x;
                particleData[i].p.y = p.y;
                particleData[i].p.z = p.z;

                particleData[i].v.x = v.x;
                particleData[i].v.y = v.y;
                particleData[i].v.z = v.z;

                particleData[i].a.x = (dest.x - p.x - v.x * t) / (1/2 * t * t);
                particleData[i].a.y = (dest.y - p.y - v.y * t) / (1/2 * t * t);
                particleData[i].a.z = (dest.z - p.z - v.z * t) / (1/2 * t * t);

                particleData[i].t = 0;
            }

        } else if (particleData[i].state === States.MOVING_BACK_TO_ORIGINAL_POSITION) {

            var a = particleData[i].a;
            var v = particleData[i].v;
            var p = particleData[i].p;
            var t = particleData[i].t;

            skull.geometry.vertices[i].x = (1/2) * a.x * t * t + v.x * t + p.x;
            skull.geometry.vertices[i].y = (1/2) * a.y * t * t + v.y * t + p.y;
            skull.geometry.vertices[i].z = (1/2) * a.z * t * t + v.z * t + p.z;

            particleData[i].t += dt;

            skull.geometry.colors[i] = new THREE.Color(0xff0000).lerp(particleStartingColor, t  / timeToMoveBackToOriginalPosition);

            if (t > timeToMoveBackToOriginalPosition) {
                skull.geometry.vertices[i].x = particleData[i].originalPosition.x;
                skull.geometry.vertices[i].y = particleData[i].originalPosition.y;
                skull.geometry.vertices[i].z = particleData[i].originalPosition.z;

                particleData[i].p.x = particleData[i].originalPosition.x;
                particleData[i].p.y = particleData[i].originalPosition.y;
                particleData[i].p.z = particleData[i].originalPosition.z;

                particleData[i].v.x = 0;
                particleData[i].v.y = 0;
                particleData[i].v.z = 0;

                particleData[i].a.x = 0;
                particleData[i].a.y = 0;
                particleData[i].a.z = 0;

                particleData[i].t = 0;

                distanceBeingMoved = 3;

                particleData[i].state = States.ORIGINAL_POSITION;
            }

        }
    }

    skull.rotation.y = skull.userData.theta;

    skull.userData.theta += dt * 0.5;
    distanceBeingMoved -= distanceBeingMovedDelta * dt; 

    skull.geometry.colorsNeedUpdate = true;
    skull.geometry.verticesNeedUpdate = true;
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
