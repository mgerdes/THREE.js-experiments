var app = app || { };

app.Animation5 = function(particles) {
    this.particles = particles;
    //this.isFinished = true;

    var geometry = new THREE.PlaneGeometry(1.0, 1.0);
    var material = new THREE.MeshLambertMaterial({color:0xff0000, side:THREE.DoubleSide});

    var box1Plane1 = new THREE.Mesh(geometry, material);
    box1Plane1.rotation.set(Math.PI / 2.0, 0.0, 0.0);
    box1Plane1.position.set(0.0, 0.5, 0.0);
    var box1 = new THREE.Box3().setFromObject(box1Plane1);

    var box1Plane2 = new THREE.Mesh(geometry, material);
    box1Plane2.position.set(0.0, 0.0, 0.5);
    var box2 = new THREE.Box3().setFromObject(box1Plane2);

    var box1Plane3 = new THREE.Mesh(geometry, material);
    box1Plane3.position.set(0.0, 0.0, -0.5); 
    var box3 = new THREE.Box3().setFromObject(box1Plane3);

    var box1Plane4 = new THREE.Mesh(geometry, material);
    box1Plane4.rotation.set(0.0, Math.PI / 2.0, 0.0);
    box1Plane4.position.set(-0.5, 0.0, 0.0);
    var box4 = new THREE.Box3().setFromObject(box1Plane4);

    var box1Plane5 = new THREE.Mesh(geometry, material);
    box1Plane5.rotation.set(0.0, Math.PI / 2.0, 0.0);
    box1Plane5.position.set(0.5, 0.0, 0.0);
    var box5 = new THREE.Box3().setFromObject(box1Plane5);

    var plane = new THREE.Mesh(geometry, material);
    plane.scale.set(5.0, 5.0, 5.0);
    plane.position.y = -0.5;
    plane.rotation.x = Math.PI / 2.0;
    var box6 = new THREE.Box3().setFromObject(plane);

    this.boxesToFill = [box1, box2, box3, box4, box5, box6];

    //app.scene.add(plane);
    //app.scene.add(box1Plane1);
    //app.scene.add(box1Plane2);
    //app.scene.add(box1Plane3);
    //app.scene.add(box1Plane4);
    //app.scene.add(box1Plane5);
    
    this.particleTargetPositions = [];

    for (var i = 0; i < particles.length; i++) {
        particles[i].state = this.States.ORIGINAL_POSITION;
        particles[i].resetPosition();
        particles[i].setNotMoving();
        this.particleTargetPositions.push(0);
    }
};

app.Animation5.prototype.TIME_TO_MOVE_TO_BOX = 3.0;
app.Animation5.prototype.TIME_TO_MOVE_BACK_TO_SKULL = 3.0;

app.Animation5.prototype.States = {
    ORIGINAL_POSITION: 0, 
    MOVING_TO_BOX: 1,
    MOVING_BACK_TO_SKULL: 2
};

app.Animation5.prototype.update = function(dt) {
    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];
        
        particle.update(dt);

        if (particle.state == this.States.ORIGINAL_POSITION) {
            var boxToFill = this.boxesToFill[Math.floor(Math.random() * this.boxesToFill.length)];
            var boxSize = boxToFill.size();

            var ax = 0.0 * Math.random();
            var ay = 1.0;
            var az = 0.0 * Math.random();
            var a = new THREE.Vector3(ax, ay, az);

            particle.endColor.setRGB(boxToFill.max.x, boxToFill.max.y, boxToFill.max.z); 

            var px = Math.random() * boxSize.x + boxToFill.min.x;
            var py = Math.random() * boxSize.y + boxToFill.min.y;
            var pz = Math.random() * boxSize.z + boxToFill.min.z;
            var p = new THREE.Vector3(px, py, pz);

            particle.setToMoveWithAcceleration(a, p, this.TIME_TO_MOVE_TO_BOX);

            particle.state = this.States.MOVING_TO_BOX;
        }
        else if (particle.state == this.States.MOVING_TO_BOX) {
            if (particle.t > this.TIME_TO_MOVE_TO_BOX) {
                particle.state = this.States.MOVING_BACK_TO_SKULL;
                var temp = particle.startColor;
                particle.startColor = particle.endColor;
                particle.endColor = temp;
                particle.setToMoveWithVelocity(particle.getCurrentVelocity(), particle.positionInSkull, this.TIME_TO_MOVE_BACK_TO_SKULL);
            }
        }
        else if (particle.state == this.States.MOVING_BACK_TO_SKULL) {
            if (particle.t > this.TIME_TO_MOVE_BACK_TO_SKULL) {
                particle.setNotMoving();
                this.isFinished = true;
            }
        }
    }
};
