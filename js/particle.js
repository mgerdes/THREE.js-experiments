var app = app || { };

app.Particle = function(position, color) {
    this.position = position;
    this.color = color;
    this.positionInSkull = position.clone();
    this.a0 = new THREE.Vector3(0, 0, 0);
    this.v0 = new THREE.Vector3(0, 0, 0);
    this.p0 = position.clone();
    this.t = 0;
    this.state = States.ORIGINAL_POSITION;
};

app.Particle.prototype.setToMoveWithAcceleration = function(a, p, t) {
    this.p0.x = this.position.x;
    this.p0.y = this.position.y;
    this.p0.z = this.position.z;

    this.v0.x = (p.x - this.position.x - (1/2)*a.x*t*t) / t;
    this.v0.y = (p.y - this.position.y - (1/2)*a.y*t*t) / t;
    this.v0.z = (p.z - this.position.z - (1/2)*a.z*t*t) / t;

    this.a0.x = a.x;
    this.a0.y = a.y;
    this.a0.z = a.z;

    this.t = 0;
};

app.Particle.prototype.setToMoveWithVelocity = function(v, p, t) {
    this.p0.x = this.position.x;
    this.p0.y = this.position.y;
    this.p0.z = this.position.z;

    this.v0.x = v.x;
    this.v0.y = v.y;
    this.v0.z = v.z;

    this.a0.x = (p.x - this.position.x - v.x*t) / (1/2*t*t);
    this.a0.y = (p.y - this.position.y - v.y*t) / (1/2*t*t);
    this.a0.z = (p.z - this.position.z - v.z*t) / (1/2*t*t);

    this.t = 0;
};

app.Particle.prototype.setNotMoving = function() {
    this.p0.x = this.position.x;
    this.p0.y = this.position.y;
    this.p0.z = this.position.z;

    this.v0.x = 0;
    this.v0.y = 0;
    this.v0.z = 0;

    this.a0.x = 0;
    this.a0.y = 0;
    this.a0.z = 0;

    this.t = 0;
};

app.Particle.prototype.resetPosition = function() {
    this.position.x = this.positionInSkull.x;
    this.position.y = this.positionInSkull.y;
    this.position.z = this.positionInSkull.z;
};

app.Particle.prototype.getCurrentVelocity = function() {
    return this.a0.multiplyScalar(this.t).add(this.v0);
};

app.Particle.prototype.updatePosition = function() {
    this.position.x = (1/2)*this.a0.x*this.t*this.t + this.v0.x*this.t + this.p0.x;
    this.position.y = (1/2)*this.a0.y*this.t*this.t + this.v0.y*this.t + this.p0.y;
    this.position.z = (1/2)*this.a0.z*this.t*this.t + this.v0.z*this.t + this.p0.z;
};

app.Particle.prototype.update = function(dt) {
    this.t += dt;
    this.updatePosition();

    if (this.state == States.ORIGINAL_POSITION) {
        var distanceToEye1 = this.positionInSkull.distanceTo(positionOfEye1);
        var distanceToEye2 = this.positionInSkull.distanceTo(positionOfEye2);
        var positionOfCloserEye, distanceToCloserEye;

        if (distanceToEye1 < distanceToEye2) {
            distanceToCloserEye = distanceToEye1;
            positionOfCloserEye = positionOfEye1;
        } else {
            distanceToCloserEye = distanceToEye2;
            positionOfCloserEye = positionOfEye2;
        }

        if (distanceToCloserEye > distanceBeingMoved) {
            this.state = States.MOVING_TO_EYE;
            this.setToMoveWithAcceleration(new THREE.Vector3(0, 0, 1), positionOfCloserEye, timeToMoveThroughEye);
        }
    } 
    else if (this.state == States.MOVING_TO_EYE) {
        if (this.t > timeToMoveThroughEye) {
            this.state = States.MOVING_TO_BUNCH;
            this.setToMoveWithVelocity(this.getCurrentVelocity(), positionToBunchAt, timeToMoveToBunch);
        }
    } 
    else if (this.state == States.MOVING_TO_BUNCH) {
        if (this.t > timeToMoveToBunch - 0.01) {
            this.state = States.WAITING_AT_BUNCH;
            this.setNotMoving();
        }
    } 
    else if (this.state == States.WAITING_AT_BUNCH) {
        if (isAllBunched) {
            this.state = States.MOVING_BACK_TO_ORIGINAL_POSITION;
            var randomVelocity = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            this.setToMoveWithVelocity(randomVelocity, this.positionInSkull, timeToMoveBackToOriginalPosition);
        }
    } 
    else if (this.state == States.MOVING_BACK_TO_ORIGINAL_POSITION) {
        if (this.t > timeToMoveBackToOriginalPosition) {
            this.state = States.ORIGINAL_POSITION;
            distanceBeingMoved = 3;
            this.resetPosition();
            this.setNotMoving();  
        }
    }
};
