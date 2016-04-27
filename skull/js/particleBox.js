var app = app || { };

app.ParticleBox = function(x, y, z, width, height, depth) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.depth = depth;
};

app.ParticleBox.prototype.getRandomPointOnSurface = function() {
    var x = this.x + Math.random() * this.width;
    var y = this.y + Math.random() * this.height;
    var z = this.z + Math.random() * this.depth;

    var boxSide = Math.floor(Math.random() * 6);

    if (boxSide == 0) {
        x = this.x; 
    }
    else if (boxSide == 1) {
        z = this.z;
    }
    else if (boxSide == 2) {
        x = this.x + this.width;
    }
    else if (boxSide == 3) {
        z = this.z + this.depth;
    }
    else if (boxSide == 4) {
        y = this.y + this.height;
    }
    else if (boxSide == 5) {
        y = this.y;
    }

    return new THREE.Vector3(x, y, z);
};
