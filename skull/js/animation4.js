var app = app || { };

app.Animation4 = function(particles) {
    this.particles = particles;
    this.isFinished = false;

    for (var i = 0; i < particles.length; i++) {
        particles[i].state = this.States.ORIGINAL_POSITION;
    }
};

app.Animation4.prototype.States = {
    ORIGINAL_POSITION: 0, 
    MOVING_TO_POSITION: 1, 
    MOVING_TO_BUNCH: 2, 
    MOVING_BACK_TO_POSITION: 3,
    MOVING_BACK_TO_ORIGINAL_POSITION: 4,
    FINISHED: 5
};

app.Animation4.prototype.positionsToMoveTo = [
    new THREE.Vector3(5.0, 5.0, 5.0),
    new THREE.Vector3(5.0, 5.0, -5.0),
    new THREE.Vector3(5.0, -5.0, 5.0),
    new THREE.Vector3(5.0, -5.0, -5.0),
    new THREE.Vector3(-5.0, 5.0, 5.0),
    new THREE.Vector3(-5.0, 5.0, -5.0),
    new THREE.Vector3(-5.0, -5.0, 5.0),
    new THREE.Vector3(-5.0, -5.0, -5.0)
];
app.Animation4.prototype.positionToBunchAt = new THREE.Vector3(0, 0, 0);
app.Animation4.prototype.timeToMoveToPosition = 2;
app.Animation4.prototype.timeToMoveToBunch = 2;
app.Animation4.prototype.timeToMoveBackToOriginalPosition = 8;

app.Animation4.prototype.update = function(dt) {
    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        particle.update(dt);

        if (particle.state == this.States.ORIGINAL_POSITION) {
            var positionToMoveTo = this.positionsToMoveTo[particle.i % 8];
            particle.state = this.States.MOVING_TO_POSITION;
            particle.setToMoveWithAcceleration(positionToMoveTo, positionToMoveTo, this.timeToMoveToPosition);
            particle.startColor = new THREE.Color(0xffff00);
            particle.endColor = new THREE.Color(0xffa500);
        } 
        else if (particle.state == this.States.MOVING_TO_POSITION) {
            if (particle.t > this.timeToMoveToPosition) {
                particle.state = this.States.MOVING_TO_BUNCH;
                particle.setToMoveWithVelocity(particle.getCurrentVelocity(), this.positionToBunchAt, this.timeToMoveToBunch);
                particle.startColor = new THREE.Color(0xffa500);
                particle.endColor = new THREE.Color(0xff0000);
            }
        } 
        else if (particle.state == this.States.MOVING_TO_BUNCH) {
            if (particle.t > this.timeToMoveToBunch) {
                particle.state = this.States.MOVING_BACK_TO_ORIGINAL_POSITION;
                particle.timeToReachDestination = this.timeToMoveBackToOriginalPosition + Math.random() * 2;
                var randomVelocity = new THREE.Vector3(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15);
                var positionToMoveTo = this.positionsToMoveTo[particle.i % 8];
                particle.setToMoveWithVelocity(randomVelocity, positionToMoveTo, particle.timeToReachDestination);
                particle.startColor = new THREE.Color(0xff0000);
                particle.endColor = new THREE.Color(0xffff00);
            }
        }
        else if (particle.state == this.States.MOVING_BACK_TO_ORIGINAL_POSITION) {
            if (particle.t > particle.timeToFinish) {
                particle.state = this.States.FINISHED;
                particle.resetPosition();
                particle.setNotMoving();  
                particle.startColor = new THREE.Color(0xffff00);
                particle.endColor = new THREE.Color(0xffff00);
            }
        }
    }
};
