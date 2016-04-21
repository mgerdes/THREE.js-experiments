var app = app || { }

app.init = function() {
    app.renderer = new THREE.WebGLRenderer({alpha: true});
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.renderer.domElement);

    app.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var width = window.innerWidth;
    var height = window.innerHeight;
    app.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 0, 1);

    app.scene = new THREE.Scene();

    app.tree = new app.AVLTree();
    app.tree.updateNodePositions(app.tree.root, 0, 0);
    app.tree.object.position.y = 200;

    app.scene.add(app.tree.object);

    var addKeyButton = document.getElementById('add-key-button');
    var keyInput = document.getElementById('key-input');

    addKeyButton.addEventListener("click", function() { 
        app.tree.insert(keyInput.value);
        app.tree.updateNodePositions(app.tree.root, 0, 0);
    });
};

app.render = function() {
    requestAnimationFrame(app.render);
    app.renderer.render(app.scene, app.camera);
};

app.init();
app.render();
