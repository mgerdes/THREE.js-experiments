var app = app || { };

app.Animation2 = function(particles) {
    this.particles = particles;
};

app.Animation2.prototype.States = {
    ORIGINAL_POSITION: 0, 
    SPLITTING_IN_HALF: 1, 
    MOVING_TO_BUNCH: 2, 
    WAITING_AT_BUNCH: 3,
    MOVING_BACK_TO_ORIGINAL_POSITION: 4,
    FINISHED: 5
};

app.Animation2.prototype.positionOfEye1 = new THREE.Vector3(0.5, 0.4, 0.5);
app.Animation2.prototype.positionOfEye2 = new THREE.Vector3(-0.5, 0.4, 0.5);
app.Animation2.prototype.positionToBunchAt = new THREE.Vector3(0, 0.0, 0.0);
app.Animation2.prototype.timeToSplitInHalf = 1;
app.Animation2.prototype.timeToMoveToBunch = 0.5;
app.Animation2.prototype.timeToMoveBackToOriginalPosition = 8;

app.Animation2.prototype.isEveryParticleBunched = function() {
    for (var i = 0; i < this.particles.length; i++) {
        if (this.positionToBunchAt.distanceTo(this.particles[i].position) > 0.1) {
            return false;
        }
    }
    return true;
};

app.Animation2.prototype.update = function(dt) {
    var isAllBunched = this.isEveryParticleBunched();

    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        particle.update(dt);

        if (particle.state == this.States.ORIGINAL_POSITION) {
            var distanceToEye1 = particle.positionInSkull.distanceTo(this.positionOfEye1);
            var distanceToEye2 = particle.positionInSkull.distanceTo(this.positionOfEye2);
            var positionOfCloserEye, distanceToCloserEye;

            if (distanceToEye1 < distanceToEye2) {
                particle.state = this.States.SPLITTING_IN_HALF;
                var nextPosition = new THREE.Vector3()
                    .addVectors(particle.positionInSkull, new THREE.Vector3(2, -1, 0))
                    .multiplyScalar(3/4);
                particle.setToMoveWithAcceleration(new THREE.Vector3(1, 1, 0), nextPosition, this.timeToSplitInHalf);
                particle.startColor = new THREE.Color(0xffff00);
                particle.endColor = new THREE.Color(0xffa500);
            } 
            else {
                particle.state = this.States.SPLITTING_IN_HALF;
                var nextPosition = new THREE.Vector3()
                    .addVectors(particle.positionInSkull, new THREE.Vector3(-2, -1, 0))
                    .multiplyScalar(3/4);
                particle.setToMoveWithAcceleration(new THREE.Vector3(-1, 1, 0), nextPosition, this.timeToSplitInHalf);
                particle.startColor = new THREE.Color(0xffff00);
                particle.endColor = new THREE.Color(0xffa500);
            }
        }  
        else if (particle.state == this.States.SPLITTING_IN_HALF) {
            if (particle.t > this.timeToSplitInHalf) {
                particle.state = this.States.MOVING_TO_BUNCH;
                particle.setToMoveWithVelocity(particle.getCurrentVelocity(), this.positionToBunchAt, this.timeToMoveToBunch);
                //particle.setToMoveWithAcceleration(new THREE.Vector3(1, 1, 0), this.positionToBunchAt, this.timeToMoveToBunch);
                particle.startColor = new THREE.Color(0xffa500);
                particle.endColor = new THREE.Color(0xff0000);
            }
        }
        else if (particle.state == this.States.MOVING_TO_BUNCH) {
            if (particle.t > this.timeToMoveToBunch) {
                particle.state = this.States.MOVING_BACK_TO_ORIGINAL_POSITION;
                var randomVelocity = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                particle.setToMoveWithVelocity(randomVelocity, particle.positionInSkull, this.timeToMoveBackToOriginalPosition);
                particle.startColor = new THREE.Color(0xff0000);
                particle.endColor = new THREE.Color(0xffff00);
            }
        }
        else if (particle.state == this.States.MOVING_BACK_TO_ORIGINAL_POSITION) {
            if (particle.t > this.timeToMoveBackToOriginalPosition) {
                particle.state = this.States.FINISHED;
                particle.resetPosition();
                particle.setNotMoving();  
                particle.startColor = new THREE.Color(0xffff00);
                particle.endColor = new THREE.Color(0xffff00);
            }
        }
    }

    this.distanceBeingMoved -= 0.4 * dt; 
};
