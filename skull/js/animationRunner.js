var app = app || { };

app.AnimationRunner = function(particles) {
    this.currentAnimation = new app.Animation5(particles);
};

app.AnimationRunner.prototype.update = function(dt) {
    if (this.currentAnimation.isFinished) {
        this.currentAnimation = new app.Animation3(particles);
    }
    this.currentAnimation.update(dt);
};
