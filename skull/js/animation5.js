var app = app || { };

app.Animation5 = function(particles) {
    this.particles = particles;
    this.isFinished = true;

    var planeGeometry = new THREE.PlaneGeometry(10, 10);
    var planeMaterial = new THREE.MeshBasicMaterial({color:0xff0000});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0.0, 0.0, -5.0);

    //app.scene.add(plane);

    for (var i = 0; i < particles.length; i++) {
        particles[i].state = this.States.ORIGINAL_POSITION;
        particles[i].resetPosition();
        particles[i].setNotMoving();
    }
};

app.Animation5.prototype.States = {
    ORIGINAL_POSITION: 0, 
    MOVING_TO_LANDSCAPE: 1
};

app.Animation5.prototype.update = function(dt) {
};
