var app = app || { };

app.AnimationRunner = function(particles) {
    this.currentAnimation = new app.Animation1(particles);
};

app.AnimationRunner.prototype.update = function(dt) {
    if (this.currentAnimation.isFinished) {
        this.currentAnimation = new app.Animation1(particles);
    }
    this.currentAnimation.update(dt);
};
