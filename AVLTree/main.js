var app = app || { }

app.init = function() {
    app.renderer = new THREE.WebGLRenderer({alpha: true});
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.renderer.domElement);

    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var width = window.innerWidth;
    var height = window.innerHeight;
    app.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1);

    app.scene = new THREE.Scene();

    app.tree = new app.AVLTree();
    app.tree.object.position.y = 200;

    app.scene.add(app.tree.object);

    var addKeyButton = document.getElementById('add-key-button');
    var keyInput = document.getElementById('key-input');
    app.animationSlider = document.getElementById('animation-slider');

    addKeyButton.addEventListener("click", function() { 
        if (!app.tree.isAnimating) {
            app.tree.insert(keyInput.value);
            app.tree.isAnimating = true;
            keyInput.value = '';
        }
    });
};

app.render = function() {
    if (app.tree.currentTime > app.tree.ROTATE_ANIMATION_TIME + app.tree.INSERT_ANIMATION_TIME) {
        app.tree.updateHelper(app.tree.root, app.animationSlider.value / 100);
    }
    else {
        app.animationSlider.value = 100 * app.tree.currentTime / (app.tree.ROTATE_ANIMATION_TIME + app.tree.INSERT_ANIMATION_TIME);
    }
    requestAnimationFrame(app.render);
    app.tree.update(1/60);
    app.renderer.render(app.scene, app.camera);
};

app.init();
app.render();
