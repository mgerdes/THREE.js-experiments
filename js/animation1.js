var app = app || { };

app.Animation1 = function(particles) {
    this.particles = particles;
};

app.Animation1.prototype.States = {
    ORIGINAL_POSITION: 0, 
    MOVING_TO_EYE: 1, 
    MOVING_TO_BUNCH: 2, 
    WAITING_AT_BUNCH: 3,
    MOVING_BACK_TO_ORIGINAL_POSITION: 4,
    DO_NOTHING: 5
};

app.Animation1.prototype.positionOfEye1 = new THREE.Vector3(0.5, 0.4, 0.5);
app.Animation1.prototype.positionOfEye2 = new THREE.Vector3(-0.5, 0.4, 0.5);
app.Animation1.prototype.positionToBunchAt = new THREE.Vector3(0, 0.5, 2.0);
app.Animation1.prototype.timeToMoveThroughEye = 1;
app.Animation1.prototype.timeToMoveToBunch = 0.5;
app.Animation1.prototype.timeToMoveBackToOriginalPosition = 8;
app.Animation1.prototype.distanceBeingMoved = 3;

app.Animation1.prototype.isEveryParticleBunched = function() {
    for (var i = 0; i < this.particles.length; i++) {
        if (this.positionToBunchAt.distanceTo(this.particles[i].position) > 0.1) {
            return false;;
        }
    }
    return true;
};

app.Animation1.prototype.update = function(dt) {
    var isAllBunched = this.isEveryParticleBunched();

    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        particle.update(dt);

        if (particle.state == this.States.ORIGINAL_POSITION) {
            var distanceToEye1 = particle.positionInSkull.distanceTo(this.positionOfEye1);
            var distanceToEye2 = particle.positionInSkull.distanceTo(this.positionOfEye2);
            var positionOfCloserEye, distanceToCloserEye;

            if (distanceToEye1 < distanceToEye2) {
                distanceToCloserEye = distanceToEye1;
                positionOfCloserEye = this.positionOfEye1;
            } 
            else {
                distanceToCloserEye = distanceToEye2;
                positionOfCloserEye = this.positionOfEye2;
            }

            if (distanceToCloserEye > this.distanceBeingMoved) {
                particle.state = this.States.MOVING_TO_EYE;
                particle.setToMoveWithAcceleration(new THREE.Vector3(0, 0, 1), positionOfCloserEye, this.timeToMoveThroughEye);
                particle.startColor = new THREE.Color(0xffff00);
                particle.endColor = new THREE.Color(0xffa500);
            }
        } 
        else if (particle.state == this.States.MOVING_TO_EYE) {
            if (particle.t > this.timeToMoveThroughEye) {
                particle.state = this.States.MOVING_TO_BUNCH;
                particle.setToMoveWithVelocity(particle.getCurrentVelocity(), this.positionToBunchAt, this.timeToMoveToBunch);
                particle.startColor = new THREE.Color(0xffa500);
                particle.endColor = new THREE.Color(0xffa500);
            }
        } 
        else if (particle.state == this.States.MOVING_TO_BUNCH) {
            if (particle.t > this.timeToMoveToBunch - 0.01) {
                particle.state = this.States.WAITING_AT_BUNCH;
                particle.setNotMoving();
                particle.startColor = new THREE.Color(0xffa500);
                particle.endColor = new THREE.Color(0xff0000);
            }
        } 
        else if (particle.state == this.States.WAITING_AT_BUNCH) {
            if (isAllBunched) {
                particle.state = this.States.MOVING_BACK_TO_ORIGINAL_POSITION;
                var randomVelocity = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                particle.setToMoveWithVelocity(randomVelocity, particle.positionInSkull, this.timeToMoveBackToOriginalPosition);
                particle.startColor = new THREE.Color(0xff0000);
                particle.endColor = new THREE.Color(0xffff00);
            }
        } 
        else if (particle.state == this.States.MOVING_BACK_TO_ORIGINAL_POSITION) {
            if (particle.t > this.timeToMoveBackToOriginalPosition) {
                particle.state = this.States.ORIGINAL_POSITION;
                this.distanceBeingMoved = 3;
                particle.resetPosition();
                particle.setNotMoving();  
                particle.startColor = new THREE.Color(0xffff00);
                particle.endColor = new THREE.Color(0xffff00);
            }
        }
    }

    this.distanceBeingMoved -= 0.4 * dt; 
};
