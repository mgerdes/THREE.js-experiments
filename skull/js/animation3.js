var app = app || { };

app.Animation3 = function(particles) {
    this.particles = particles;
    this.resetDistanceBeingMoved = false;
    this.distanceBeingMoved = 0;
    this.isFinished = false;

    for (var i = 0; i < particles.length; i++) {
        particles[i].state = this.States.ORIGINAL_POSITION;
        particles[i].resetPosition();
        particles[i].setNotMoving();
    }
};

app.Animation3.prototype.States = {
    ORIGINAL_POSITION: 0, 
    MOVING_TO_PROJECTION: 1,
    WAITING_IN_PROJECTED_POSITION: 2,
    MOVING_BACK_TO_ORIGINAL_POSITION: 3,
    FINISHED: 4
};

app.Animation3.prototype.timeToMoveToProjection = 3;

app.Animation3.prototype.isAllFinished = function() {
    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        if (particle.state != this.States.FINISHED) {
            return false;
        }
    }
    return true;
};

app.Animation3.prototype.isAllInProjectedPosition = function() {
    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        var projectionPosition = new THREE.Vector3(particle.positionInSkull.x, particle.positionInSkull.y, -particle.positionInSkull.z);
        if (projectionPosition.distanceTo(particle.position) > 0.1) {
            return false;
        }
    }
    return true;
};

app.Animation3.prototype.update = function(dt) {
    if (this.isAllFinished()) {
        this.isFinished = true;
    }

    var allInProjectedPosition = this.isAllInProjectedPosition();

    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        particle.update(dt);

        if (particle.state == this.States.ORIGINAL_POSITION) {
            var distance = particle.position.distanceTo(new THREE.Vector3(0, 0, 0.5));
            if (distance < this.distanceBeingMoved) {
                particle.state = this.States.MOVING_TO_PROJECTION;
                var projectionPosition = new THREE.Vector3(particle.positionInSkull.x, particle.positionInSkull.y, -particle.positionInSkull.z);
                particle.setToMoveWithAcceleration(new THREE.Vector3(0, 0, 1), projectionPosition, this.timeToMoveToProjection);
                particle.startColor = new THREE.Color(0xffff00);
                particle.endColor = new THREE.Color(0xff0000);
            }
        }  
        else if (particle.state == this.States.MOVING_TO_PROJECTION) {
            if (particle.t > this.timeToMoveToProjection) {
                particle.state = this.States.WAITING_IN_PROJECTED_POSITION;
                particle.position.x = particle.positionInSkull.x;
                particle.position.y = particle.positionInSkull.y;
                particle.position.z = -particle.positionInSkull.z;
                particle.setNotMoving();
            }
        }
        else if (particle.state == this.States.WAITING_IN_PROJECTED_POSITION) {
            if (allInProjectedPosition) {
                if (!this.resetDistanceBeingMoved) {
                    this.resetDistanceBeingMoved = true;
                    this.distanceBeingMoved = 0;
                }
            }
            if (this.resetDistanceBeingMoved) {
                var distance = particle.position.distanceTo(new THREE.Vector3(0, 0, -0.5));
                if (distance < this.distanceBeingMoved) { 
                    particle.state = this.States.MOVING_BACK_TO_ORIGINAL_POSITION;
                    var originalPosition = particle.positionInSkull;
                    particle.setToMoveWithAcceleration(new THREE.Vector3(0, 0, -1), originalPosition, this.timeToMoveToProjection);
                    particle.startColor = new THREE.Color(0xff0000);
                    particle.endColor = new THREE.Color(0xffff00);
                }
            }
        }
        else if (particle.state == this.States.MOVING_BACK_TO_ORIGINAL_POSITION) {
            if (particle.t > this.timeToMoveToProjection) {
                particle.state = this.States.FINISHED;
                particle.setNotMoving();
            }
        }
    }

    this.distanceBeingMoved += 0.2 * dt; 
};
