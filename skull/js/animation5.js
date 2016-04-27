var app = app || { };

app.Animation5 = function(particles) {
    this.particles = particles;
    //this.isFinished = true;

    var box1 = new app.ParticleBox(-0.5, -0.5, -0.5, 1.0, 1.0, 1.0);
    var box2 = new app.ParticleBox(1.0, -0.5, 1.0, 1.0, 1.0, 1.0);
    var box3 = new app.ParticleBox(-2.0, -0.5, -2.0, 1.0, 1.0, 1.0);
    var plane = new app.ParticleBox(-2.5, -0.5, -2.5, 5.0, 0.001, 5.0);

    this.boxesToFill = [plane, box1, box2, box3];
    this.percentForBox = [0.25, 0.25, 0.25, 0.25];
    
    this.particleTargetPositions = [];
    this.distortionIndex = [];

    for (var i = 0; i < particles.length; i++) {
        particles[i].state = this.States.ORIGINAL_POSITION;
        particles[i].resetPosition();
        particles[i].setNotMoving();
        this.particleTargetPositions.push(0);
        this.distortionIndex.push(0);
    }

    this.distanceBeingMoved = 1;
};

app.Animation5.prototype.START_MOVING_POSITION = new THREE.Vector3(0.0, 0.5, -0.4);
app.Animation5.prototype.DISTANCE_BEING_MOVED_DELTA = 0.2; 

app.Animation5.prototype.TIME_TO_MOVE_TO_BOX = 3.0;
app.Animation5.prototype.TIME_TO_MOVE_BACK_TO_SKULL = 3.0;
app.Animation5.prototype.CHANCE_OF_DISTORTION = 0.8;
app.Animation5.prototype.TIME_OF_DISTORTION = 2.0;
app.Animation5.prototype.DISTORTION_DISTANCE = 0.2;

app.Animation5.prototype.States = {
    ORIGINAL_POSITION: 0, 
    MOVING_TO_BOX: 1,
    BEING_DISTORTED: 2,
    MOVING_BACK_TO_SKULL: 3
};

app.Animation5.prototype.update = function(dt) {
    this.distanceBeingMoved += this.DISTANCE_BEING_MOVED_DELTA * dt;
    var counter = 0;

    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];
        
        particle.update(dt);

        if (particle.state == this.States.ORIGINAL_POSITION) {
            if (particle.position.distanceTo(this.START_MOVING_POSITION) > this.distanceBeingMoved) {
                continue;
            }

            var boxIndex = 0;
            while (boxIndex < this.boxesToFill.length - 1 && this.percentForBox[boxIndex] < 0) {
                boxIndex++;
            }
            this.percentForBox[boxIndex] -= 1 / this.particles.length;

            var boxToFill = this.boxesToFill[boxIndex];

            particle.endColor.setRGB(boxToFill.x + boxToFill.width, boxToFill.y + boxToFill.height, boxToFill.z + boxToFill.depth); 

            var p = boxToFill.getRandomPointOnSurface();

            var ax = Math.random() - 1.0;
            var ay = 0.0;
            var az = Math.random() - 1.0;
            var a = new THREE.Vector3(ax, ay, az);

            particle.setToMoveWithAcceleration(a, p, this.TIME_TO_MOVE_TO_BOX);

            particle.state = this.States.MOVING_TO_BOX;
        }
        else if (particle.state == this.States.MOVING_TO_BOX) {
            if (particle.t > this.TIME_TO_MOVE_TO_BOX) {
                var temp = particle.startColor;
                particle.startColor = particle.endColor;
                particle.endColor = temp;

                this.particleTargetPositions[i] = particle.position.clone();

                this.state = this.States.MOVING_BACK_TO_SKULL;

                particle.setNotMoving();
                //particle.setNotMoving();
            }
        }
        else if (particle.state == this.States.MOVING_BACK_TO_SKULL) {
            //particle.setToMoveWithVelocity(particle.getCurrentVelocity(), particle.positionInSkull, this.TIME_TO_MOVE_BACK_TO_SKULL);
        }
    }
};
